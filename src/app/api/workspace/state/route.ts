import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendWorkspaceTeamInvitationEmail } from "@/lib/email";
import { getFirebaseConfigurationStatus } from "@/lib/firebase/admin";
import {
  requireAuthenticatedUser,
  sanitizeUserForClient,
} from "@/lib/workspace/auth";
import {
  createEmptyResearchWorkspace,
  deleteInvitationFromFirestore,
  deleteStartupFromFirestore,
  detectDuplicateStartups,
  extractDomain,
  getWorkspaceDb,
  recordAuditAndActivity,
  saveWorkspaceDb,
} from "@/lib/workspace/db";
import {
  canApproveResearch,
  canDeleteStartup,
  canEditStartup,
  canReviewResearch,
  canViewDocument,
  canViewStartup,
  DEFAULT_ROLE_TEMPLATES,
  hasPermission,
} from "@/lib/workspace/permissions";
import {
  AccessScope,
  CompetitorRecord,
  ConfidentialityLevel,
  DecisionOutcome,
  DecisionRecord,
  DocumentCategory,
  EvaluationDimensionScore,
  LibraryCategory,
  PermissionKey,
  PriorityLevel,
  ResearchAssignment,
  ResearchCitationSource,
  ResearchLibraryEntry,
  RiskEntry,
  SourceType,
  StartupEvaluation,
  StartupRecord,
  StartupSource,
  TaskStatus,
  UserRole,
  UserStatus,
  WorkspaceComment,
  WorkspaceDocument,
  WorkspaceTask,
} from "@/lib/workspace/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authCheck = await requireAuthenticatedUser(request);
  if (!authCheck.ok) return authCheck.response;

  const { user } = authCheck;
  const db = await getWorkspaceDb();

  // Filter startups by user role and record-level access scope
  const visibleStartups = db.startups.filter((st) => canViewStartup(user, st));
  const visibleStartupIds = new Set(visibleStartups.map((st) => st.id));

  // Filter submissions: visible only if user has submission.view or can view the linked startup
  const visibleSubmissions = hasPermission(user, "submission.view")
    ? db.submissions
    : db.submissions.filter((sub) => visibleStartupIds.has(sub.startupId));

  // Filter assignments & research by visible startups or direct assignment
  const visibleAssignments = db.assignments.filter(
    (a) =>
      visibleStartupIds.has(a.startupId) ||
      a.assignedUsers.includes(user.id) ||
      a.primaryResearcherId === user.id
  );

  const visibleResearch = db.research.filter(
    (r) =>
      visibleStartupIds.has(r.startupId) ||
      r.assignedUsers.includes(user.id) ||
      r.primaryResearcherId === user.id
  );

  const visibleSources = db.research_sources.filter(
    (s) => !s.startupId || visibleStartupIds.has(s.startupId)
  );

  const visibleCompetitors = db.competitors.filter((c) =>
    visibleStartupIds.has(c.startupId)
  );

  const visibleEvaluations = db.evaluations.filter((e) =>
    visibleStartupIds.has(e.startupId)
  );

  const visibleDecisions = db.decisions.filter((d) =>
    visibleStartupIds.has(d.startupId)
  );

  const visibleTasks = db.tasks.filter(
    (t) =>
      user.role === "SUPER_ADMIN" ||
      user.role === "INVESTMENT_LEAD" ||
      t.assignedToId === user.id ||
      t.assignedUsers.includes(user.id) ||
      (t.startupId && visibleStartupIds.has(t.startupId))
  );

  const visibleComments = db.comments.filter((c) =>
    visibleStartupIds.has(c.startupId)
  );

  const userNotifications = db.notifications.filter(
    (n) => n.recipientId === user.id
  );

  const visibleDocuments = db.documents.filter((doc) => {
    const startup = doc.startupId
      ? db.startups.find((s) => s.id === doc.startupId)
      : null;
    return canViewDocument(user, doc, startup);
  });

  const visibleActivityLogs = db.activity_logs
    .filter(
      (log) =>
        user.role === "SUPER_ADMIN" ||
        user.role === "INVESTMENT_LEAD" ||
        (log.startupId && visibleStartupIds.has(log.startupId)) ||
        log.actorId === user.id
    )
    .slice(0, 200);

  // Audit logs strictly restricted to SUPER_ADMIN
  const visibleAuditLogs =
    user.role === "SUPER_ADMIN" ? db.audit_logs.slice(0, 300) : [];

  const lightRecruitment = db.recruitment
    ? {
        ...db.recruitment,
        aiInterviewSessions: (db.recruitment.aiInterviewSessions || []).map((s) => ({
          ...s,
          proctoring: {
            ...s.proctoring,
            events: (s.proctoring?.events || []).slice(0, 10),
            snapshots: [],
          },
        })),
      }
    : undefined;

  return NextResponse.json({
    ok: true,
    currentUser: sanitizeUserForClient(user),
    firebaseStatus: getFirebaseConfigurationStatus(),
    data: {
      users: db.users.map(sanitizeUserForClient),
      teams: db.teams,
      invitations:
        user.role === "SUPER_ADMIN" || hasPermission(user, "users.invite")
          ? db.invitations
          : [],
      startups: visibleStartups,
      submissions: visibleSubmissions,
      assignments: visibleAssignments,
      research: visibleResearch,
      research_sources: visibleSources,
      competitors: visibleCompetitors,
      research_templates: db.research_templates,
      scorecards: db.scorecards,
      evaluations: visibleEvaluations,
      decisions: visibleDecisions,
      tasks: visibleTasks,
      comments: visibleComments,
      notifications: userNotifications,
      documents: visibleDocuments,
      research_library: db.research_library,
      pipeline_stages: [...db.pipeline_stages].sort((a, b) => a.order - b.order),
      saved_views: db.saved_views,
      activity_logs: visibleActivityLogs,
      audit_logs: visibleAuditLogs,
      workspace_settings: db.workspace_settings,
      recruitment: lightRecruitment,
    },
  });
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuthenticatedUser(request);
  if (!authCheck.ok) return authCheck.response;

  const { user } = authCheck;
  const db = await getWorkspaceDb();

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const now = new Date().toISOString();

    // =========================================================================
    // 1. DUPLICATE DETECTION CHECK
    // =========================================================================
    if (action === "startup.check_duplicates") {
      const matches = detectDuplicateStartups(db, {
        name: body.name,
        website: body.website,
        founderEmail: body.founderEmail,
        excludeStartupId: body.excludeStartupId,
      });
      return NextResponse.json({ ok: true, matches });
    }

    // =========================================================================
    // 2. CREATE STARTUP
    // =========================================================================
    if (action === "startup.create") {
      if (!hasPermission(user, "startup.create")) {
        return NextResponse.json(
          { ok: false, message: "You do not have permission to create startup records." },
          { status: 403 }
        );
      }

      const name = String(body.name || "").trim();
      const sector = String(body.sector || "").trim();
      const description = String(body.description || "").trim();

      if (name.length < 2) {
        return NextResponse.json(
          { ok: false, message: "Startup name must be at least 2 characters." },
          { status: 400 }
        );
      }
      if (!sector) {
        return NextResponse.json(
          { ok: false, message: "Sector classification is required." },
          { status: 400 }
        );
      }

      // Check duplicates unless forceCreate is explicitly passed
      const duplicates = detectDuplicateStartups(db, {
        name,
        website: body.website,
        founderEmail: body.founderEmail,
      });

      if (duplicates.length > 0 && !body.allowDuplicate) {
        return NextResponse.json(
          {
            ok: false,
            error: "duplicate_detected",
            matches: duplicates,
            message: `Potential duplicate detected (${duplicates[0]!.name}). Inspect existing record or confirm creation.`,
          },
          { status: 409 }
        );
      }

      const nextNum = db.startups.length + 1;
      const startupCode = `DVC-ST-${String(nextNum).padStart(4, "0")}`;
      const startupId = `startup-${Date.now().toString(36)}-${crypto.randomBytes(2).toString("hex")}`;

      // If created by an intern, enforce source = "Intern Research" and assign to them
      const source: StartupSource =
        user.role === "RESEARCH_ANALYST"
          ? "Intern Research"
          : (body.source as StartupSource) || "Direct Outreach";

      const assignedLeadId = body.assignedLeadId || "user-siddharth";
      const leadUser = db.users.find((u) => u.id === assignedLeadId);
      const assignedResearcherId = body.assignedResearcherId || user.id;
      const researcherUser = db.users.find((u) => u.id === assignedResearcherId);
      const reviewerId = body.reviewerId || "user-siddharth";
      const reviewerUser = db.users.find((u) => u.id === reviewerId);

      // Persist custom sector or industry dynamically if new
      if (sector && !db.workspace_settings.customSectors.includes(sector)) {
        db.workspace_settings.customSectors.push(sector);
      }
      if (
        body.industry &&
        !db.workspace_settings.customIndustries.includes(String(body.industry).trim())
      ) {
        db.workspace_settings.customIndustries.push(String(body.industry).trim());
      }

      const assignedUsers = Array.from(
        new Set(
          [
            user.id,
            assignedLeadId,
            assignedResearcherId,
            reviewerId,
            ...(Array.isArray(body.collaboratorIds) ? body.collaboratorIds : []),
          ].filter(Boolean) as string[]
        )
      );

      const newStartup: StartupRecord = {
        id: startupId,
        startupCode,
        name,
        website: body.website ? String(body.website).trim() : "",
        domain: extractDomain(body.website),
        description,
        headquarters: String(body.headquarters || "India").trim(),
        country: String(body.country || "India").trim(),
        sector,
        industry: String(body.industry || sector).trim(),
        vertical: String(body.vertical || "").trim(),
        yearFounded: String(body.yearFounded || new Date().getFullYear()).trim(),
        incorporationStatus: String(body.incorporationStatus || "Private Limited").trim(),
        companyType: String(body.companyType || "Private Company").trim(),
        founders: [
          {
            id: `founder-${Date.now().toString(36)}`,
            name: String(body.founderName || "Founder").trim(),
            email: String(body.founderEmail || "").trim().toLowerCase(),
            phone: String(body.founderPhone || "").trim(),
            linkedinUrl: String(body.founderLinkedin || "").trim(),
            role: String(body.founderRole || "Founder & CEO").trim(),
            isPrimary: true,
            previousExperience: String(body.founderExperience || "").trim(),
            background: String(body.founderBackground || "").trim(),
            education: String(body.founderEducation || "").trim(),
          },
        ],
        business: {
          problemAddressed: String(body.problemAddressed || description).trim(),
          productService: String(body.productService || "").trim(),
          valueProposition: String(body.valueProposition || "").trim(),
          businessModel: String(body.businessModel || "").trim(),
          targetCustomers: String(body.targetCustomers || "").trim(),
          customerSegments: String(body.customerSegments || "").trim(),
          distributionChannels: String(body.distributionChannels || "").trim(),
          revenueModel: String(body.revenueModel || "").trim(),
        },
        traction: {
          currentRevenue: String(body.currentRevenue || "").trim(),
          arrMrr: String(body.arrMrr || "").trim(),
          revenueGrowth: String(body.revenueGrowth || "").trim(),
          payingCustomers: String(body.payingCustomers || "").trim(),
          userCount: String(body.userCount || "").trim(),
          retention: String(body.retention || "").trim(),
          majorCustomers: String(body.majorCustomers || "").trim(),
          geographicPresence: String(body.geographicPresence || "India").trim(),
          dataClassification: body.dataClassification || "founder_reported",
        },
        funding: {
          currentStage: String(body.fundingStage || "Pre-Seed").trim(),
          fundingSought: String(body.fundingSought || "").trim(),
          previouslyRaised: String(body.previouslyRaised || "").trim(),
          previousRounds: String(body.previousRounds || "").trim(),
          existingInvestors: String(body.existingInvestors || "").trim(),
          proposedValuation: String(body.proposedValuation || "").trim(),
          instrument: String(body.instrument || "").trim(),
          useOfFunds: String(body.useOfFunds || "").trim(),
        },
        pipelineStage:
          user.role === "RESEARCH_ANALYST"
            ? "Research in Progress"
            : String(body.pipelineStage || "Initial Screening"),
        stageUpdatedAt: now,
        priority: (body.priority as PriorityLevel) || "Medium",
        assignedLeadId,
        assignedLeadName: leadUser?.name || "Siddharth Kaushik",
        assignedResearcherId,
        assignedResearcherName: researcherUser?.name || user.name,
        reviewerId,
        reviewerName: reviewerUser?.name || "Ravi Kaushik",
        collaboratorIds: Array.isArray(body.collaboratorIds) ? body.collaboratorIds : [],
        collaboratorNames: [],
        assignedUsers,
        source,
        originalSubmissionId: null,
        originalSubmissionRef: null,
        tags: Array.isArray(body.tags)
          ? body.tags
          : [sector.split("&")[0]?.trim() || "Startup", source],
        internalSummary: String(body.internalSummary || "").trim(),
        nextFollowUpAt:
          body.nextFollowUpAt ||
          new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        archived: false,
        latestDecision: null,
        decisionHistory: [],
        createdAt: now,
        updatedAt: now,
        createdBy: user.id,
        createdByName: user.name,
        updatedBy: user.id,
        updatedByName: user.name,
      };

      db.startups.unshift(newStartup);

      // Initialize structured research workspace for this startup
      const researchId = `res-${newStartup.id}`;
      const researchWorkspace = createEmptyResearchWorkspace({
        id: researchId,
        startup: newStartup,
        primaryResearcherId: assignedResearcherId,
        primaryResearcherName: researcherUser?.name || user.name,
        reviewerId,
        reviewerName: reviewerUser?.name || "Ravi Kaushik",
      });
      db.research.unshift(researchWorkspace);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "startup.created",
        entityType: "startup",
        entityId: newStartup.id,
        entityName: newStartup.name,
        startupId: newStartup.id,
        summary: `${user.name} added ${newStartup.name} (${newStartup.startupCode}) with source '${source}'`,
        newValue: newStartup.pipelineStage,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, startup: newStartup, research: researchWorkspace });
    }

    // =========================================================================
    // 3. UPDATE STARTUP PROFILE / STAGE / BULK OPERATIONS / MERGE
    // =========================================================================
    if (action === "startup.update") {
      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!startup) {
        return NextResponse.json({ ok: false, message: "Startup not found." }, { status: 404 });
      }
      if (!canEditStartup(user, startup)) {
        return NextResponse.json(
          { ok: false, message: "Forbidden: You cannot edit this startup." },
          { status: 403 }
        );
      }

      const prevStage = startup.pipelineStage;
      const updates = body.updates || {};

      if (updates.name) startup.name = String(updates.name).trim();
      if (updates.website !== undefined) {
        startup.website = String(updates.website).trim();
        startup.domain = extractDomain(startup.website);
      }
      if (updates.description !== undefined) startup.description = String(updates.description).trim();
      if (updates.headquarters !== undefined) startup.headquarters = String(updates.headquarters).trim();
      if (updates.country !== undefined) startup.country = String(updates.country).trim();
      if (updates.sector) {
        startup.sector = String(updates.sector).trim();
        if (!db.workspace_settings.customSectors.includes(startup.sector)) {
          db.workspace_settings.customSectors.push(startup.sector);
        }
      }
      if (updates.industry !== undefined) {
        startup.industry = String(updates.industry).trim();
        if (
          startup.industry &&
          !db.workspace_settings.customIndustries.includes(startup.industry)
        ) {
          db.workspace_settings.customIndustries.push(startup.industry);
        }
      }
      if (updates.vertical !== undefined) startup.vertical = String(updates.vertical).trim();
      if (updates.yearFounded !== undefined) startup.yearFounded = String(updates.yearFounded).trim();
      if (updates.incorporationStatus !== undefined)
        startup.incorporationStatus = String(updates.incorporationStatus).trim();
      if (updates.companyType !== undefined) startup.companyType = String(updates.companyType).trim();
      if (updates.priority) startup.priority = updates.priority;
      if (updates.internalSummary !== undefined)
        startup.internalSummary = String(updates.internalSummary).trim();
      if (updates.nextFollowUpAt !== undefined) startup.nextFollowUpAt = updates.nextFollowUpAt;
      if (Array.isArray(updates.tags)) startup.tags = updates.tags;
      if (Array.isArray(updates.founders)) startup.founders = updates.founders;
      if (updates.business) startup.business = { ...startup.business, ...updates.business };
      if (updates.traction) startup.traction = { ...startup.traction, ...updates.traction };
      if (updates.funding) startup.funding = { ...startup.funding, ...updates.funding };

      if (updates.assignedResearcherId) {
        const resUser = db.users.find((u) => u.id === updates.assignedResearcherId);
        startup.assignedResearcherId = updates.assignedResearcherId;
        startup.assignedResearcherName = resUser?.name || startup.assignedResearcherName;
        if (!startup.assignedUsers.includes(updates.assignedResearcherId)) {
          startup.assignedUsers.push(updates.assignedResearcherId);
        }
      }

      if (updates.assignedLeadId) {
        const leadUser = db.users.find((u) => u.id === updates.assignedLeadId);
        startup.assignedLeadId = updates.assignedLeadId;
        startup.assignedLeadName = leadUser?.name || startup.assignedLeadName;
        if (!startup.assignedUsers.includes(updates.assignedLeadId)) {
          startup.assignedUsers.push(updates.assignedLeadId);
        }
      }

      if (updates.pipelineStage && updates.pipelineStage !== prevStage) {
        startup.pipelineStage = updates.pipelineStage;
        startup.stageUpdatedAt = now;
        await recordAuditAndActivity(db, {
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: "startup.stage_changed",
          entityType: "startup",
          entityId: startup.id,
          entityName: startup.name,
          startupId: startup.id,
          summary: `${user.name} moved ${startup.name} from '${prevStage}' to '${startup.pipelineStage}'`,
          previousValue: prevStage,
          newValue: startup.pipelineStage,
        });
      } else {
        await recordAuditAndActivity(db, {
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: "startup.updated",
          entityType: "startup",
          entityId: startup.id,
          entityName: startup.name,
          startupId: startup.id,
          summary: `${user.name} updated company intelligence for ${startup.name}`,
        });
      }

      startup.updatedAt = now;
      startup.updatedBy = user.id;
      startup.updatedByName = user.name;

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, startup });
    }

    if (action === "startup.bulk_update") {
      if (!hasPermission(user, "startup.edit")) {
        return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
      }
      const startupIds: string[] = Array.isArray(body.startupIds) ? body.startupIds : [];
      const targetStage = body.pipelineStage;
      const targetResearcherId = body.assignedResearcherId;
      const addTag = body.addTag ? String(body.addTag).trim() : "";

      const researcherUser = targetResearcherId
        ? db.users.find((u) => u.id === targetResearcherId)
        : null;

      let updatedCount = 0;
      for (const id of startupIds) {
        const st = db.startups.find((s) => s.id === id);
        if (!st || !canEditStartup(user, st)) continue;

        if (targetStage) {
          st.pipelineStage = targetStage;
          st.stageUpdatedAt = now;
        }
        if (targetResearcherId && researcherUser) {
          st.assignedResearcherId = researcherUser.id;
          st.assignedResearcherName = researcherUser.name;
          if (!st.assignedUsers.includes(researcherUser.id)) {
            st.assignedUsers.push(researcherUser.id);
          }
          db.notifications.unshift({
            id: `notif-bulk-${Date.now()}-${st.id}`,
            recipientId: researcherUser.id,
            type: "assignment",
            title: `Assigned Startup: ${st.name}`,
            message: `${user.name} assigned ${st.name} to your research queue.`,
            startupId: st.id,
            link: `/workspace/startups/${st.id}`,
            read: false,
            actorId: user.id,
            actorName: user.name,
            createdAt: now,
          });
        }
        if (addTag && !st.tags.includes(addTag)) {
          st.tags.push(addTag);
        }
        st.updatedAt = now;
        st.updatedBy = user.id;
        st.updatedByName = user.name;
        updatedCount++;
      }

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "startup.bulk_updated",
        entityType: "startup",
        entityId: "bulk",
        entityName: `${updatedCount} startups`,
        summary: `${user.name} performed bulk update on ${updatedCount} startup records`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, updatedCount });
    }

    if (action === "startup.merge_duplicate") {
      if (user.role !== "SUPER_ADMIN" && user.role !== "INVESTMENT_LEAD") {
        return NextResponse.json(
          { ok: false, message: "Only Super Admins or Investment Leads can merge startup records." },
          { status: 403 }
        );
      }

      const sourceStartupId = String(body.sourceStartupId || "");
      const targetStartupId = String(body.targetStartupId || "");

      const sourceSt = db.startups.find((s) => s.id === sourceStartupId);
      const targetSt = db.startups.find((s) => s.id === targetStartupId);

      if (!sourceSt || !targetSt || sourceSt.id === targetSt.id) {
        return NextResponse.json(
          { ok: false, message: "Valid source and target startup records are required for merge." },
          { status: 400 }
        );
      }

      // Preserve founders, tags, submissions, documents, sources, comments, tasks, and activity logs
      for (const f of sourceSt.founders) {
        if (!targetSt.founders.some((tf) => tf.email.toLowerCase() === f.email.toLowerCase())) {
          targetSt.founders.push({ ...f, isPrimary: false });
        }
      }
      targetSt.tags = Array.from(new Set([...targetSt.tags, ...sourceSt.tags]));
      targetSt.assignedUsers = Array.from(
        new Set([...targetSt.assignedUsers, ...sourceSt.assignedUsers])
      );

      for (const sub of db.submissions) {
        if (sub.startupId === sourceSt.id) {
          sub.startupId = targetSt.id;
          sub.status = "merged";
        }
      }
      for (const doc of db.documents) {
        if (doc.startupId === sourceSt.id) {
          doc.startupId = targetSt.id;
          doc.startupName = targetSt.name;
        }
      }
      for (const src of db.research_sources) {
        if (src.startupId === sourceSt.id) src.startupId = targetSt.id;
      }
      for (const comp of db.competitors) {
        if (comp.startupId === sourceSt.id) {
          comp.startupId = targetSt.id;
          comp.startupName = targetSt.name;
        }
      }
      for (const c of db.comments) {
        if (c.startupId === sourceSt.id) c.startupId = targetSt.id;
      }
      for (const t of db.tasks) {
        if (t.startupId === sourceSt.id) {
          t.startupId = targetSt.id;
          t.startupName = targetSt.name;
        }
      }
      for (const log of db.activity_logs) {
        if (log.startupId === sourceSt.id) log.startupId = targetSt.id;
      }

      sourceSt.archived = true;
      sourceSt.internalSummary = `[Merged into ${targetSt.startupCode} (${targetSt.name}) on ${now}] ${sourceSt.internalSummary || ""}`;
      targetSt.updatedAt = now;

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "startup.merged",
        entityType: "startup",
        entityId: targetSt.id,
        entityName: targetSt.name,
        startupId: targetSt.id,
        summary: `${user.name} merged duplicate record ${sourceSt.startupCode} (${sourceSt.name}) into ${targetSt.startupCode} (${targetSt.name}) preserving all submissions, documents, and research`,
        previousValue: sourceSt.startupCode,
        newValue: targetSt.startupCode,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, targetStartup: targetSt });
    }

    if (action === "startup.delete") {
      if (!canDeleteStartup(user)) {
        return NextResponse.json(
          { ok: false, message: "Only Super Admins are permitted to delete startup records." },
          { status: 403 }
        );
      }
      const startupId = String(body.startupId || "");
      const idx = db.startups.findIndex((s) => s.id === startupId);
      if (idx === -1) {
        return NextResponse.json({ ok: false, message: "Startup not found." }, { status: 404 });
      }
      const removed = db.startups[idx]!;
      db.startups.splice(idx, 1);
      await deleteStartupFromFirestore(startupId);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "startup.deleted",
        entityType: "startup",
        entityId: removed.id,
        entityName: removed.name,
        summary: `${user.name} permanently deleted startup record ${removed.name} (${removed.startupCode})`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 4. RESEARCH ASSIGNMENTS (Workflow A & C)
    // =========================================================================
    if (action === "assignment.create") {
      if (!hasPermission(user, "task.assign")) {
        return NextResponse.json(
          { ok: false, message: "You do not have permission to assign research." },
          { status: 403 }
        );
      }

      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!startup) {
        return NextResponse.json({ ok: false, message: "Startup not found." }, { status: 404 });
      }

      const primaryResearcher = db.users.find((u) => u.id === body.primaryResearcherId);
      if (!primaryResearcher) {
        return NextResponse.json(
          { ok: false, message: "Primary researcher is required." },
          { status: 400 }
        );
      }

      const collaboratorIds: string[] = Array.isArray(body.collaboratorIds)
        ? body.collaboratorIds
        : [];
      const collaboratorNames = collaboratorIds
        .map((cid) => db.users.find((u) => u.id === cid)?.name)
        .filter((n): n is string => Boolean(n));

      const reviewer = db.users.find((u) => u.id === (body.reviewerId || "user-siddharth"));
      const reviewerId = reviewer?.id || user.id;
      const reviewerName = reviewer?.name || user.name;

      const template =
        db.research_templates.find((t) => t.id === body.templateId) ||
        db.research_templates[1]!;

      const checklistTextList: string[] = Array.isArray(body.checklist)
        ? body.checklist
        : template.defaultChecklist;

      const assignedUsers = Array.from(
        new Set([primaryResearcher.id, ...collaboratorIds, reviewerId, user.id])
      );

      // Update startup ownership & pipeline stage
      startup.assignedResearcherId = primaryResearcher.id;
      startup.assignedResearcherName = primaryResearcher.name;
      startup.reviewerId = reviewerId;
      startup.reviewerName = reviewerName;
      startup.collaboratorIds = collaboratorIds;
      startup.collaboratorNames = collaboratorNames;
      startup.assignedUsers = Array.from(new Set([...startup.assignedUsers, ...assignedUsers]));
      if (
        startup.pipelineStage === "New Submission" ||
        startup.pipelineStage === "Initial Screening"
      ) {
        startup.pipelineStage = "Research in Progress";
        startup.stageUpdatedAt = now;
      }
      startup.updatedAt = now;

      // Ensure research workspace exists and is updated
      let researchWorkspace = db.research.find((r) => r.startupId === startup.id);
      const assignmentId = `asgn-${Date.now().toString(36)}`;

      if (!researchWorkspace) {
        researchWorkspace = createEmptyResearchWorkspace({
          id: `res-${startup.id}`,
          startup,
          assignmentId,
          templateId: template.id,
          primaryResearcherId: primaryResearcher.id,
          primaryResearcherName: primaryResearcher.name,
          collaboratorIds,
          collaboratorNames,
          reviewerId,
          reviewerName,
        });
        db.research.unshift(researchWorkspace);
      } else {
        researchWorkspace.assignmentId = assignmentId;
        researchWorkspace.primaryResearcherId = primaryResearcher.id;
        researchWorkspace.primaryResearcherName = primaryResearcher.name;
        researchWorkspace.collaboratorIds = collaboratorIds;
        researchWorkspace.collaboratorNames = collaboratorNames;
        researchWorkspace.reviewerId = reviewerId;
        researchWorkspace.reviewerName = reviewerName;
        researchWorkspace.assignedUsers = Array.from(
          new Set([...researchWorkspace.assignedUsers, ...assignedUsers])
        );
      }

      const newAssignment: ResearchAssignment = {
        id: assignmentId,
        startupId: startup.id,
        startupName: startup.name,
        startupCode: startup.startupCode,
        title:
          String(body.title || "").trim() ||
          `${template.name} — ${startup.name}`,
        primaryResearcherId: primaryResearcher.id,
        primaryResearcherName: primaryResearcher.name,
        collaboratorIds,
        collaboratorNames,
        reviewerId,
        reviewerName,
        assignedUsers,
        dueDate:
          body.dueDate ||
          new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: (body.priority as PriorityLevel) || startup.priority,
        status: "Assigned",
        objectives: String(body.objectives || template.defaultObjectives).trim(),
        instructions: String(body.instructions || template.defaultInstructions).trim(),
        templateId: template.id,
        checklist: checklistTextList.map((text, idx) => ({
          id: `chk-${idx + 1}`,
          text: String(text),
          completed: false,
        })),
        researchId: researchWorkspace.id,
        createdAt: now,
        updatedAt: now,
        createdBy: user.id,
        createdByName: user.name,
      };

      // Replace or add assignment
      const existingIdx = db.assignments.findIndex((a) => a.startupId === startup.id);
      if (existingIdx !== -1) {
        db.assignments[existingIdx] = newAssignment;
      } else {
        db.assignments.unshift(newAssignment);
      }

      // Notify primary researcher & collaborators
      for (const recipientId of [primaryResearcher.id, ...collaboratorIds]) {
        db.notifications.unshift({
          id: `notif-asgn-${Date.now()}-${recipientId}`,
          recipientId,
          type: "assignment",
          title: `New Research Assignment: ${startup.name}`,
          message: `${user.name} assigned you to research ${startup.name} (${template.name}). Due ${new Date(newAssignment.dueDate).toLocaleDateString()}.`,
          startupId: startup.id,
          entityId: newAssignment.id,
          link: `/workspace/startups/${startup.id}?tab=research`,
          read: false,
          actorId: user.id,
          actorName: user.name,
          createdAt: now,
        });
      }

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "research.assigned",
        entityType: "assignment",
        entityId: newAssignment.id,
        entityName: startup.name,
        startupId: startup.id,
        summary: `${user.name} assigned research on ${startup.name} to ${primaryResearcher.name}${collaboratorNames.length ? ` (with ${collaboratorNames.join(", ")})` : ""}`,
        newValue: primaryResearcher.name,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({
        ok: true,
        assignment: newAssignment,
        research: researchWorkspace,
        startup,
      });
    }

    if (action === "assignment.toggle_checklist") {
      const asgn = db.assignments.find((a) => a.id === body.assignmentId);
      if (!asgn) {
        return NextResponse.json({ ok: false, message: "Assignment not found." }, { status: 404 });
      }
      const item = asgn.checklist.find((c) => c.id === body.itemId);
      if (item) {
        item.completed = !item.completed;
        item.completedBy = item.completed ? user.name : undefined;
        item.completedAt = item.completed ? now : undefined;
      }
      if (asgn.status === "Assigned") {
        asgn.status = "In Progress";
      }
      asgn.updatedAt = now;
      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, assignment: asgn });
    }

    // =========================================================================
    // 5. STRUCTURED RESEARCH WORKSPACE, CITATIONS, COMPETITORS & REVIEW
    // =========================================================================
    if (action === "research.save" || action === "research.submit") {
      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!startup) {
        return NextResponse.json({ ok: false, message: "Startup not found." }, { status: 404 });
      }
      if (
        !hasPermission(user, "research.edit_own") &&
        !hasPermission(user, "research.edit_all")
      ) {
        return NextResponse.json(
          { ok: false, message: "You do not have permission to edit research." },
          { status: 403 }
        );
      }

      let research = db.research.find((r) => r.startupId === startup.id);
      if (!research) {
        research = createEmptyResearchWorkspace({
          id: `res-${startup.id}`,
          startup,
          primaryResearcherId: user.id,
          primaryResearcherName: user.name,
        });
        db.research.unshift(research);
      }

      const payload = body.researchData || {};

      // NON-NEGOTIABLE VALIDATION (Part 7.2.C):
      // Do not allow analysts to enter a TAM number without its source and calculation methodology!
      const incomingMarket = payload.marketResearch || research.marketResearch;
      if (incomingMarket?.tam && String(incomingMarket.tam).trim().length > 0) {
        const tamSource = String(incomingMarket.tamSource || "").trim();
        const tamMethodology = String(incomingMarket.tamMethodology || "").trim();
        if (!tamSource || !tamMethodology) {
          return NextResponse.json(
            {
              ok: false,
              error: "tam_citation_required",
              message:
                "Market Research Policy: You cannot enter a TAM figure without providing both its verified Source URL/Title and the Calculation Methodology.",
            },
            { status: 400 }
          );
        }
      }

      if (payload.companyOverview) {
        research.companyOverview = { ...research.companyOverview, ...payload.companyOverview };
      }
      if (payload.founderResearch) {
        research.founderResearch = { ...research.founderResearch, ...payload.founderResearch };
      }
      if (payload.marketResearch) {
        research.marketResearch = { ...research.marketResearch, ...payload.marketResearch };
      }
      if (payload.productResearch) {
        research.productResearch = { ...research.productResearch, ...payload.productResearch };
      }
      if (payload.businessModel) {
        research.businessModel = { ...research.businessModel, ...payload.businessModel };
      }
      if (payload.tractionFinancials) {
        research.tractionFinancials = {
          ...research.tractionFinancials,
          ...payload.tractionFinancials,
        };
      }
      if (Array.isArray(payload.risksRedFlags)) {
        research.risksRedFlags = payload.risksRedFlags as RiskEntry[];
      }
      if (payload.conclusion) {
        research.conclusion = { ...research.conclusion, ...payload.conclusion };
      }

      research.updatedAt = now;

      const asgn = db.assignments.find((a) => a.startupId === startup.id);

      if (action === "research.submit") {
        if (!hasPermission(user, "research.submit")) {
          return NextResponse.json(
            { ok: false, message: "You do not have permission to submit research for review." },
            { status: 403 }
          );
        }

        if (!research.conclusion.executiveSummary.trim()) {
          return NextResponse.json(
            {
              ok: false,
              message:
                "Please complete the Executive Summary in Section I (Overall Research Conclusion) before submitting for review.",
            },
            { status: 400 }
          );
        }

        research.version += 1;
        research.status = "submitted";
        research.submittedAt = now;
        research.versionHistory.unshift({
          version: research.version,
          savedAt: now,
          savedBy: user.id,
          savedByName: user.name,
          status: "submitted",
          summaryNote: String(body.submissionNote || "Submitted completed research for review"),
        });
        research.reviewHistory.unshift({
          id: `rev-${Date.now().toString(36)}`,
          version: research.version,
          action: "submitted",
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          feedback: String(body.submissionNote || "Submitted completed research for review."),
          createdAt: now,
        });

        if (asgn) {
          asgn.status = "Submitted for Review";
          asgn.updatedAt = now;
        }

        if (
          startup.pipelineStage === "New Submission" ||
          startup.pipelineStage === "Initial Screening" ||
          startup.pipelineStage === "Research in Progress"
        ) {
          startup.pipelineStage = "Internal Review";
          startup.stageUpdatedAt = now;
          startup.updatedAt = now;
        }

        const reviewerId = research.reviewerId || startup.reviewerId || "user-ravi";
        db.notifications.unshift({
          id: `notif-rev-req-${Date.now()}`,
          recipientId: reviewerId,
          type: "review_request",
          title: `Research Awaiting Review: ${startup.name}`,
          message: `${user.name} submitted v${research.version} research on ${startup.name} for your review.`,
          startupId: startup.id,
          entityId: research.id,
          link: `/workspace/startups/${startup.id}?tab=research`,
          read: false,
          actorId: user.id,
          actorName: user.name,
          createdAt: now,
        });

        await recordAuditAndActivity(db, {
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: "research.submitted",
          entityType: "research",
          entityId: research.id,
          entityName: startup.name,
          startupId: startup.id,
          summary: `${user.name} submitted research v${research.version} on ${startup.name} for review`,
          newValue: "Submitted for Review",
        });
      } else {
        if (asgn && asgn.status === "Assigned") {
          asgn.status = "In Progress";
          asgn.updatedAt = now;
        }
        await recordAuditAndActivity(db, {
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: "research.updated",
          entityType: "research",
          entityId: research.id,
          entityName: startup.name,
          startupId: startup.id,
          summary: `${user.name} saved research draft (v${research.version}) for ${startup.name}`,
        });
      }

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, research, startup, assignment: asgn });
    }

    if (action === "research.review") {
      const startup = db.startups.find((s) => s.id === body.startupId);
      const research = db.research.find((r) => r.startupId === body.startupId);
      if (!startup || !research) {
        return NextResponse.json({ ok: false, message: "Research record not found." }, { status: 404 });
      }

      const reviewAction = body.reviewAction as
        | "approved"
        | "revision_requested"
        | "reassigned";

      if (reviewAction === "approved") {
        if (!canApproveResearch(user, research)) {
          return NextResponse.json(
            {
              ok: false,
              message:
                "Forbidden: Interns cannot approve research, and researchers cannot self-approve their own work.",
            },
            { status: 403 }
          );
        }
      } else if (!canReviewResearch(user, research)) {
        return NextResponse.json(
          { ok: false, message: "Forbidden: You are not authorised to review this research." },
          { status: 403 }
        );
      }

      const feedback = String(body.feedback || "").trim();
      if (!feedback) {
        return NextResponse.json(
          { ok: false, message: "Please provide written review feedback." },
          { status: 400 }
        );
      }

      const asgn = db.assignments.find((a) => a.startupId === startup.id);

      research.reviewHistory.unshift({
        id: `rev-${Date.now().toString(36)}`,
        version: research.version,
        action: reviewAction,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        feedback,
        missingEvidence: body.missingEvidence ? String(body.missingEvidence).trim() : undefined,
        additionalAnalysisRequested: body.additionalAnalysisRequested
          ? String(body.additionalAnalysisRequested).trim()
          : undefined,
        createdAt: now,
      });

      if (reviewAction === "approved") {
        research.status = "approved";
        research.approvedAt = now;
        research.approvedBy = user.id;
        research.approvedByName = user.name;
        if (asgn) {
          asgn.status = "Approved";
          asgn.updatedAt = now;
        }
        if (startup.pipelineStage === "Internal Review") {
          startup.pipelineStage = "Detailed Evaluation";
          startup.stageUpdatedAt = now;
        }
      } else if (reviewAction === "revision_requested") {
        research.status = "revision_requested";
        if (asgn) {
          asgn.status = "Revision Requested";
          asgn.updatedAt = now;
        }
        startup.pipelineStage = "Research in Progress";
        startup.stageUpdatedAt = now;
      } else if (reviewAction === "reassigned" && body.newResearcherId) {
        const newResUser = db.users.find((u) => u.id === body.newResearcherId);
        if (newResUser) {
          research.primaryResearcherId = newResUser.id;
          research.primaryResearcherName = newResUser.name;
          research.status = "draft";
          startup.assignedResearcherId = newResUser.id;
          startup.assignedResearcherName = newResUser.name;
          if (!startup.assignedUsers.includes(newResUser.id)) {
            startup.assignedUsers.push(newResUser.id);
          }
          if (asgn) {
            asgn.primaryResearcherId = newResUser.id;
            asgn.primaryResearcherName = newResUser.name;
            asgn.status = "Assigned";
          }
        }
      }

      research.updatedAt = now;
      startup.updatedAt = now;

      // Notify primary researcher & collaborators
      for (const recipientId of [
        research.primaryResearcherId,
        ...research.collaboratorIds,
      ]) {
        db.notifications.unshift({
          id: `notif-rev-out-${Date.now()}-${recipientId}`,
          recipientId,
          type: reviewAction === "approved" ? "approval" : "revision_requested",
          title:
            reviewAction === "approved"
              ? `Research Approved: ${startup.name}`
              : `Revision Requested: ${startup.name}`,
          message: `${user.name}: "${feedback}"`,
          startupId: startup.id,
          entityId: research.id,
          link: `/workspace/startups/${startup.id}?tab=research`,
          read: false,
          actorId: user.id,
          actorName: user.name,
          createdAt: now,
        });
      }

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: `research.${reviewAction}`,
        entityType: "research",
        entityId: research.id,
        entityName: startup.name,
        startupId: startup.id,
        summary: `${user.name} ${reviewAction === "approved" ? "approved" : "requested revisions on"} research v${research.version} for ${startup.name}: "${feedback}"`,
        newValue: reviewAction,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, research, startup, assignment: asgn });
    }

    if (action === "research.add_source") {
      const sourceUrl = String(body.sourceUrl || "").trim();
      const sourceTitle = String(body.sourceTitle || "").trim();
      const claimSummary = String(body.claimSummary || "").trim();

      if (!sourceUrl || !sourceTitle) {
        return NextResponse.json(
          { ok: false, message: "Source title and clickable URL are required." },
          { status: 400 }
        );
      }

      const newSource: ResearchCitationSource = {
        id: `src-${Date.now().toString(36)}-${crypto.randomBytes(2).toString("hex")}`,
        startupId: body.startupId || null,
        researchId: body.researchId || null,
        libraryItemId: body.libraryItemId || null,
        section: String(body.section || "General"),
        claimSummary,
        sourceUrl: /^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`,
        sourceTitle,
        publicationDate: String(body.publicationDate || ""),
        dateAccessed: String(body.dateAccessed || now.slice(0, 10)),
        sourceType: (body.sourceType as SourceType) || "Official website",
        analystNotes: String(body.analystNotes || ""),
        confidenceLevel: body.confidenceLevel || "Verified Fact",
        createdBy: user.id,
        createdByName: user.name,
        createdAt: now,
      };

      db.research_sources.unshift(newSource);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "research.source_added",
        entityType: "research",
        entityId: newSource.id,
        entityName: sourceTitle,
        startupId: body.startupId || null,
        summary: `${user.name} cited '${sourceTitle}' (${newSource.sourceType} — ${newSource.confidenceLevel})`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, source: newSource });
    }

    if (action === "research.delete_source") {
      const idx = db.research_sources.findIndex((s) => s.id === body.sourceId);
      if (idx !== -1) {
        db.research_sources.splice(idx, 1);
        await saveWorkspaceDb(db);
      }
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 6. COMPETITOR DATABASE (Part 7.2.G)
    // =========================================================================
    if (action === "competitor.create") {
      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!startup) {
        return NextResponse.json({ ok: false, message: "Startup not found." }, { status: 404 });
      }
      const name = String(body.name || "").trim();
      if (!name) {
        return NextResponse.json(
          { ok: false, message: "Competitor name is required." },
          { status: 400 }
        );
      }

      const comp: CompetitorRecord = {
        id: `comp-${Date.now().toString(36)}`,
        startupId: startup.id,
        startupName: startup.name,
        name,
        website: String(body.website || "").trim(),
        geography: String(body.geography || "India").trim(),
        product: String(body.product || "").trim(),
        pricing: String(body.pricing || "").trim(),
        targetMarket: String(body.targetMarket || "").trim(),
        fundingHistory: String(body.fundingHistory || "").trim(),
        strengths: String(body.strengths || "").trim(),
        weaknesses: String(body.weaknesses || "").trim(),
        differentiation: String(body.differentiation || "").trim(),
        createdBy: user.id,
        createdByName: user.name,
        createdAt: now,
        updatedAt: now,
      };

      db.competitors.unshift(comp);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "competitor.added",
        entityType: "competitor",
        entityId: comp.id,
        entityName: comp.name,
        startupId: startup.id,
        summary: `${user.name} added competitor '${comp.name}' to ${startup.name}`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, competitor: comp });
    }

    if (action === "competitor.delete") {
      const idx = db.competitors.findIndex((c) => c.id === body.competitorId);
      if (idx !== -1) {
        db.competitors.splice(idx, 1);
        await saveWorkspaceDb(db);
      }
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 7. COMMENTS, @MENTIONS & COLLABORATION (Part 8)
    // =========================================================================
    if (action === "comment.create") {
      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!startup || !canViewStartup(user, startup)) {
        return NextResponse.json(
          { ok: false, message: "Startup not found or access denied." },
          { status: 403 }
        );
      }

      const content = String(body.content || "").trim();
      if (!content) {
        return NextResponse.json(
          { ok: false, message: "Comment cannot be empty." },
          { status: 400 }
        );
      }

      // Detect @mentions from content or explicit mentionIds
      const explicitMentions: string[] = Array.isArray(body.mentions) ? body.mentions : [];
      const detectedMentionUsers = db.users.filter(
        (u) =>
          explicitMentions.includes(u.id) ||
          content.toLowerCase().includes(`@${u.name.split(" ")[0]!.toLowerCase()}`) ||
          content.toLowerCase().includes(`@${u.name.toLowerCase()}`)
      );

      const newComment: WorkspaceComment = {
        id: `cmt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString("hex")}`,
        startupId: startup.id,
        taskId: body.taskId || null,
        researchId: body.researchId || null,
        parentId: body.parentId || null,
        content,
        mentions: detectedMentionUsers.map((u) => u.id),
        mentionNames: detectedMentionUsers.map((u) => u.name),
        attachmentIds: Array.isArray(body.attachmentIds) ? body.attachmentIds : [],
        resolved: false,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        createdAt: now,
        updatedAt: now,
      };

      db.comments.push(newComment);

      for (const mentionedUser of detectedMentionUsers) {
        if (mentionedUser.id === user.id) continue;
        db.notifications.unshift({
          id: `notif-mention-${Date.now()}-${mentionedUser.id}`,
          recipientId: mentionedUser.id,
          type: "mention",
          title: `${user.name} mentioned you on ${startup.name}`,
          message: content.slice(0, 140),
          startupId: startup.id,
          entityId: newComment.id,
          link: `/workspace/startups/${startup.id}?tab=collaboration`,
          read: false,
          actorId: user.id,
          actorName: user.name,
          createdAt: now,
        });
      }

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "comment.posted",
        entityType: "comment",
        entityId: newComment.id,
        entityName: startup.name,
        startupId: startup.id,
        summary: `${user.name} commented on ${startup.name}: "${content.slice(0, 80)}"`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, comment: newComment });
    }

    if (action === "comment.resolve") {
      const cmt = db.comments.find((c) => c.id === body.commentId);
      if (!cmt) {
        return NextResponse.json({ ok: false, message: "Comment not found." }, { status: 404 });
      }
      cmt.resolved = !cmt.resolved;
      cmt.resolvedBy = cmt.resolved ? user.id : null;
      cmt.resolvedByName = cmt.resolved ? user.name : null;
      cmt.resolvedAt = cmt.resolved ? now : null;
      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, comment: cmt });
    }

    // =========================================================================
    // 8. TASK MANAGEMENT (Part 8)
    // =========================================================================
    if (action === "task.create") {
      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json({ ok: false, message: "Task title is required." }, { status: 400 });
      }

      const assignedToUser =
        db.users.find((u) => u.id === body.assignedToId) || user;
      const startup = body.startupId
        ? db.startups.find((s) => s.id === body.startupId)
        : null;

      const newTask: WorkspaceTask = {
        id: `task-${Date.now().toString(36)}`,
        title,
        description: String(body.description || "").trim(),
        startupId: startup?.id || null,
        startupName: startup?.name || null,
        assignedToId: assignedToUser.id,
        assignedToName: assignedToUser.name,
        assignedUsers: Array.from(new Set([assignedToUser.id, user.id])),
        dueDate:
          body.dueDate ||
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: (body.priority as PriorityLevel) || "Medium",
        status: (body.status as TaskStatus) || "To Do",
        checklist: Array.isArray(body.checklist)
          ? body.checklist.map((text: string, idx: number) => ({
              id: `tc-${idx + 1}`,
              text: String(text),
              completed: false,
            }))
          : [],
        attachments: [],
        createdBy: user.id,
        createdByName: user.name,
        createdAt: now,
        updatedAt: now,
      };

      db.tasks.unshift(newTask);

      if (assignedToUser.id !== user.id) {
        db.notifications.unshift({
          id: `notif-task-${Date.now()}`,
          recipientId: assignedToUser.id,
          type: "assignment",
          title: `New Task Assigned: ${newTask.title}`,
          message: `${user.name} assigned you a ${newTask.priority} priority task${startup ? ` on ${startup.name}` : ""}.`,
          startupId: startup?.id || null,
          entityId: newTask.id,
          link: startup ? `/workspace/startups/${startup.id}?tab=tasks` : `/workspace/tasks`,
          read: false,
          actorId: user.id,
          actorName: user.name,
          createdAt: now,
        });
      }

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "task.created",
        entityType: "task",
        entityId: newTask.id,
        entityName: newTask.title,
        startupId: startup?.id || null,
        summary: `${user.name} created task '${newTask.title}' assigned to ${assignedToUser.name}`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, task: newTask });
    }

    if (action === "task.update") {
      const task = db.tasks.find((t) => t.id === body.taskId);
      if (!task) {
        return NextResponse.json({ ok: false, message: "Task not found." }, { status: 404 });
      }
      if (body.status) task.status = body.status as TaskStatus;
      if (body.priority) task.priority = body.priority as PriorityLevel;
      if (body.dueDate) task.dueDate = body.dueDate;
      if (body.assignedToId) {
        const u = db.users.find((usr) => usr.id === body.assignedToId);
        if (u) {
          task.assignedToId = u.id;
          task.assignedToName = u.name;
          if (!task.assignedUsers.includes(u.id)) task.assignedUsers.push(u.id);
        }
      }
      if (body.toggleChecklistId) {
        const item = task.checklist.find((c) => c.id === body.toggleChecklistId);
        if (item) item.completed = !item.completed;
      }
      task.updatedAt = now;

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "task.updated",
        entityType: "task",
        entityId: task.id,
        entityName: task.title,
        startupId: task.startupId || null,
        summary: `${user.name} updated task '${task.title}' status to '${task.status}'`,
        newValue: task.status,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, task });
    }

    // =========================================================================
    // 9. NOTIFICATIONS
    // =========================================================================
    if (action === "notification.mark_read") {
      const notif = db.notifications.find(
        (n) => n.id === body.notificationId && n.recipientId === user.id
      );
      if (notif) notif.read = true;
      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true });
    }

    if (action === "notification.mark_all_read") {
      for (const n of db.notifications) {
        if (n.recipientId === user.id) n.read = true;
      }
      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 10. INVESTMENT EVALUATION SCORECARDS & DECISIONS (Part 10)
    // =========================================================================
    if (action === "evaluation.submit") {
      if (!hasPermission(user, "evaluation.create")) {
        return NextResponse.json(
          { ok: false, message: "You do not have permission to submit evaluation scorecards." },
          { status: 403 }
        );
      }

      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!startup) {
        return NextResponse.json({ ok: false, message: "Startup not found." }, { status: 404 });
      }

      const scores: EvaluationDimensionScore[] = Array.isArray(body.scores)
        ? body.scores
        : [];

      if (scores.length === 0) {
        return NextResponse.json(
          { ok: false, message: "Dimension scores are required." },
          { status: 400 }
        );
      }

      // Compute weighted score (1.00 to 5.00)
      let totalWeight = 0;
      let weightedSum = 0;
      for (const s of scores) {
        const w = Number(s.weight) || 10;
        const val = Math.min(5, Math.max(1, Number(s.score) || 3));
        totalWeight += w;
        weightedSum += val * w;
      }
      const weightedScore =
        totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 3.0;

      const existingIdx = db.evaluations.findIndex(
        (e) => e.startupId === startup.id && e.evaluatorId === user.id
      );

      const evalRecord: StartupEvaluation = {
        id:
          existingIdx !== -1
            ? db.evaluations[existingIdx]!.id
            : `eval-${Date.now().toString(36)}`,
        startupId: startup.id,
        startupName: startup.name,
        evaluatorId: user.id,
        evaluatorName: user.name,
        evaluatorRole: user.role,
        scores,
        weightedScore,
        reviewerComments: String(body.reviewerComments || "").trim(),
        strengths: String(body.strengths || "").trim(),
        weaknesses: String(body.weaknesses || "").trim(),
        majorRisks: String(body.majorRisks || "").trim(),
        missingInformation: String(body.missingInformation || "").trim(),
        recommendation:
          (body.recommendation as DecisionOutcome) || "Further Discussion",
        createdAt:
          existingIdx !== -1 ? db.evaluations[existingIdx]!.createdAt : now,
        updatedAt: now,
      };

      if (existingIdx !== -1) {
        db.evaluations[existingIdx] = evalRecord;
      } else {
        db.evaluations.unshift(evalRecord);
      }

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "evaluation.submitted",
        entityType: "evaluation",
        entityId: evalRecord.id,
        entityName: startup.name,
        startupId: startup.id,
        summary: `${user.name} submitted evaluation scorecard for ${startup.name} (Weighted Score: ${weightedScore}/5.00, Recommendation: ${evalRecord.recommendation})`,
        newValue: `${weightedScore}/5.00 (${evalRecord.recommendation})`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, evaluation: evalRecord });
    }

    if (action === "decision.record") {
      if (!hasPermission(user, "evaluation.decision")) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "Only authorised Investment Leads or Super Admins can record official investment decisions.",
          },
          { status: 403 }
        );
      }

      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!startup) {
        return NextResponse.json({ ok: false, message: "Startup not found." }, { status: 404 });
      }

      const outcome = body.outcome as DecisionOutcome;
      const reason = String(body.reason || "").trim();

      if (!outcome || !reason) {
        return NextResponse.json(
          {
            ok: false,
            message: "Decision outcome and written rationale are mandatory.",
          },
          { status: 400 }
        );
      }

      const prevStage = startup.pipelineStage;
      let newStage = body.newStage ? String(body.newStage) : prevStage;
      if (!body.newStage) {
        if (outcome === "Proceed") newStage = "Detailed Evaluation";
        if (outcome === "Further Discussion") newStage = "Founder Discussion";
        if (outcome === "Hold") newStage = "On Hold";
        if (outcome === "Pass") newStage = "Passed";
        if (outcome === "Approved Subject to Conditions") newStage = "Approved";
      }

      const decision: DecisionRecord = {
        id: `dec-${Date.now().toString(36)}`,
        startupId: startup.id,
        startupName: startup.name,
        outcome,
        reason,
        conditions: body.conditions ? String(body.conditions).trim() : undefined,
        previousStage: prevStage,
        newStage,
        decidedBy: user.id,
        decidedByName: user.name,
        decidedAt: now,
      };

      startup.latestDecision = decision;
      startup.decisionHistory.unshift(decision);
      startup.pipelineStage = newStage;
      startup.stageUpdatedAt = now;
      startup.updatedAt = now;
      db.decisions.unshift(decision);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "decision.recorded",
        entityType: "decision",
        entityId: decision.id,
        entityName: startup.name,
        startupId: startup.id,
        summary: `${user.name} recorded decision '${outcome}' for ${startup.name} (${prevStage} → ${newStage}): "${reason}"`,
        previousValue: prevStage,
        newValue: `${outcome} (${newStage})`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, decision, startup });
    }

    // =========================================================================
    // 11. ROLE-BASED USER MANAGEMENT & INVITATIONS (Part 9 & Workflow E)
    // =========================================================================
    if (action === "user.invite") {
      if (!hasPermission(user, "users.invite")) {
        return NextResponse.json(
          { ok: false, message: "Only Super Admins can invite new team members." },
          { status: 403 }
        );
      }

      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      const name = String(body.name || "").trim();
      const role = (body.role as UserRole) || "RESEARCH_ANALYST";
      const accessScope: AccessScope =
        body.accessScope === "all" ? "all" : "assigned";
      const teamIds: string[] = Array.isArray(body.teamIds)
        ? body.teamIds
        : ["team-research"];

      if (!email || !email.includes("@") || !name) {
        return NextResponse.json(
          { ok: false, message: "Valid name and email address are required." },
          { status: 400 }
        );
      }

      // Check if user is already an active member in the workspace
      const existingActiveUser = db.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.status === "active"
      );
      if (existingActiveUser) {
        return NextResponse.json(
          { ok: false, message: `${name} (${email}) already has an active account in the workspace.` },
          { status: 400 }
        );
      }

      // Prevent duplicate pending invitations for the same email: remove older pending invite before creating new
      const existingPendingIdx = db.invitations.findIndex(
        (i) => i.email.toLowerCase() === email.toLowerCase() && i.status === "pending"
      );
      if (existingPendingIdx !== -1) {
        const oldInv = db.invitations.splice(existingPendingIdx, 1)[0];
        await deleteInvitationFromFirestore(oldInv.id);
      }

      // Prevent non-Super-Admin from ever creating a Super Admin
      if (role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { ok: false, message: "Only a Super Admin can invite another Super Admin." },
          { status: 403 }
        );
      }

      const inviteCode = `DVC-INV-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const permissions =
        db.workspace_settings.roleTemplates[role] || DEFAULT_ROLE_TEMPLATES[role];

      const invitation = {
        id: `inv-${Date.now().toString(36)}`,
        email,
        name,
        role,
        accessScope,
        teamIds,
        permissions,
        inviteCode,
        status: "pending" as const,
        invitedBy: user.id,
        invitedByName: user.name,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
        acceptedAt: null,
      };

      db.invitations.unshift(invitation);

      // Dispatch live email invitation from siddharth@deeveecapital.com
      const emailResult = await sendWorkspaceTeamInvitationEmail({
        to: email,
        name,
        role,
        accessScope,
        inviteCode,
        invitedByName: user.name,
        workspaceUrl: "https://deeveecapital.com/workspace",
        expiresAt: invitation.expiresAt,
      });

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "user.invited",
        entityType: "user",
        entityId: invitation.id,
        entityName: `${name} (${email})`,
        summary: `${user.name} invited ${name} (${email}) as ${role} with access scope '${accessScope}' [Code: ${inviteCode}] (Email: ${emailResult.mode === "smtp" ? "Sent via Live SMTP" : "Logged"})`,
        newValue: `${role} (${accessScope})`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, invitation, emailResult });
    }

    if (action === "user.resend_invite") {
      const invitationId = String(body.invitationId || "");
      const inviteCode = String(body.inviteCode || "");
      const inv = db.invitations.find(
        (i) => i.id === invitationId || i.inviteCode === inviteCode
      );

      if (!inv) {
        return NextResponse.json({ ok: false, message: "Invitation not found." }, { status: 404 });
      }

      // Dispatch real email via SMTP
      const emailResult = await sendWorkspaceTeamInvitationEmail({
        to: inv.email,
        name: inv.name,
        role: inv.role,
        accessScope: inv.accessScope,
        inviteCode: inv.inviteCode,
        invitedByName: user.name,
        workspaceUrl: "https://deeveecapital.com/workspace",
        expiresAt: inv.expiresAt,
      });

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "user.invite_resent",
        entityType: "user",
        entityId: inv.id,
        entityName: `${inv.name} (${inv.email})`,
        summary: `${user.name} resent workspace invitation to ${inv.name} (${inv.email}) [Code: ${inv.inviteCode}] (Email: ${emailResult.mode === "smtp" ? "Sent via Live SMTP" : "Logged"})`,
        newValue: inv.inviteCode,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, invitation: inv, emailResult });
    }

    if (action === "user.delete_invite" || action === "user.revoke_invite") {
      if (!hasPermission(user, "users.manage") && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { ok: false, message: "Only Super Admins can revoke workspace invitations." },
          { status: 403 }
        );
      }

      const invitationId = String(body.invitationId || "");
      const inviteCode = String(body.inviteCode || "");
      const invIdx = db.invitations.findIndex(
        (i) => (invitationId && i.id === invitationId) || (inviteCode && i.inviteCode === inviteCode)
      );

      if (invIdx === -1) {
        return NextResponse.json({ ok: false, message: "Invitation not found." }, { status: 404 });
      }

      const removed = db.invitations.splice(invIdx, 1)[0];
      await deleteInvitationFromFirestore(removed.id);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "user.invite_revoked",
        entityType: "user",
        entityId: removed.id,
        entityName: `${removed.name} (${removed.email})`,
        summary: `${user.name} revoked workspace invitation for ${removed.name} (${removed.email}) [Code: ${removed.inviteCode}]`,
        newValue: null,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, removedId: removed.id, invitations: db.invitations });
    }

    if (action === "user.update_role_or_status") {
      if (!hasPermission(user, "users.manage") || user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { ok: false, message: "Only Super Admins can modify user roles, permissions, or account status." },
          { status: 403 }
        );
      }

      const targetUser = db.users.find((u) => u.id === body.targetUserId);
      if (!targetUser) {
        return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });
      }

      if (targetUser.id === user.id && body.status === "deactivated") {
        return NextResponse.json(
          { ok: false, message: "You cannot deactivate your own Super Admin account." },
          { status: 400 }
        );
      }

      const prevSummary = `${targetUser.role} / ${targetUser.status} / ${targetUser.accessScope}`;

      if (body.role) {
        targetUser.role = body.role as UserRole;
        targetUser.permissions =
          Array.isArray(body.permissions) && body.permissions.length > 0
            ? (body.permissions as PermissionKey[])
            : db.workspace_settings.roleTemplates[targetUser.role] ||
              DEFAULT_ROLE_TEMPLATES[targetUser.role];
      } else if (Array.isArray(body.permissions)) {
        targetUser.permissions = body.permissions as PermissionKey[];
      }

      if (body.status) {
        targetUser.status = body.status as UserStatus;
      }
      if (body.accessScope) {
        targetUser.accessScope = body.accessScope as AccessScope;
      }
      if (Array.isArray(body.teamIds)) {
        targetUser.teamIds = body.teamIds;
      }

      targetUser.updatedAt = now;

      const newSummary = `${targetUser.role} / ${targetUser.status} / ${targetUser.accessScope}`;

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "user.permissions_updated",
        entityType: "user",
        entityId: targetUser.id,
        entityName: targetUser.name,
        summary: `${user.name} updated ${targetUser.name} (${targetUser.email}): ${prevSummary} → ${newSummary}`,
        previousValue: prevSummary,
        newValue: newSummary,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({
        ok: true,
        user: sanitizeUserForClient(targetUser),
      });
    }

    // =========================================================================
    // 12. RESEARCH LIBRARY & DOCUMENTS (Part 13 & Part 14)
    // =========================================================================
    if (action === "library.create") {
      if (!hasPermission(user, "research.create")) {
        return NextResponse.json(
          { ok: false, message: "You do not have permission to create research library entries." },
          { status: 403 }
        );
      }

      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json({ ok: false, message: "Title is required." }, { status: 400 });
      }

      const relatedStartupIds: string[] = Array.isArray(body.relatedStartupIds)
        ? body.relatedStartupIds
        : [];
      const relatedStartupNames = relatedStartupIds
        .map((id) => db.startups.find((s) => s.id === id)?.name)
        .filter((n): n is string => Boolean(n));

      const entry: ResearchLibraryEntry = {
        id: `lib-${Date.now().toString(36)}`,
        title,
        category: (body.category as LibraryCategory) || "Industries",
        summary: String(body.summary || "").trim(),
        notes: String(body.notes || "").trim(),
        sourceUrls: Array.isArray(body.sourceUrls) ? body.sourceUrls : [],
        authorId: user.id,
        authorName: user.name,
        contributorIds: [user.id],
        contributorNames: [user.name],
        attachments: [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        relatedStartupIds,
        relatedStartupNames,
        createdAt: now,
        updatedAt: now,
      };

      db.research_library.unshift(entry);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "library.created",
        entityType: "library",
        entityId: entry.id,
        entityName: entry.title,
        summary: `${user.name} published '${entry.title}' (${entry.category}) to the Research Library`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, entry });
    }

    if (action === "library.link_startup") {
      const entry = db.research_library.find((l) => l.id === body.libraryId);
      const startup = db.startups.find((s) => s.id === body.startupId);
      if (!entry || !startup) {
        return NextResponse.json({ ok: false, message: "Record not found." }, { status: 404 });
      }
      if (!entry.relatedStartupIds.includes(startup.id)) {
        entry.relatedStartupIds.push(startup.id);
        entry.relatedStartupNames.push(startup.name);
        entry.updatedAt = now;
        await saveWorkspaceDb(db);
      }
      return NextResponse.json({ ok: true, entry });
    }

    if (action === "document.create") {
      const startup = body.startupId
        ? db.startups.find((s) => s.id === body.startupId)
        : null;

      const title = String(body.title || "").trim();
      const fileName = String(body.fileName || "Document.pdf").trim();
      if (!title) {
        return NextResponse.json({ ok: false, message: "Document title is required." }, { status: 400 });
      }

      const confidentiality: ConfidentialityLevel =
        body.confidentiality || "standard";

      const doc: WorkspaceDocument = {
        id: `doc-${Date.now().toString(36)}`,
        startupId: startup?.id || null,
        startupName: startup?.name || null,
        title,
        fileName,
        fileSize: Number(body.fileSize) || 512000,
        mimeType: String(body.mimeType || "application/pdf"),
        category: (body.category as DocumentCategory) || "Market Research",
        confidentiality,
        allowedRoles:
          confidentiality === "confidential"
            ? ["SUPER_ADMIN", "INVESTMENT_LEAD"]
            : ["SUPER_ADMIN", "INVESTMENT_LEAD", "REVIEWER", "RESEARCH_ANALYST"],
        allowedUserIds: [user.id, "user-siddharth", "user-ravi"],
        storagePath: String(body.downloadUrl || "#"),
        downloadUrl: String(body.downloadUrl || "#"),
        version: 1,
        uploadedBy: user.id,
        uploadedByName: user.name,
        createdAt: now,
      };

      db.documents.unshift(doc);

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "document.uploaded",
        entityType: "document",
        entityId: doc.id,
        entityName: doc.title,
        startupId: startup?.id || null,
        summary: `${user.name} uploaded document '${doc.title}' (${doc.category} — ${doc.confidentiality})`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({ ok: true, document: doc });
    }

    // =========================================================================
    // 13. WORKSPACE SETTINGS, PIPELINE STAGES & SCORECARD CONFIG (Part 15)
    // =========================================================================
    if (action === "settings.update") {
      if (!hasPermission(user, "settings.manage") || user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { ok: false, message: "Only Super Admins can modify workspace settings." },
          { status: 403 }
        );
      }

      if (body.settings) {
        db.workspace_settings = {
          ...db.workspace_settings,
          ...body.settings,
          updatedAt: now,
          updatedBy: user.id,
        };
      }
      if (Array.isArray(body.pipelineStages)) {
        db.pipeline_stages = body.pipelineStages;
      }
      if (body.scorecard) {
        db.scorecards[0] = {
          ...db.scorecards[0]!,
          ...body.scorecard,
          updatedAt: now,
          updatedBy: user.id,
        };
      }

      await recordAuditAndActivity(db, {
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "settings.updated",
        entityType: "settings",
        entityId: "default",
        entityName: "Workspace Settings & Pipeline Configuration",
        summary: `${user.name} updated workspace settings and configuration`,
      });

      await saveWorkspaceDb(db);
      return NextResponse.json({
        ok: true,
        workspace_settings: db.workspace_settings,
        pipeline_stages: db.pipeline_stages,
        scorecards: db.scorecards,
      });
    }

    return NextResponse.json(
      { ok: false, message: `Unknown workspace action: ${action}` },
      { status: 400 }
    );
  } catch (err) {
    console.error("[Workspace State API] Error:", err);
    return NextResponse.json(
      { ok: false, message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
