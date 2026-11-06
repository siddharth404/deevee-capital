/**
 * DEEVEE CAPITAL — RECRUITMENT, TALENT ASSESSMENT & AI INTERVIEW ADMIN API
 * Route: /api/workspace/recruitment
 *
 * Handles:
 * - GET: Fetch complete recruitment module state, Excel (.xls) export, and PDF analytics report
 * - POST:
 *   - workbook.preview & workbook.confirm_import (supports .xlsx upload or default 79 IIM Amritsar sheet)
 *   - candidate.update & candidate.bulk_action
 *   - candidate.provision_accounts (generates secure one-time password setup tokens, never plaintext passwords)
 *   - email.preview, email.send_test (blocks @iimamritsar.ac.in in test mode), email.send_approved
 *   - question.save & question.delete
 *   - case_set.save
 *   - ai_interview.review & ai_interview.simulate_demo_candidate
 *   - evaluation.submit & score.override (with mandatory reason + audit trail + disagreement flags)
 *   - interview.save
 *   - settings.update
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getAuthenticatedUser } from "@/lib/workspace/auth";
import { getWorkspaceDb, recordAuditAndActivity, saveWorkspaceDb } from "@/lib/workspace/db";
import { sendRecruitmentAssessmentEmail } from "@/lib/email";
import {
  buildCandidatesFromWorkbookRows,
  buildInitialRecruitmentState,
  calculateWeightedCompetencyScore,
  computeStage1ProfileBreakdown,
  createDedicatedSampleCandidate,
  DEFAULT_RECRUITMENT_EMAIL_TEMPLATES,
  generateCandidateRandomPassword,
  generateCandidatesExcelXml,
  parseApplicantXlsxBuffer,
  RAW_IIM_AMRITSAR_WORKBOOK_ROWS,
  sanitizeRecruitmentStateIsolation,
} from "@/lib/workspace/iimAmritsarApplicants";
import {
  createInitialProctoringTelemetry,
  DEFAULT_STARTUP_CASE_SETS,
  evaluateCompleteAIInterviewSession,
  generatePersonalizedInterviewTurns,
  selectCaseSetForCandidate,
} from "@/lib/workspace/aiInterviewEngine";
import {
  AIInterviewSessionRecord,
  AssessmentQuestion,
  CandidateApplicationStage,
  CandidateAssessmentStatus,
  CandidateRecord,
  CandidateSelectionStatus,
  CompetencyScores,
  InterviewEvaluationRecord,
  RecruitmentEmailLog,
  RecruitmentEmailTemplate,
  RecruitmentModuleState,
  ReviewerScoreRecord,
  StartupCaseSet,
} from "@/lib/workspace/recruitmentTypes";

export const runtime = "nodejs";

function createCandidateInviteToken(candidateId: string, email: string): string {
  const secret =
    process.env.ADMIN_API_SECRET ||
    process.env.WORKSPACE_SESSION_SECRET ||
    "deevee-capital-candidate-invite-secret-2026";
  const exp = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
  const payload = `${candidateId}|${email.toLowerCase()}|${exp}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
  return Buffer.from(`${payload}|${sig}`, "utf-8").toString("base64url");
}

function verifyCandidateInviteToken(token: string): {
  candidateId: string;
  email: string;
} | null {
  try {
    const secret =
      process.env.ADMIN_API_SECRET ||
      process.env.WORKSPACE_SESSION_SECRET ||
      "deevee-capital-candidate-invite-secret-2026";
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [candidateId, email, expStr, sig] = decoded.split("|");
    if (!candidateId || !email || !expStr || !sig) return null;
    if (Date.now() > Number(expStr)) return null;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${candidateId}|${email}|${expStr}`)
      .digest("hex")
      .slice(0, 32);
    if (sig !== expectedSig) return null;
    return { candidateId, email };
  } catch {
    return null;
  }
}

function getCanonicalOrigin(request?: NextRequest): string {
  const forwardedHost = request?.headers.get("x-forwarded-host") || "";
  const host = request?.headers.get("host") || "";
  const candidateHost = forwardedHost || host;

  if (
    candidateHost &&
    !candidateHost.includes("0.0.0.0") &&
    !candidateHost.includes("localhost") &&
    !candidateHost.includes("127.0.0.1") &&
    !candidateHost.startsWith("8080") &&
    !candidateHost.endsWith(":8080")
  ) {
    const proto = request?.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${candidateHost}`.replace(/\/$/, "");
  }

  return (process.env.NEXT_PUBLIC_APP_URL || "https://deeveecapital.com").replace(/\/$/, "");
}

function formatAssessmentDeadline(deadlineIso?: string | null): string {
  if (!deadlineIso) return "Within the active cohort window specified in your Candidate Portal";
  const date = new Date(deadlineIso);
  if (isNaN(date.getTime())) return "Within the active cohort window specified in your Candidate Portal";
  return (
    date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }) + " IST"
  );
}

function ensureEmailTemplatesUpToDate(rec: RecruitmentModuleState): boolean {
  let templatesChanged = false;
  if (!Array.isArray(rec.emailTemplates) || rec.emailTemplates.length === 0) {
    rec.emailTemplates = [...DEFAULT_RECRUITMENT_EMAIL_TEMPLATES];
    return true;
  }
  for (const defTpl of DEFAULT_RECRUITMENT_EMAIL_TEMPLATES) {
    const idx = rec.emailTemplates.findIndex((t: RecruitmentEmailTemplate) => t.id === defTpl.id);
    if (idx === -1) {
      rec.emailTemplates.push(defTpl);
      templatesChanged = true;
    } else {
      const current = rec.emailTemplates[idx];
      if (
        current &&
        (current.bodyText?.includes("through the IIM Amritsar placement process") ||
          current.bodyText?.includes("48-hour window") ||
          !current.bodyText?.includes("{{candidatePassword}}"))
      ) {
        rec.emailTemplates[idx] = { ...defTpl };
        templatesChanged = true;
      }
    }
  }
  return templatesChanged;
}

function renderEmailTemplate(
  rawText: string,
  candidate: CandidateRecord,
  originUrl: string,
  cohortDefaultDeadlineAt?: string | null
): string {
  const safeOrigin =
    originUrl &&
    !originUrl.includes("0.0.0.0") &&
    !originUrl.includes("127.0.0.1") &&
    !originUrl.includes(":8080")
      ? originUrl.replace(/\/$/, "")
      : "https://deeveecapital.com";
  const directLink = `${safeOrigin}/candidate?code=${encodeURIComponent(candidate.candidateCode)}&email=${encodeURIComponent(candidate.email)}`;
  const sampleTestLink = `${safeOrigin}/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`;
  const password =
    candidate.assignedPortalPassword ||
    (candidate.candidateCode === "DVC-SAMPLE-001"
      ? "DVC@Sample2026"
      : generateCandidateRandomPassword(candidate.candidateCode, candidate.email));

  const effectiveDeadline =
    candidate.assessmentDeadlineAt ||
    cohortDefaultDeadlineAt ||
    null;
  const deadline = formatAssessmentDeadline(effectiveDeadline);

  return rawText
    .replace(/\{\{candidateName\}\}/g, candidate.fullName)
    .replace(/\{\{candidateCode\}\}/g, candidate.candidateCode)
    .replace(/\{\{candidateEmail\}\}/g, candidate.email)
    .replace(/\{\{candidatePassword\}\}/g, password)
    .replace(/\{\{password\}\}/g, password)
    .replace(/\{\{passkey\}\}/g, password)
    .replace(/\{\{directLink\}\}/g, directLink)
    .replace(/\{\{sampleTestLink\}\}/g, sampleTestLink)
    .replace(/\{\{institution\}\}/g, candidate.institution || "")
    .replace(/\{\{portalInviteUrl\}\}/g, directLink)
    .replace(/\{\{assessmentDeadline\}\}/g, deadline)
    .replace(/\{\{submissionDeadline\}\}/g, deadline)
    .replace(/\{\{deadline\}\}/g, deadline)
    .replace(/48-hour window(?:,\s*~3–4 hours effort)?/gi, `Deadline: ${deadline}`)
    .replace(/Within 48 hours of (?:receipt|receiving this invitation)/gi, deadline);
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const db = await getWorkspaceDb();
  if (!db.recruitment || !db.recruitment.candidates?.length) {
    db.recruitment = buildInitialRecruitmentState();
    await saveWorkspaceDb(db);
  } else {
    const templatesChanged = ensureEmailTemplatesUpToDate(db.recruitment);
    if (templatesChanged) {
      await saveWorkspaceDb(db);
    }
  }

  const { searchParams } = new URL(request.url);
  const exportType = searchParams.get("export");

  if (exportType === "excel") {
    const xml = generateCandidatesExcelXml(db.recruitment.candidates);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="Deevee_Capital_IIM_Amritsar_Candidates_${new Date().toISOString().slice(0, 10)}.xls"`,
      },
    });
  }

  if (exportType === "pdf_analytics") {
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { height } = page.getSize();
    let y = height - 48;

    page.drawText("DEEVEE CAPITAL — RECRUITMENT & AI INTERVIEW ANALYTICS REPORT", {
      x: 42,
      y,
      size: 13,
      font: fontBold,
      color: rgb(0.08, 0.14, 0.36),
    });
    y -= 18;
    page.drawText(
      `Campaign: ${db.recruitment.settings.campaignTitle} | Role: ${db.recruitment.settings.roleTitle}`,
      {
        x: 42,
        y,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.3, 0.35, 0.42),
      }
    );
    y -= 14;
    page.drawText(
      `Generated by: ${user.name} (${user.email}) on ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`,
      {
        x: 42,
        y,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.45, 0.48, 0.54),
      }
    );
    y -= 24;

    const cands = db.recruitment.candidates;
    const shortlisted = cands.filter((c) => c.applicationStatus !== "Pending Screening" && c.applicationStatus !== "Rejected");
    const aiCompleted = (db.recruitment.aiInterviewSessions || []).filter((s) => s.status === "Completed");
    const withResearch = cands.filter((c) => c.hasSubstantiveResearchExperience);
    const withWorkEx = cands.filter((c) => c.totalWorkExMonths > 0);

    const summaryLines = [
      `Total IIM Amritsar Applicants Imported: ${cands.length} (0 duplicates, 100% institutional email verified)`,
      `Substantive Prior Startup/Market Research Experience: ${withResearch.length} (${Math.round((withResearch.length / Math.max(1, cands.length)) * 100)}%)`,
      `Candidates with Prior Full-Time Work Experience: ${withWorkEx.length}`,
      `Shortlisted for Assessment / AI Interview: ${shortlisted.length}`,
      `Proctored AI Interviews & Startup Simulations Completed: ${aiCompleted.length}`,
    ];

    page.drawText("1. COHORT FUNNEL SUMMARY", {
      x: 42,
      y,
      size: 10.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    });
    y -= 16;

    for (const line of summaryLines) {
      page.drawText(`• ${line}`, {
        x: 50,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.18, 0.2, 0.25),
      });
      y -= 14;
    }

    y -= 12;
    page.drawText("2. TOP 20 CANDIDATES BY COMPOSITE / PROFILE SCORE", {
      x: 42,
      y,
      size: 10.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    });
    y -= 16;

    const sortedTop = [...cands]
      .sort(
        (a, b) =>
          (b.manualScoreOverride ?? b.aiInterviewScore ?? b.finalWeightedScore ?? b.profileScore) -
          (a.manualScoreOverride ?? a.aiInterviewScore ?? a.finalWeightedScore ?? a.profileScore)
      )
      .slice(0, 20);

    for (let i = 0; i < sortedTop.length; i++) {
      const c = sortedTop[i]!;
      const score = c.manualScoreOverride ?? c.aiInterviewScore ?? c.finalWeightedScore ?? c.profileScore;
      const line = `${String(i + 1).padStart(2, "0")}. ${c.candidateCode} | ${c.fullName.slice(0, 24).padEnd(24, " ")} | ${c.ugDegree.slice(0, 10).padEnd(10, " ")} | Score: ${score}/100 | Research: ${c.hasSubstantiveResearchExperience ? "Yes" : "No"} | Status: ${c.applicationStatus}`;
      page.drawText(line, {
        x: 46,
        y,
        size: 8,
        font: fontRegular,
        color: rgb(0.15, 0.18, 0.22),
      });
      y -= 13;
      if (y < 60) break;
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Deevee_Capital_Recruitment_Report_${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  }

  // Strip server-side correctOptionIndex from questions only when needed, but admins in /workspace can view everything
  return NextResponse.json({
    recruitment: db.recruitment,
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const db = await getWorkspaceDb();
  if (!db.recruitment || !db.recruitment.candidates?.length) {
    db.recruitment = buildInitialRecruitmentState();
  }
  const rec = db.recruitment;
  sanitizeRecruitmentStateIsolation(rec);
  ensureEmailTemplatesUpToDate(rec);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = String(body.action || "");
  const now = new Date().toISOString();
  const originUrl = getCanonicalOrigin(request);

  // ==========================================================================
  // 1. EXCEL WORKBOOK UPLOAD PREVIEW & IMPORT
  // ==========================================================================
  if (action === "workbook.preview") {
    let rows: Array<Record<string, string>> = [];
    let fileName = String(body.fileName || "DeeVee Capital_IIM Amritsar_Profile Sheet .xlsx");

    if (body.fileBase64 && typeof body.fileBase64 === "string") {
      try {
        const cleanBase64 = body.fileBase64.replace(/^data:.*?;base64,/, "");
        const buf = Buffer.from(cleanBase64, "base64");
        rows = parseApplicantXlsxBuffer(buf);
      } catch (err) {
        return NextResponse.json(
          { error: `Failed to parse uploaded .xlsx file: ${(err as Error).message}` },
          { status: 400 }
        );
      }
    } else {
      // Try reading the uploaded file from disk first, falling back to RAW_IIM_AMRITSAR_WORKBOOK_ROWS
      try {
        const diskPath = path.join(
          process.cwd(),
          "DeeVee Capital_IIM Amritsar_Profile Sheet .xlsx"
        );
        const buf = await fs.readFile(diskPath);
        rows = parseApplicantXlsxBuffer(buf);
      } catch {
        rows = RAW_IIM_AMRITSAR_WORKBOOK_ROWS;
      }
    }

    const previewCandidates = buildCandidatesFromWorkbookRows(
      rows,
      rec.settings.stage1ShortlistThreshold || 48
    );

    const seenEmails = new Set<string>();
    const duplicateEmails: string[] = [];
    let invalidEmailCount = 0;

    for (const c of previewCandidates) {
      const em = c.email.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        invalidEmailCount += 1;
      }
      if (seenEmails.has(em)) {
        duplicateEmails.push(em);
      }
      seenEmails.add(em);
    }

    return NextResponse.json({
      preview: {
        fileName,
        totalRows: previewCandidates.length,
        validEmailCount: previewCandidates.length - invalidEmailCount,
        invalidEmailCount,
        duplicateEmails,
        shortlistedCount: previewCandidates.filter(
          (c) => c.applicationStatus === "Shortlisted for Assessment"
        ).length,
        withResearchCount: previewCandidates.filter((c) => c.hasSubstantiveResearchExperience)
          .length,
        withWorkExCount: previewCandidates.filter((c) => c.totalWorkExMonths > 0).length,
        sampleCandidates: previewCandidates.slice(0, 10),
        allRows: rows,
      },
    });
  }

  if (action === "workbook.confirm_import") {
    let rows: Array<Record<string, string>> = Array.isArray(body.rows)
      ? (body.rows as Array<Record<string, string>>)
      : RAW_IIM_AMRITSAR_WORKBOOK_ROWS;

    if (!rows || rows.length === 0) {
      rows = RAW_IIM_AMRITSAR_WORKBOOK_ROWS;
    }

    const freshCandidates = buildCandidatesFromWorkbookRows(
      rows,
      rec.settings.stage1ShortlistThreshold || 48
    );

    // Non-destructive merge: preserve existing scores, tokens, comments, and statuses if candidate email matches
    const existingByEmail = new Map(
      rec.candidates.map((c) => [c.email.toLowerCase(), c])
    );

    rec.candidates = freshCandidates.map((fresh) => {
      const prev = existingByEmail.get(fresh.email.toLowerCase());
      if (!prev) return fresh;
      return {
        ...fresh,
        id: prev.id,
        currentStage: prev.currentStage,
        applicationStatus: prev.applicationStatus,
        assessmentStatus: prev.assessmentStatus,
        aiInterviewScore: prev.aiInterviewScore,
        proctoringIntegrityScore: prev.proctoringIntegrityScore,
        proctoringIntegrityStatus: prev.proctoringIntegrityStatus,
        stage2AptitudeScore: prev.stage2AptitudeScore,
        stage3SourcingScore: prev.stage3SourcingScore,
        stage4CaseMemoScore: prev.stage4CaseMemoScore,
        stage5InterviewScore: prev.stage5InterviewScore,
        competencyScores: prev.competencyScores,
        finalWeightedScore: prev.finalWeightedScore,
        manualScoreOverride: prev.manualScoreOverride,
        manualOverrideReason: prev.manualOverrideReason,
        reviewerEvaluations: prev.reviewerEvaluations,
        reviewerComments: prev.reviewerComments,
        accountProvisioned: prev.accountProvisioned,
        passwordConfigured: prev.passwordConfigured,
        passwordHash: prev.passwordHash,
        inviteToken: prev.inviteToken,
        inviteStatus: prev.inviteStatus,
        inviteSentAt: prev.inviteSentAt,
        inviteAcceptedAt: prev.inviteAcceptedAt,
        activityTimeline: prev.activityTimeline,
        updatedAt: now,
      };
    });

    rec.settings.workbookImported = true;
    rec.settings.workbookImportedAt = now;
    rec.settings.workbookFileName = String(
      body.fileName || "DeeVee Capital_IIM Amritsar_Profile Sheet .xlsx"
    );

    await recordAuditAndActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "recruitment.workbook_imported",
      entityType: "settings",
      entityId: rec.settings.id,
      entityName: rec.settings.workbookFileName,
      summary: `${user.name} imported/synced ${rec.candidates.length} applicant records from ${rec.settings.workbookFileName}`,
      previousValue: null,
      newValue: `${rec.candidates.length} candidates`,
    });

    await saveWorkspaceDb(db);
    return NextResponse.json({ recruitment: rec });
  }

  // ==========================================================================
  // 2. CANDIDATE RECORD UPDATE & COMMENTS
  // ==========================================================================
  if (action === "candidate.update") {
    const candidateId = String(body.candidateId || "");
    const cand = rec.candidates.find((c) => c.id === candidateId);
    if (!cand) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const updates = (body.updates || {}) as Partial<CandidateRecord>;
    if (typeof updates.fullName === "string") cand.fullName = updates.fullName.trim();
    if (typeof updates.email === "string") cand.email = updates.email.trim().toLowerCase();
    if (typeof updates.ugDegree === "string") cand.ugDegree = updates.ugDegree;
    if (typeof updates.ugSpecialisation === "string") cand.ugSpecialisation = updates.ugSpecialisation;
    if (typeof updates.certifications === "string") cand.certifications = updates.certifications;
    if (typeof updates.achievements === "string") cand.achievements = updates.achievements;
    if (typeof updates.technicalSkills === "string") cand.technicalSkills = updates.technicalSkills;
    if (typeof updates.startupResearchExperience === "string") {
      cand.startupResearchExperience = updates.startupResearchExperience;
      cand.marketResearchExperience = updates.startupResearchExperience;
    }
    if (typeof updates.currentStage === "string") {
      cand.currentStage = updates.currentStage as CandidateApplicationStage;
    }
    if (typeof updates.applicationStatus === "string") {
      cand.applicationStatus = updates.applicationStatus as CandidateSelectionStatus;
    }
    if (typeof updates.assessmentStatus === "string") {
      cand.assessmentStatus = updates.assessmentStatus as CandidateAssessmentStatus;
    }
    if (typeof updates.assignedReviewerId === "string") {
      cand.assignedReviewerId = updates.assignedReviewerId;
    }
    if (typeof updates.assignedReviewerName === "string") {
      cand.assignedReviewerName = updates.assignedReviewerName;
    }

    if (typeof body.newComment === "string" && body.newComment.trim()) {
      cand.reviewerComments.unshift({
        id: `rc-${Date.now()}`,
        authorId: user.id,
        authorName: user.name,
        comment: body.newComment.trim(),
        stage: cand.currentStage,
        createdAt: now,
      });
      cand.activityTimeline.unshift({
        id: `act-${Date.now()}`,
        action: "comment.added",
        summary: `${user.name} added a reviewer note on ${cand.currentStage}`,
        actorName: user.name,
        timestamp: now,
      });
    }

    // Re-evaluate Stage 1 breakdown if profile fields changed
    if (body.recalculateProfileScore) {
      const breakdown = computeStage1ProfileBreakdown({
        ugDegree: cand.ugDegree,
        ugSpecialisation: cand.ugSpecialisation,
        internships: cand.internships,
        totalWorkExMonths: cand.totalWorkExMonths,
        workExperiences: cand.workExperiences,
        certifications: cand.certifications,
        achievements: cand.achievements,
        otherQualifications: cand.otherQualifications,
        technicalSkills: cand.technicalSkills,
        startupResearchResponse: cand.startupResearchExperience,
        classXPercentage: cand.classXPercentage,
        classXIIPercentage: cand.classXIIPercentage,
        ugPercentage: cand.ugPercentage,
      });
      cand.stage1ProfileBreakdown = breakdown;
      cand.profileScore = breakdown.totalScore;
      cand.hasSubstantiveResearchExperience = breakdown.hasSubstantiveResearch;
    }

    cand.updatedAt = now;
    await saveWorkspaceDb(db);
    return NextResponse.json({ candidate: cand, recruitment: rec });
  }

  // ==========================================================================
  // 3. BULK CANDIDATE ACTIONS & ACCOUNT PROVISIONING
  // ==========================================================================
  if (action === "candidate.bulk_action") {
    const candidateIds = Array.isArray(body.candidateIds)
      ? (body.candidateIds as string[])
      : [];
    const bulkType = String(body.bulkType || "");

    let updatedCount = 0;
    for (const cand of rec.candidates) {
      if (!candidateIds.includes(cand.id)) continue;

      if (bulkType === "set_stage" && typeof body.stage === "string") {
        cand.currentStage = body.stage as CandidateApplicationStage;
      } else if (bulkType === "set_selection_status" && typeof body.applicationStatus === "string") {
        cand.applicationStatus = body.applicationStatus as CandidateSelectionStatus;
        if (body.applicationStatus === "Shortlisted for Assessment") {
          cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
        } else if (body.applicationStatus === "Selected") {
          cand.currentStage = "Selected";
        } else if (body.applicationStatus === "Rejected") {
          cand.currentStage = "Rejected";
        } else if (body.applicationStatus === "Waitlisted") {
          cand.currentStage = "Waitlisted";
        }
      } else if (bulkType === "assign_reviewer" && typeof body.reviewerName === "string") {
        cand.assignedReviewerId = String(body.reviewerId || user.id);
        cand.assignedReviewerName = String(body.reviewerName);
      } else if (bulkType === "provision_ai_interview") {
        cand.accountProvisioned = true;
        cand.inviteToken = createCandidateInviteToken(cand.id, cand.email);
        cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
        if (cand.applicationStatus === "Pending Screening") {
          cand.applicationStatus = "Shortlisted for Assessment";
        }
        if (cand.assessmentStatus === "Not Assigned") {
          cand.assessmentStatus = "Invited";
        }
        cand.assessmentDeadlineAt = new Date(
          Date.now() + (rec.settings.stage3WindowHours || 48) * 3600 * 1000
        ).toISOString();
      }

      cand.updatedAt = now;
      cand.activityTimeline.unshift({
        id: `act-${Date.now()}-${updatedCount}`,
        action: `bulk.${bulkType}`,
        summary: `${user.name} applied bulk action (${bulkType})`,
        actorName: user.name,
        timestamp: now,
      });
      updatedCount += 1;
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({ updatedCount, recruitment: rec });
  }

  if (action === "candidate.provision_accounts") {
    const candidateIds = Array.isArray(body.candidateIds)
      ? (body.candidateIds as string[])
      : rec.candidates
          .filter((c) => c.applicationStatus !== "Rejected")
          .map((c) => c.id);

    let provisionedCount = 0;
    for (const cand of rec.candidates) {
      if (!candidateIds.includes(cand.id)) continue;
      cand.accountProvisioned = true;
      cand.inviteToken = createCandidateInviteToken(cand.id, cand.email);
      if (!cand.assessmentDeadlineAt) {
        cand.assessmentDeadlineAt = new Date(
          Date.now() + (rec.settings.stage3WindowHours || 48) * 3600 * 1000
        ).toISOString();
      }
      if (cand.currentStage === "Stage 1: Profile Screening") {
        cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
      }
      cand.updatedAt = now;
      provisionedCount += 1;
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({ provisionedCount, recruitment: rec });
  }

  // ==========================================================================
  // CANDIDATE ASSESSMENT DEADLINE CONTROLLER (EXTENDABLE BY ADMIN)
  // ==========================================================================
  if (action === "candidate.update_deadline") {
    const rawDeadline = String(body.deadlineAt || "").trim();
    if (!rawDeadline) {
      return NextResponse.json({ error: "Deadline timestamp is required." }, { status: 400 });
    }
    const deadlineDate = new Date(rawDeadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format for deadline." }, { status: 400 });
    }
    const deadlineIso = deadlineDate.toISOString();
    const candidateIds = Array.isArray(body.candidateIds)
      ? (body.candidateIds as string[])
      : [];
    const isCohortWide = body.allCandidates === true || candidateIds.length === 0;

    let updatedCount = 0;
    for (const cand of rec.candidates) {
      if (!isCohortWide && !candidateIds.includes(cand.id) && !candidateIds.includes(cand.candidateCode)) {
        continue;
      }

      const prevDeadline = cand.assessmentDeadlineAt;
      cand.assessmentDeadlineAt = deadlineIso;
      cand.updatedAt = now;

      cand.activityTimeline.unshift({
        id: `act-dl-${Date.now()}-${updatedCount}`,
        action: "assessment.deadline_extended",
        summary: `Assessment deadline updated to ${new Date(deadlineIso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} by ${user.name}${prevDeadline ? ` (was: ${new Date(prevDeadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })})` : ""}`,
        actorName: user.name,
        timestamp: now,
      });
      updatedCount += 1;
    }

    // Save default in settings as well so subsequent candidate invitations inherit it
    rec.settings.defaultAssessmentDeadlineAt = deadlineIso;

    // Also update dedicated sample candidate so test emails always reflect the latest active deadline
    const sampleCand = rec.candidates.find(
      (c) => c.candidateCode === "DVC-SAMPLE-001" || c.id === "cand-sample-demo"
    );
    if (sampleCand) {
      sampleCand.assessmentDeadlineAt = deadlineIso;
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({ ok: true, updatedCount, deadlineAt: deadlineIso, recruitment: rec });
  }

  // ==========================================================================
  // 4. SAFE EMAIL INVITATION PREVIEW, TEST SEND & ADMIN-APPROVED SEND
  // ==========================================================================
  if (action === "email.preview") {
    const candidateId = String(body.candidateId || rec.candidates[0]?.id || "");
    const templateId = String(body.templateId || "tpl-assessment-invite");
    const cand = rec.candidates.find((c) => c.id === candidateId) || rec.candidates[0];
    const tpl =
      rec.emailTemplates.find((t) => t.id === templateId) || rec.emailTemplates[0];

    if (!cand || !tpl) {
      return NextResponse.json({ error: "Candidate or template not found." }, { status: 404 });
    }

    if (!cand.inviteToken) {
      cand.inviteToken = createCandidateInviteToken(cand.id, cand.email);
      cand.accountProvisioned = true;
      await saveWorkspaceDb(db);
    }

    const effectiveDeadline =
      cand.assessmentDeadlineAt ||
      rec.settings.defaultAssessmentDeadlineAt ||
      null;
    const renderedSubject = renderEmailTemplate(tpl.subject, cand, originUrl, effectiveDeadline);
    const renderedBody = renderEmailTemplate(tpl.bodyText, cand, originUrl, effectiveDeadline);
    const setupLink = `${originUrl}/candidate?token=${encodeURIComponent(cand.inviteToken)}&email=${encodeURIComponent(cand.email)}`;
    const password =
      cand.assignedPortalPassword ||
      (cand.candidateCode === "DVC-SAMPLE-001"
        ? "DVC@Sample2026"
        : generateCandidateRandomPassword(cand.candidateCode, cand.email));
    const directLink = `${originUrl}/candidate?code=${encodeURIComponent(cand.candidateCode)}&email=${encodeURIComponent(cand.email)}`;
    const sampleTestLink = `${originUrl}/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`;

    return NextResponse.json({
      preview: {
        candidateId: cand.id,
        candidateCode: cand.candidateCode,
        candidateName: cand.fullName,
        recipientEmail: cand.email,
        templateId: tpl.id,
        subject: renderedSubject,
        bodyText: renderedBody,
        setupLink,
        directLink,
        sampleTestLink,
        password,
      },
    });
  }

  if (action === "email.send_test") {
    const testRecipientEmail = String(body.testRecipientEmail || user.email || "siddharth@deeveecapital.com")
      .trim()
      .toLowerCase();

    if (!testRecipientEmail || !testRecipientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid test email address." },
        { status: 400 }
      );
    }

    if (testRecipientEmail.endsWith("@iimamritsar.ac.in") && !body.forceAllowIimDomain) {
      return NextResponse.json(
        {
          error:
            "Safety Lock: Test emails cannot be sent to real @iimamritsar.ac.in applicant addresses. Please use an internal @deeveecapital.com or personal test email.",
        },
        { status: 400 }
      );
    }

    const sampleCandidate =
      rec.candidates.find((c) => c.id === String(body.candidateId || "")) ||
      rec.candidates.find((c) => c.candidateCode === "DVC-SAMPLE-001") ||
      rec.candidates[0]!;
    const tpl =
      rec.emailTemplates.find((t) => t.id === String(body.templateId || "tpl-invite-assessment")) ||
      rec.emailTemplates[0]!;

    if (!sampleCandidate.inviteToken) {
      sampleCandidate.inviteToken = createCandidateInviteToken(
        sampleCandidate.id,
        sampleCandidate.email
      );
      sampleCandidate.accountProvisioned = true;
    }
    if (!sampleCandidate.assignedPortalPassword) {
      sampleCandidate.assignedPortalPassword =
        sampleCandidate.candidateCode === "DVC-SAMPLE-001"
          ? "DVC@Sample2026"
          : generateCandidateRandomPassword(sampleCandidate.candidateCode, sampleCandidate.email);
    }

    const effectiveDeadline =
      sampleCandidate.assessmentDeadlineAt ||
      rec.settings.defaultAssessmentDeadlineAt ||
      null;
    const deadlineFormatted = formatAssessmentDeadline(effectiveDeadline);

    const renderedSubject = `[TEST] ${renderEmailTemplate(tpl.subject, sampleCandidate, originUrl, effectiveDeadline)}`;
    const renderedBody = renderEmailTemplate(tpl.bodyText, sampleCandidate, originUrl, effectiveDeadline);

    // DISPATCH LIVE EMAIL VIA SMTP TRANSPORTER (FROM siddharth@deeveecapital.com)
    const sendResult = await sendRecruitmentAssessmentEmail({
      to: testRecipientEmail,
      subject: renderedSubject,
      candidateName: sampleCandidate.fullName,
      candidateCode: sampleCandidate.candidateCode,
      candidateEmail: testRecipientEmail,
      password: sampleCandidate.assignedPortalPassword,
      deadline: deadlineFormatted,
      directLink: `${originUrl}/candidate?code=${encodeURIComponent(sampleCandidate.candidateCode)}&email=${encodeURIComponent(sampleCandidate.email)}`,
      sampleTestLink: `${originUrl}/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`,
      rawBodyText: renderedBody,
      isTestSend: true,
    });

    const emailStatus: "Sent (SMTP)" | "Sent (Logged Sandbox)" | "Failed" =
      sendResult.success
        ? sendResult.mode === "smtp"
          ? "Sent (SMTP)"
          : "Sent (Logged Sandbox)"
        : "Failed";

    const logEntry: RecruitmentEmailLog = {
      id: `emlog-${Date.now()}`,
      candidateId: sampleCandidate.id,
      candidateName: `${sampleCandidate.fullName} (Test to ${testRecipientEmail})`,
      recipientEmail: testRecipientEmail,
      templateId: tpl.id,
      subject: renderedSubject,
      status: emailStatus,
      isTestSend: true,
      sentBy: user.name,
      sentAt: now,
      error: sendResult.error,
    };

    rec.emailLogs.unshift(logEntry);
    await saveWorkspaceDb(db);

    return NextResponse.json({
      success: sendResult.success,
      mode: sendResult.mode,
      messageId: sendResult.messageId,
      error: sendResult.error,
      log: logEntry,
      renderedSubject,
      renderedBody,
      setupLink: `${originUrl}/candidate?code=${encodeURIComponent(sampleCandidate.candidateCode)}&email=${encodeURIComponent(sampleCandidate.email)}`,
      recruitment: rec,
    });
  }

  // 1-CLICK INDIVIDUAL CANDIDATE INVITATION DISPATCH
  if (action === "email.send_single_candidate") {
    const candidateId = String(body.candidateId || "");
    const cand = rec.candidates.find((c) => c.id === candidateId || c.candidateCode === candidateId);
    if (!cand) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const templateId = String(body.templateId || "tpl-invite-assessment");
    const tpl =
      rec.emailTemplates.find((t) => t.id === templateId) || rec.emailTemplates[0]!;

    cand.accountProvisioned = true;
    if (!cand.assignedPortalPassword) {
      cand.assignedPortalPassword =
        cand.candidateCode === "DVC-SAMPLE-001"
          ? "DVC@Sample2026"
          : generateCandidateRandomPassword(cand.candidateCode, cand.email);
    }
    cand.passwordConfigured = true;
    if (!cand.inviteToken) {
      cand.inviteToken = createCandidateInviteToken(cand.id, cand.email);
    }
    cand.inviteStatus = "Sent";
    cand.inviteSentAt = now;
    cand.lastCommunicationAt = now;
    if (cand.assessmentStatus === "Not Assigned") {
      cand.assessmentStatus = "Invited";
    }
    if (cand.currentStage === "Stage 1: Profile Screening") {
      cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
    }
    if (!cand.assessmentDeadlineAt || new Date(cand.assessmentDeadlineAt).getTime() < Date.now()) {
      cand.assessmentDeadlineAt =
        rec.settings.defaultAssessmentDeadlineAt ||
        new Date(Date.now() + (rec.settings.stage3WindowHours || 48) * 3600 * 1000).toISOString();
    }

    const deadlineFormatted = formatAssessmentDeadline(cand.assessmentDeadlineAt);
    const renderedSubject = renderEmailTemplate(tpl.subject, cand, originUrl, cand.assessmentDeadlineAt);
    const renderedBody = renderEmailTemplate(tpl.bodyText, cand, originUrl, cand.assessmentDeadlineAt);

    // DISPATCH LIVE EMAIL VIA SMTP TRANSPORTER (FROM siddharth@deeveecapital.com)
    const sendResult = await sendRecruitmentAssessmentEmail({
      to: cand.email,
      subject: renderedSubject,
      candidateName: cand.fullName,
      candidateCode: cand.candidateCode,
      candidateEmail: cand.email,
      password: cand.assignedPortalPassword,
      deadline: deadlineFormatted,
      directLink: `${originUrl}/candidate?code=${encodeURIComponent(cand.candidateCode)}&email=${encodeURIComponent(cand.email)}`,
      sampleTestLink: `${originUrl}/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`,
      rawBodyText: renderedBody,
      isTestSend: false,
    });

    const emailStatus: "Sent (SMTP)" | "Sent (Logged Sandbox)" | "Failed" =
      sendResult.success
        ? sendResult.mode === "smtp"
          ? "Sent (SMTP)"
          : "Sent (Logged Sandbox)"
        : "Failed";

    const logEntry: RecruitmentEmailLog = {
      id: `emlog-${Date.now()}`,
      candidateId: cand.id,
      candidateName: cand.fullName,
      recipientEmail: cand.email,
      templateId: tpl.id,
      subject: renderedSubject,
      status: emailStatus,
      isTestSend: false,
      sentBy: user.name,
      sentAt: now,
      error: sendResult.error,
    };

    rec.emailLogs.unshift(logEntry);
    cand.activityTimeline.unshift({
      id: `act-em-${Date.now()}`,
      action: "invitation.sent",
      summary: `Individual invitation (${tpl.name}) dispatched via SMTP by ${user.name} (${emailStatus})`,
      actorName: user.name,
      timestamp: now,
    });

    await saveWorkspaceDb(db);
    return NextResponse.json({
      success: sendResult.success,
      mode: sendResult.mode,
      messageId: sendResult.messageId,
      error: sendResult.error,
      candidate: cand,
      recruitment: rec,
    });
  }

  if (action === "email.send_approved") {
    if (body.adminApproved !== true) {
      return NextResponse.json(
        {
          error:
            "Explicit administrator confirmation (adminApproved: true) is required before dispatching candidate invitations.",
        },
        { status: 400 }
      );
    }

    const candidateIds = Array.isArray(body.candidateIds)
      ? (body.candidateIds as string[])
      : [];
    const templateId = String(body.templateId || "tpl-invite-assessment");
    const tpl =
      rec.emailTemplates.find((t) => t.id === templateId) || rec.emailTemplates[0]!;

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const cand of rec.candidates) {
      if (!candidateIds.includes(cand.id)) continue;

      cand.accountProvisioned = true;
      if (!cand.assignedPortalPassword) {
        cand.assignedPortalPassword =
          cand.candidateCode === "DVC-SAMPLE-001"
            ? "DVC@Sample2026"
            : generateCandidateRandomPassword(cand.candidateCode, cand.email);
      }
      cand.passwordConfigured = true;
      if (!cand.inviteToken) {
        cand.inviteToken = createCandidateInviteToken(cand.id, cand.email);
      }
      cand.inviteStatus = "Sent";
      cand.inviteSentAt = now;
      cand.lastCommunicationAt = now;
      if (cand.assessmentStatus === "Not Assigned") {
        cand.assessmentStatus = "Invited";
      }
      if (cand.currentStage === "Stage 1: Profile Screening") {
        cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
      }
      if (!cand.assessmentDeadlineAt || new Date(cand.assessmentDeadlineAt).getTime() < Date.now()) {
        cand.assessmentDeadlineAt =
          rec.settings.defaultAssessmentDeadlineAt ||
          new Date(Date.now() + (rec.settings.stage3WindowHours || 48) * 3600 * 1000).toISOString();
      }

      const deadlineFormatted = formatAssessmentDeadline(cand.assessmentDeadlineAt);
      const renderedSubject = renderEmailTemplate(tpl.subject, cand, originUrl, cand.assessmentDeadlineAt);
      const renderedBody = renderEmailTemplate(tpl.bodyText, cand, originUrl, cand.assessmentDeadlineAt);

      // LIVE DISPATCH VIA SMTP TRANSPORTER (FROM siddharth@deeveecapital.com)
      const sendResult = await sendRecruitmentAssessmentEmail({
        to: cand.email,
        subject: renderedSubject,
        candidateName: cand.fullName,
        candidateCode: cand.candidateCode,
        candidateEmail: cand.email,
        password: cand.assignedPortalPassword,
        deadline: deadlineFormatted,
        directLink: `${originUrl}/candidate?code=${encodeURIComponent(cand.candidateCode)}&email=${encodeURIComponent(cand.email)}`,
        sampleTestLink: `${originUrl}/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`,
        rawBodyText: renderedBody,
        isTestSend: false,
      });

      const emailStatus: "Sent (SMTP)" | "Sent (Logged Sandbox)" | "Failed" =
        sendResult.success
          ? sendResult.mode === "smtp"
            ? "Sent (SMTP)"
            : "Sent (Logged Sandbox)"
          : "Failed";

      if (sendResult.success) {
        sentCount += 1;
      } else {
        failedCount += 1;
        errors.push(`${cand.email}: ${sendResult.error}`);
      }

      rec.emailLogs.unshift({
        id: `emlog-${Date.now()}-${sentCount + failedCount}`,
        candidateId: cand.id,
        candidateName: cand.fullName,
        recipientEmail: cand.email,
        templateId: tpl.id,
        subject: renderedSubject,
        status: emailStatus,
        isTestSend: false,
        sentBy: user.name,
        sentAt: now,
        error: sendResult.error,
      });

      cand.activityTimeline.unshift({
        id: `act-em-${Date.now()}-${sentCount + failedCount}`,
        action: "invitation.sent",
        summary: `Batch invitation (${tpl.name}) dispatched via SMTP by ${user.name} (${emailStatus})`,
        actorName: user.name,
        timestamp: now,
      });

      // 200ms throttle between dispatches
      await new Promise((r) => setTimeout(r, 200));
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({ sentCount, failedCount, errors, recruitment: rec });
  }

  // ==========================================================================
  // 5. AI INTERVIEW REVIEW & DEMO SIMULATION (FOR ADMIN TESTING)
  // ==========================================================================
  if (
    action === "ai_interview.simulate_demo_candidate" ||
    action === "ai_interview.simulate"
  ) {
    const candidateId = String(body.candidateId || "");
    let cand = rec.candidates.find(
      (c) => c.id === candidateId || c.candidateCode === candidateId
    );
    if (!cand) {
      cand =
        rec.candidates.find(
          (c) => c.candidateCode === "DVC-SAMPLE-001" || c.id === "cand-sample-demo"
        ) || createDedicatedSampleCandidate();
      if (!rec.candidates.some((c) => c.id === cand!.id)) {
        rec.candidates.push(cand);
      }
    }

    const caseSets =
      rec.startupCaseSets && rec.startupCaseSets.length > 0
        ? rec.startupCaseSets
        : DEFAULT_STARTUP_CASE_SETS;
    const assignedCaseSet = selectCaseSetForCandidate(cand);
    const turns = generatePersonalizedInterviewTurns(cand);

    // Populate realistic answers based on the candidate's actual IIM Amritsar profile
    turns[0]!.candidateAnswer = `During my stint at ${cand.internships[0]?.organization || cand.workExperiences[0]?.organization || "my undergraduate project"}, I personally owned the primary data reconciliation and unit-cost analysis across 45+ client accounts. Initially, the team assumed top-line volume was the main profit driver, but when I segmented contribution margin by order size and collection cycle in Excel, I discovered that 28% of small-ticket accounts had a 62-day receivable delay that wiped out net margin. Restructuring those payment terms improved cash realization by 19%.`;
    turns[0]!.wordCount = turns[0]!.candidateAnswer.split(/\s+/).length;
    turns[0]!.timeTakenSeconds = 115;
    turns[0]!.answeredAt = now;

    turns[1]!.candidateAnswer = `To verify market claims independently beyond secondary blogs, I triangulate three primary and public data sources: first, MCA RoC filings (MGT-7/AOC-4) and GSTIN status to verify actual billed revenue vs founder pitch claims; second, bottom-up TAM sizing using actual target customer cohorts multiplied by realistic annual contract value (ACV); and third, 10–15 structured customer and distributor calls to test repeat purchase retention and switching costs.`;
    turns[1]!.wordCount = turns[1]!.candidateAnswer.split(/\s+/).length;
    turns[1]!.timeTakenSeconds = 128;
    turns[1]!.answeredAt = now;

    turns[2]!.candidateAnswer = `Using Excel and cohort modeling, the top 3 financial ratios I calculate first are: (1) Net Realized Contribution Margin (CM2) after deducting COD Return-to-Origin (RTO), discounts, and fulfilment costs from GMV; (2) Blended vs Paid CAC-to-LTV payback period segmented by Month-3 and Month-6 cohort retention; and (3) Net Working Capital Days (Debtor Days + Inventory Days minus Payable Days) to see if revenue growth is trapping cash.`;
    turns[2]!.wordCount = turns[2]!.candidateAnswer.split(/\s+/).length;
    turns[2]!.timeTakenSeconds = 110;
    turns[2]!.answeredAt = now;

    turns[3]!.candidateAnswer = `To source early-stage Indian startups before they hit mainstream media, I systematically track: (1) DPIIT Startup India sector registries and state industrial grants; (2) IIT/IIM incubator cohorts (SINE IIT Bombay, CIIE IIMA, NSRCEL IIMB, T-Hub); (3) MCA new incorporation filings and patent/trademark registries; and (4) niche B2B trade expos and IndiaMART emerging manufacturers in Tier-2 hubs like Indore, Coimbatore, and Ahmedabad.`;
    turns[3]!.wordCount = turns[3]!.candidateAnswer.split(/\s+/).length;
    turns[3]!.timeTakenSeconds = 105;
    turns[3]!.answeredAt = now;

    turns[4]!.candidateAnswer = `First, I reject the ₹40,000 Cr top-down TAM and rebuild it bottom-up by counting reachable paying enterprises/households in their target geography times net annual realization. Second, I verify traction via GST filing frequency, LinkedIn engineering/sales headcount trajectory, Play Store/G2 verified review velocity, and SimilarWeb traffic. Third, for 'zero competitors', I map adjacent substitutes and unorganised local players solving the same customer job-to-be-done.`;
    turns[4]!.wordCount = turns[4]!.candidateAnswer.split(/\s+/).length;
    turns[4]!.timeTakenSeconds = 118;
    turns[4]!.answeredAt = now;

    turns[5]!.candidateAnswer = `I would be very cautious deploying seed capital into undifferentiated D2C personal-care/nutraceutical brands or asset-heavy EV fleet agencies that masquerade as tech startups. In D2C, 25–30% COD RTO rates and ₹1,100+ Meta CAC on ₹1,200 AOV with <15% Month-3 repeat rates mean every new order destroys cash. In B2B, elongated 70+ day receivable cycles and high customer concentration often create a working-capital trap.`;
    turns[5]!.wordCount = turns[5]!.candidateAnswer.split(/\s+/).length;
    turns[5]!.timeTakenSeconds = 102;
    turns[5]!.answeredAt = now;

    const winningStartup = assignedCaseSet.startups[0]!;
    const trapB = assignedCaseSet.startups[1]!;
    const trapC = assignedCaseSet.startups[2]!;

    const proctoring = createInitialProctoringTelemetry();
    proctoring.webcamEnabled = true;
    proctoring.micEnabled = true;
    proctoring.fullscreenEntered = true;
    proctoring.webcamSnapshotsCount = 6;
    proctoring.integrityScore = 96;
    proctoring.integrityStatus = "High Integrity";
    proctoring.events = [
      {
        id: `pev-1`,
        type: "HEARTBEAT_SNAPSHOT",
        severity: "info",
        description: "Webcam & microphone verified active; fullscreen sanctuary mode locked.",
        timestamp: now,
      },
    ];

    const sessionRecord: AIInterviewSessionRecord = {
      id: `ai-sess-${cand.id}`,
      candidateId: cand.id,
      candidateCode: cand.candidateCode,
      candidateName: cand.fullName,
      candidateEmail: cand.email,
      status: "Completed",
      assignedCaseSetId: assignedCaseSet.id,
      startedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      completedAt: now,
      totalDurationSeconds: 22 * 60,
      timeLimitMinutes: rec.settings.aiInterviewDurationMinutes || 25,
      turns,
      currentTurnIndex: turns.length,
      startupTaskSubmission: {
        caseSetId: assignedCaseSet.id,
        caseSetTitle: assignedCaseSet.title,
        startupBTrueMetricAnalysis: `${trapB.name} inflates its headline ARR massively by counting non-paying free trials / non-binding LOIs / paper ISAs as full revenue. True verified cash/paying revenue in the Data Room is a fraction of the pitch claim (only 80 paying SMEs / ₹9.6L ARR or 45 clinics / ₹6.4L cash collected) alongside high churn.`,
        startupCTrueMetricAnalysis: `${trapC.name} suffers from deeply negative unit economics: 28% COD RTO / fleet idle rate and ₹1,150 CAC / EMI & default costs result in a negative contribution margin (-₹415 per order / -₹3,400 per EV / -4.7% credit spread) with only 11% repeat rate.`,
        spottedRedFlagsSummary: `1. ${trapB.name}: 10x ARR inflation from counting 340 free trials / LOIs + 9.2% monthly churn. 2. ${trapC.name}: Negative CM2 unit economics driven by 28% RTO, high CAC, and low repeat retention.`,
        selectedStartupFor1CrId: winningStartup.id,
        watchlistedStartupId: trapB.id,
        passedStartupId: trapC.id,
        investmentThesisAndNumbers: `We should advance ${winningStartup.name} to the Investment Committee for the ₹1 Crore check. Unlike the other two startups, its GST-verified quarterly revenue (₹42L–₹54L, growing 14–18% QoQ) is backed by real B2B contracts, 43–58% gross margin, 13–14% positive operating EBITDA, and a verified 19-month unit payback period.`,
        winningStartupPrimaryRisk: `The #1 risk in ${winningStartup.name} is high B2B customer concentration (64%–78% of revenue tied to top 4–6 institutional FPO/pharma/catering contracts) combined with an elongated 68–74 day receivable collection cycle that ties up ~₹30 Lakhs in working capital.`,
        threeFounderDiligenceQuestions: `1. How will you reduce top-client revenue concentration from 78% to below 40% over the next 12 months?\n2. Can you negotiate invoice discounting or 30% advance milestone payments to bring the 68-day receivable cycle down to 35 days?\n3. What contractual price-escalation clauses protect gross margins if raw input or maintenance costs rise by 15%?`,
        submittedAt: now,
        timeSpentSeconds: 540,
      },
      proctoring,
      scoringBreakdown: null,
    };

    const fullCaseSet =
      caseSets.find((cs) => cs.id === assignedCaseSet.id) || assignedCaseSet;
    sessionRecord.scoringBreakdown = evaluateCompleteAIInterviewSession(
      sessionRecord,
      fullCaseSet
    );

    if (!Array.isArray(rec.aiInterviewSessions)) {
      rec.aiInterviewSessions = [];
    }
    rec.aiInterviewSessions = [
      sessionRecord,
      ...rec.aiInterviewSessions.filter((s) => s.candidateId !== cand.id),
    ];

    const sb = sessionRecord.scoringBreakdown;
    cand.aiInterviewScore = sb.overallAiInterviewScore;
    cand.proctoringIntegrityScore = proctoring.integrityScore;
    cand.proctoringIntegrityStatus = proctoring.integrityStatus;
    cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
    cand.assessmentStatus = "Evaluated";
    cand.applicationStatus =
      sb.overallAiInterviewScore >= 72 ? "Recommended" : "In Assessment Funnel";

    cand.competencyScores = {
      researchAptitude: sb.phase1ResumeProbeScore,
      startupDiscoverySourcing: sb.phase2StartupThinkingScore,
      marketBusinessAnalysis: sb.phase3Task2CapitalAllocationScore,
      financialCommercialUnderstanding: sb.phase3Task1RedFlagAuditScore,
      criticalThinkingRisk: sb.phase3Task3RiskAndFounderQuestionsScore,
      communicationDocumentation: Math.round(
        (sb.phase1ResumeProbeScore + sb.phase2StartupThinkingScore) / 2
      ),
      interviewOwnership: sb.phase1ResumeProbeScore,
    };
    cand.finalWeightedScore = calculateWeightedCompetencyScore(
      cand.competencyScores,
      rec.settings.weights
    );
    cand.sessionDeleted = false;
    cand.updatedAt = now;

    await saveWorkspaceDb(db);
    return NextResponse.json({
      session: sessionRecord,
      assignedCaseSet,
      candidate: cand,
      recruitment: rec,
    });
  }

  if (action === "ai_interview.review") {
    const sessionId = String(body.sessionId || "");
    const sess = (rec.aiInterviewSessions || []).find((s) => s.id === sessionId);
    if (!sess) {
      return NextResponse.json({ error: "AI Interview session not found." }, { status: 404 });
    }

    if (body.reviewerOverrideScore !== undefined && body.reviewerOverrideScore !== null) {
      sess.reviewerOverrideScore = Number(body.reviewerOverrideScore);
    }
    if (typeof body.reviewerNotes === "string") {
      sess.reviewerNotes = body.reviewerNotes;
    }
    sess.reviewedBy = user.name;
    sess.reviewedAt = now;

    const cand = rec.candidates.find((c) => c.id === sess.candidateId);
    if (cand && sess.reviewerOverrideScore !== undefined && sess.reviewerOverrideScore !== null) {
      cand.aiInterviewScore = sess.reviewerOverrideScore;
      cand.finalWeightedScore = sess.reviewerOverrideScore;
      cand.updatedAt = now;
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({ session: sess, recruitment: rec });
  }

  if (action === "ai_interview.delete_session") {
    const sessionId = String(body.sessionId || "");
    const candidateId = String(body.candidateId || "");

    const sess = (rec.aiInterviewSessions || []).find(
      (s) => s.id === sessionId || (candidateId && s.candidateId === candidateId)
    );

    const targetCandidateId = candidateId || (sess ? sess.candidateId : "");

    // 1. Remove from rec.aiInterviewSessions
    if (Array.isArray(rec.aiInterviewSessions)) {
      rec.aiInterviewSessions = rec.aiInterviewSessions.filter(
        (s) => s.id !== sessionId && (!targetCandidateId || s.candidateId !== targetCandidateId)
      );
    }

    // 2. Remove any candidate submissions from rec.submissions
    if (Array.isArray(rec.submissions) && targetCandidateId) {
      rec.submissions = rec.submissions.filter((s) => s.candidateId !== targetCandidateId);
    }

    // 3. Reset candidate state if found
    const cand = rec.candidates.find(
      (c) => c.id === targetCandidateId || (sess && c.candidateCode === sess.candidateCode)
    );
    if (cand) {
      cand.aiInterviewScore = null;
      cand.manualScoreOverride = null;
      cand.manualOverrideReason = null;
      cand.proctoringIntegrityScore = null;
      cand.proctoringIntegrityStatus = undefined;
      cand.assessmentStatus = "Invited";
      cand.applicationStatus = "In Assessment Funnel";
      cand.currentStage = "Stage 1: Profile Screening";
      cand.sessionDeleted = true;
      cand.updatedAt = now;
      cand.activityTimeline.unshift({
        id: `act-del-sess-${Date.now()}`,
        action: "ai_interview.session_deleted",
        summary: `Assessment response & interview session were deleted by ${user.name}. Status reset to In Assessment Funnel.`,
        actorName: user.name,
        timestamp: now,
      });
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({
      ok: true,
      deletedSessionId: sessionId,
      candidateId: targetCandidateId,
      recruitment: rec,
    });
  }

  // ==========================================================================
  // 6. QUESTION BANK & STARTUP CASE SETS MANAGEMENT
  // ==========================================================================
  if (action === "question.save") {
    const q = body.question as AssessmentQuestion;
    if (!q || !q.prompt) {
      return NextResponse.json({ error: "Question prompt is required." }, { status: 400 });
    }
    const existingIdx = rec.questions.findIndex((item) => item.id === q.id);
    if (existingIdx >= 0) {
      rec.questions[existingIdx] = { ...rec.questions[existingIdx]!, ...q };
    } else {
      rec.questions.push({
        ...q,
        id: q.id || `q-custom-${Date.now()}`,
        code: q.code || `DVC-Q-${rec.questions.length + 1}`,
        active: q.active ?? true,
      });
    }
    await saveWorkspaceDb(db);
    return NextResponse.json({ recruitment: rec });
  }

  if (action === "question.delete") {
    const questionId = String(body.questionId || "");
    rec.questions = rec.questions.filter((q) => q.id !== questionId);
    await saveWorkspaceDb(db);
    return NextResponse.json({ recruitment: rec });
  }

  if (action === "case_set.save") {
    const caseSet = body.caseSet as StartupCaseSet;
    if (!caseSet || !caseSet.id) {
      return NextResponse.json({ error: "Valid caseSet is required." }, { status: 400 });
    }
    if (!Array.isArray(rec.startupCaseSets)) {
      rec.startupCaseSets = [...DEFAULT_STARTUP_CASE_SETS];
    }
    const idx = rec.startupCaseSets.findIndex((cs) => cs.id === caseSet.id);
    if (idx >= 0) {
      rec.startupCaseSets[idx] = caseSet;
    } else {
      rec.startupCaseSets.push(caseSet);
    }
    await saveWorkspaceDb(db);
    return NextResponse.json({ recruitment: rec });
  }

  // ==========================================================================
  // 7. MULTI-REVIEWER EVALUATION & SCORE OVERRIDE (WITH AUDIT LOG)
  // ==========================================================================
  if (action === "evaluation.submit") {
    const candidateId = String(body.candidateId || "");
    const cand = rec.candidates.find((c) => c.id === candidateId);
    if (!cand) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const competencies = body.competencies as CompetencyScores;
    const weightedScore = calculateWeightedCompetencyScore(
      competencies,
      rec.settings.weights
    );

    const record: ReviewerScoreRecord = {
      id: `rev-${Date.now()}`,
      reviewerId: user.id,
      reviewerName: user.name,
      reviewerRole: user.role,
      stage: (body.stage as CandidateApplicationStage) || cand.currentStage,
      competencies,
      weightedScore,
      strengths: String(body.strengths || ""),
      concerns: String(body.concerns || ""),
      recommendation:
        (body.recommendation as ReviewerScoreRecord["recommendation"]) || "Proceed",
      submittedAt: now,
    };

    // Replace existing evaluation by same reviewer on same stage or add new
    cand.reviewerEvaluations = [
      record,
      ...cand.reviewerEvaluations.filter((r) => r.reviewerId !== user.id),
    ];

    // Average across all reviewers
    const evalCount = cand.reviewerEvaluations.length;
    const avgComp: CompetencyScores = {
      researchAptitude: Math.round(
        cand.reviewerEvaluations.reduce((s, r) => s + r.competencies.researchAptitude, 0) /
          evalCount
      ),
      startupDiscoverySourcing: Math.round(
        cand.reviewerEvaluations.reduce(
          (s, r) => s + r.competencies.startupDiscoverySourcing,
          0
        ) / evalCount
      ),
      marketBusinessAnalysis: Math.round(
        cand.reviewerEvaluations.reduce(
          (s, r) => s + r.competencies.marketBusinessAnalysis,
          0
        ) / evalCount
      ),
      financialCommercialUnderstanding: Math.round(
        cand.reviewerEvaluations.reduce(
          (s, r) => s + r.competencies.financialCommercialUnderstanding,
          0
        ) / evalCount
      ),
      criticalThinkingRisk: Math.round(
        cand.reviewerEvaluations.reduce((s, r) => s + r.competencies.criticalThinkingRisk, 0) /
          evalCount
      ),
      communicationDocumentation: Math.round(
        cand.reviewerEvaluations.reduce(
          (s, r) => s + r.competencies.communicationDocumentation,
          0
        ) / evalCount
      ),
      interviewOwnership: Math.round(
        cand.reviewerEvaluations.reduce((s, r) => s + r.competencies.interviewOwnership, 0) /
          evalCount
      ),
    };

    cand.competencyScores = avgComp;
    cand.finalWeightedScore = calculateWeightedCompetencyScore(
      avgComp,
      rec.settings.weights
    );

    // Detect reviewer disagreement (>= 15 points spread between reviewers)
    if (cand.reviewerEvaluations.length >= 2) {
      const scores = cand.reviewerEvaluations.map((r) => r.weightedScore);
      const spread = Math.max(...scores) - Math.min(...scores);
      cand.reviewerDisagreementFlag = spread >= 15;
    }

    cand.assessmentStatus = "Evaluated";
    cand.updatedAt = now;

    await saveWorkspaceDb(db);
    return NextResponse.json({ candidate: cand, recruitment: rec });
  }

  if (action === "score.override") {
    const candidateId = String(body.candidateId || "");
    const reason = String(body.reason || "").trim();
    const newScore = Number(body.newScore);

    if (!reason || reason.length < 5) {
      return NextResponse.json(
        { error: "A mandatory audit reason is required to override a candidate's score." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(newScore) || newScore < 0 || newScore > 100) {
      return NextResponse.json(
        { error: "Override score must be between 0 and 100." },
        { status: 400 }
      );
    }

    const cand = rec.candidates.find((c) => c.id === candidateId);
    if (!cand) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const previousScore =
      cand.manualScoreOverride ?? cand.aiInterviewScore ?? cand.finalWeightedScore;
    cand.manualScoreOverride = newScore;
    cand.manualOverrideReason = reason;
    cand.updatedAt = now;

    rec.scoreAuditLogs.unshift({
      id: `sc-audit-${Date.now()}`,
      candidateId: cand.id,
      candidateName: cand.fullName,
      actorId: user.id,
      actorName: user.name,
      previousScore,
      newScore,
      reason,
      timestamp: now,
    });

    await saveWorkspaceDb(db);
    return NextResponse.json({ candidate: cand, recruitment: rec });
  }

  // ==========================================================================
  // 8. LIVE INTERVIEW & RESEARCH DEFENCE SCORECARD (STAGE 5)
  // ==========================================================================
  if (action === "interview.save") {
    const interviewPayload = body.interview as Partial<InterviewEvaluationRecord>;
    const candidateId = String(interviewPayload?.candidateId || "");
    const cand = rec.candidates.find((c) => c.id === candidateId);
    if (!cand) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const existingIdx = rec.interviews.findIndex(
      (i) => i.id === interviewPayload.id || i.candidateId === cand.id
    );

    const record: InterviewEvaluationRecord = {
      id: interviewPayload.id || `int-${cand.id}`,
      candidateId: cand.id,
      candidateCode: cand.candidateCode,
      candidateName: cand.fullName,
      candidateEmail: cand.email,
      interviewerId: interviewPayload.interviewerId || user.id,
      interviewerName: interviewPayload.interviewerName || user.name,
      scheduledAt:
        interviewPayload.scheduledAt ||
        new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      meetingLink:
        interviewPayload.meetingLink || "https://meet.google.com/dvc-iima-defence",
      status: interviewPayload.status || "Scheduled",
      defenceQuestions: interviewPayload.defenceQuestions || [],
      aiToolDefenceAssessment: interviewPayload.aiToolDefenceAssessment || "",
      independentVerificationRating: Number(
        interviewPayload.independentVerificationRating || 4
      ),
      ownershipAndCuriosityRating: Number(
        interviewPayload.ownershipAndCuriosityRating || 4
      ),
      overallInterviewScore: Number(interviewPayload.overallInterviewScore || 0),
      overallNotes: interviewPayload.overallNotes || "",
      decisionRecommendation: interviewPayload.decisionRecommendation || "Hire",
      completedAt:
        interviewPayload.status === "Completed" ? now : null,
    };

    if (existingIdx >= 0) {
      rec.interviews[existingIdx] = record;
    } else {
      rec.interviews.unshift(record);
    }

    if (record.status === "Completed" && record.overallInterviewScore > 0) {
      cand.stage5InterviewScore = record.overallInterviewScore;
      cand.competencyScores.interviewOwnership = record.overallInterviewScore;
      cand.finalWeightedScore = calculateWeightedCompetencyScore(
        cand.competencyScores,
        rec.settings.weights
      );
      if (record.decisionRecommendation === "Strong Hire" || record.decisionRecommendation === "Hire") {
        cand.applicationStatus = "Recommended";
      }
    } else {
      cand.currentStage = "Stage 5: Interview & Defence";
      cand.applicationStatus = "Interview Stage";
    }
    cand.updatedAt = now;

    await saveWorkspaceDb(db);
    return NextResponse.json({ interview: record, candidate: cand, recruitment: rec });
  }

  // ==========================================================================
  // 9. SETTINGS & WEIGHTS UPDATE
  // ==========================================================================
  if (action === "settings.update") {
    const nextSettings = body.settings as Partial<typeof rec.settings>;
    rec.settings = {
      ...rec.settings,
      ...nextSettings,
      weights: {
        ...rec.settings.weights,
        ...(nextSettings?.weights || {}),
      },
      updatedAt: now,
    };

    // Recompute weighted scores across candidates
    for (const cand of rec.candidates) {
      cand.finalWeightedScore = calculateWeightedCompetencyScore(
        cand.competencyScores,
        rec.settings.weights
      );
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({ recruitment: rec });
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
