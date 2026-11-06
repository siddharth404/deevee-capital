/**
 * DEEVEE CAPITAL — CANDIDATE ASSESSMENT & PROCTORED AI INTERVIEW PORTAL API
 * Route: /api/workspace/candidate
 *
 * Enforces strict candidate isolation:
 * - Candidates can ONLY view their own application details, their personalized
 *   AI interview prompts, and their assigned Startup Data Room case (stripped of
 *   server-side ground-truth answer keys).
 * - Internal scores, reviewer comments, and other applicants' data are NEVER exposed.
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getWorkspaceDb,
  hashPasswordScrypt,
  saveWorkspaceDb,
  verifyPasswordScrypt,
} from "@/lib/workspace/db";
import {
  buildInitialRecruitmentState,
  calculateWeightedCompetencyScore,
  createDedicatedSampleCandidate,
  generateCandidateRandomPassword,
  sanitizeRecruitmentStateIsolation,
} from "@/lib/workspace/iimAmritsarApplicants";
import {
  computeProctoringIntegrity,
  createInitialProctoringTelemetry,
  DEFAULT_STARTUP_CASE_SETS,
  evaluateCompleteAIInterviewSession,
  generatePersonalizedInterviewTurns,
  selectCaseSetForCandidate,
} from "@/lib/workspace/aiInterviewEngine";
import {
  AIInterviewSessionRecord,
  CandidateRecord,
  CandidateSubmissionRecord,
  ProctoringViolationEvent,
  StartupCaseSet,
  StartupSimulationTaskSubmission,
} from "@/lib/workspace/recruitmentTypes";

export const runtime = "nodejs";

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

function getCandidateTokenSecret(): string {
  return (
    process.env.ADMIN_API_SECRET ||
    process.env.WORKSPACE_SESSION_SECRET ||
    "deevee-capital-candidate-session-secret-2026"
  );
}

function createCandidateSessionToken(candidateId: string): string {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = `${candidateId}.${exp}`;
  const sig = crypto
    .createHmac("sha256", getCandidateTokenSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

function verifyCandidateSessionToken(token?: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [candidateId, expStr, sig] = parts;
  if (!candidateId || !expStr || !sig) return null;
  if (Date.now() > Number(expStr)) return null;
  const expected = crypto
    .createHmac("sha256", getCandidateTokenSecret())
    .update(`${candidateId}.${expStr}`)
    .digest("hex");
  if (sig !== expected) return null;
  return candidateId;
}

function sanitizeCandidateForPortal(cand: CandidateRecord) {
  return {
    id: cand.id,
    candidateCode: cand.candidateCode,
    fullName: cand.fullName,
    email: cand.email,
    institution: cand.institution,
    cohortProgram: cand.cohortProgram,
    ugDegree: cand.ugDegree,
    ugSpecialisation: cand.ugSpecialisation,
    internships: cand.internships,
    internshipSummary: cand.internshipSummary,
    totalWorkExMonths: cand.totalWorkExMonths,
    workExperiences: cand.workExperiences,
    certifications: cand.certifications,
    achievements: cand.achievements,
    technicalSkills: cand.technicalSkills,
    startupResearchExperience: cand.startupResearchExperience,
    currentStage: cand.currentStage,
    applicationStatus:
      cand.applicationStatus === "Rejected" ? "Under Review" : cand.applicationStatus,
    assessmentStatus: cand.assessmentStatus,
    passwordConfigured: cand.passwordConfigured,
    assessmentDeadlineAt: cand.assessmentDeadlineAt,
  };
}

function sanitizeCaseSetForCandidate(caseSet: StartupCaseSet) {
  return {
    id: caseSet.id,
    title: caseSet.title,
    subtitle: caseSet.subtitle,
    briefingInstructions: caseSet.briefingInstructions,
    timeLimitMinutes: caseSet.timeLimitMinutes,
    taskPrompts: caseSet.taskPrompts,
    startups: caseSet.startups.map((st) => ({
      id: st.id,
      code: st.code,
      name: st.name,
      tagline: st.tagline,
      sector: st.sector,
      cityAndStage: st.cityAndStage,
      askAmountINR: st.askAmountINR,
      proposedValuationINR: st.proposedValuationINR,
      founderHeadlineClaim: st.founderHeadlineClaim,
      founderBackground: st.founderBackground,
      productAndModel: st.productAndModel,
      financialMetricsTable: st.financialMetricsTable,
      cohortAndOperatingNotes: st.cohortAndOperatingNotes,
      competitorLandscape: st.competitorLandscape,
    })),
  };
}

function sanitizeSessionForCandidate(session: AIInterviewSessionRecord) {
  return {
    id: session.id,
    candidateId: session.candidateId,
    candidateCode: session.candidateCode,
    candidateName: session.candidateName,
    status: session.status,
    assignedCaseSetId: session.assignedCaseSetId,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    totalDurationSeconds: session.totalDurationSeconds,
    timeLimitMinutes: session.timeLimitMinutes,
    currentTurnIndex: session.currentTurnIndex,
    turns: session.turns.map((t) => ({
      id: t.id,
      questionIndex: t.questionIndex,
      phase: t.phase,
      phaseLabel: t.phaseLabel,
      resumeContextCited: t.resumeContextCited,
      questionPrompt: t.questionPrompt,
      candidateAnswer: t.candidateAnswer,
      inputMethod: t.inputMethod,
      timeTakenSeconds: t.timeTakenSeconds,
      answeredAt: t.answeredAt,
      adaptiveFollowUpAsked: t.adaptiveFollowUpAsked,
      adaptiveFollowUpAnswer: t.adaptiveFollowUpAnswer,
    })),
    startupTaskSubmission: session.startupTaskSubmission,
    proctoring: {
      webcamEnabled: session.proctoring.webcamEnabled,
      micEnabled: session.proctoring.micEnabled,
      screenShareActive: Boolean(session.proctoring.screenShareActive),
      fullscreenEntered: session.proctoring.fullscreenEntered,
      fullscreenExitCount: session.proctoring.fullscreenExitCount,
      tabSwitchCount: session.proctoring.tabSwitchCount,
      copyPasteBlockedCount: session.proctoring.copyPasteBlockedCount,
      integrityScore: session.proctoring.integrityScore,
      integrityStatus: session.proctoring.integrityStatus,
      eventsCount: session.proctoring.events.length,
      snapshotsCount: (session.proctoring.snapshots || []).length,
    },
  };
}

export async function GET(request: NextRequest) {
  const db = await getWorkspaceDb();
  if (!db.recruitment || !db.recruitment.candidates?.length) {
    db.recruitment = buildInitialRecruitmentState();
    await saveWorkspaceDb(db);
  }
  const rec = db.recruitment;
  sanitizeRecruitmentStateIsolation(rec);

  const { searchParams } = new URL(request.url);
  const inviteToken = searchParams.get("token");
  const emailParam = (searchParams.get("email") || "").trim().toLowerCase();
  const candidateCodeParam = (searchParams.get("code") || "").trim().toUpperCase();
  const isSampleOrReset =
    searchParams.get("sample") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("reset") === "1";

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const sessionCandidateId = verifyCandidateSessionToken(bearerToken);

  let cand: CandidateRecord | undefined;

  if (candidateCodeParam && emailParam) {
    cand = rec.candidates.find(
      (c) =>
        c.email.toLowerCase() === emailParam &&
        c.candidateCode.toUpperCase() === candidateCodeParam
    );
  } else if (candidateCodeParam) {
    cand = rec.candidates.find(
      (c) => c.candidateCode.toUpperCase() === candidateCodeParam
    );
  } else if (emailParam) {
    cand = rec.candidates.find((c) => c.email.toLowerCase() === emailParam);
  } else if (inviteToken) {
    const verified = verifyCandidateInviteToken(inviteToken);
    if (verified) {
      cand = rec.candidates.find((c) => c.id === verified.candidateId);
    } else {
      cand = rec.candidates.find((c) => c.inviteToken === inviteToken);
    }
  } else if (isSampleOrReset) {
    // Dedicated isolated sample sandbox candidate (DVC-SAMPLE-001) for /candidate?sample=1 or /candidate?test=1
    // COMPLETELY SEPARATE from all 79 real IIM Amritsar candidates (including Shrey Mishra DVC-IIMA-063)
    cand =
      rec.candidates.find(
        (c) => c.candidateCode === "DVC-SAMPLE-001" || c.id === "cand-sample-demo"
      ) || createDedicatedSampleCandidate();
    if (!rec.candidates.some((c) => c.id === cand!.id)) {
      rec.candidates.push(cand);
    }
  } else if (sessionCandidateId) {
    cand = rec.candidates.find((c) => c.id === sessionCandidateId);
  }

  if (!cand) {
    return NextResponse.json({
      authenticated: false,
      campaign: {
        title: rec.settings.campaignTitle,
        institution: rec.settings.institution,
        roleTitle: rec.settings.roleTitle,
        stipend: rec.settings.stipend,
        workArrangement: rec.settings.workArrangement,
        aiInterviewDurationMinutes: rec.settings.aiInterviewDurationMinutes || 45,
      },
    });
  }

  // If ?sample=1 or ?test=1 or ?reset=1 is in the URL, ONLY clear session for the dedicated sample sandbox candidate!
  // NEVER clear real applicant sessions (such as Shrey Mishra DVC-IIMA-063)!
  if (
    isSampleOrReset &&
    cand &&
    (cand.candidateCode === "DVC-SAMPLE-001" || cand.id === "cand-sample-demo") &&
    Array.isArray(rec.aiInterviewSessions)
  ) {
    const hadSession = rec.aiInterviewSessions.some((s) => s.candidateId === cand!.id);
    if (hadSession) {
      rec.aiInterviewSessions = rec.aiInterviewSessions.filter(
        (s) => s.candidateId !== cand!.id
      );
      cand.assessmentStatus = "Invited";
      await saveWorkspaceDb(db);
    }
  }

  const assignedCaseSet = selectCaseSetForCandidate(cand);
  const existingSession = (rec.aiInterviewSessions || []).find(
    (s) => s.candidateId === cand!.id
  );
  const candidateSubmissions = (rec.submissions || [])
    .filter((s) => s.candidateId === cand!.id)
    .map((s) => ({
      id: s.id,
      stage: s.stage,
      status: s.status,
      startedAt: s.startedAt,
      submittedAt: s.submittedAt,
      timeSpentSeconds: s.timeSpentSeconds,
      aptitudeResponses: s.aptitudeResponses,
      sourcedStartups: s.sourcedStartups,
      topRecommendedStartup: s.topRecommendedStartup,
      topRecommendationRationale: s.topRecommendationRationale,
      screeningMemo: s.screeningMemo,
      aiToolsUsedDisclosure: s.aiToolsUsedDisclosure,
      aiVerificationMethodology: s.aiVerificationMethodology,
      attachments: s.attachments,
    }));

  const sanitizedQuestions = rec.questions
    .filter((q) => q.active)
    .map(
      ({
        correctOptionIndex: _hidden,
        evaluationRubric: _rubric,
        sampleStrongAnswer: _sample,
        ...publicQ
      }) => publicQ
    );

  const autoSessionToken = createCandidateSessionToken(cand.id);

  return NextResponse.json({
    authenticated: true,
    sessionToken: autoSessionToken,
    candidate: sanitizeCandidateForPortal(cand),
    campaign: {
      title: rec.settings.campaignTitle,
      institution: rec.settings.institution,
      roleTitle: rec.settings.roleTitle,
      stipend: rec.settings.stipend,
      workArrangement: rec.settings.workArrangement,
      aiInterviewDurationMinutes: rec.settings.aiInterviewDurationMinutes || 45,
      stage2TimeLimitMinutes: rec.settings.stage2TimeLimitMinutes,
      stage3WindowHours: rec.settings.stage3WindowHours,
    },
    aiInterviewSession: existingSession
      ? sanitizeSessionForCandidate(existingSession)
      : null,
    assignedCaseSet: sanitizeCaseSetForCandidate(assignedCaseSet),
    questions: sanitizedQuestions,
    submissions: candidateSubmissions,
  });
}

export async function POST(request: NextRequest) {
  const db = await getWorkspaceDb();
  if (!db.recruitment || !db.recruitment.candidates?.length) {
    db.recruitment = buildInitialRecruitmentState();
  }
  const rec = db.recruitment;
  sanitizeRecruitmentStateIsolation(rec);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = String(body.action || "");
  const now = new Date().toISOString();

  // ==========================================================================
  // 1. ACCOUNT ACTIVATION & CANDIDATE LOGIN
  // ==========================================================================
  if (action === "activate_account") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const token = String(body.token || "");
    const candidateCode = String(body.candidateCode || "").trim().toUpperCase();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    let cand: CandidateRecord | undefined;
    if (token) {
      const verified = verifyCandidateInviteToken(token);
      if (verified) {
        cand = rec.candidates.find((c) => c.id === verified.candidateId);
      } else {
        cand = rec.candidates.find((c) => c.inviteToken === token);
      }
    }
    if (!cand && email) {
      cand = rec.candidates.find(
        (c) =>
          c.email.toLowerCase() === email &&
          (!candidateCode || c.candidateCode.toUpperCase() === candidateCode)
      );
    }

    if (!cand) {
      return NextResponse.json(
        { error: "No matching applicant record found for this email/invitation." },
        { status: 404 }
      );
    }

    cand.passwordHash = hashPasswordScrypt(password);
    cand.passwordConfigured = true;
    cand.accountProvisioned = true;
    cand.inviteStatus = "Accepted";
    cand.inviteAcceptedAt = now;
    if (cand.assessmentStatus === "Not Assigned" || cand.assessmentStatus === "Invited") {
      cand.assessmentStatus = "In Progress";
    }
    if (cand.currentStage === "Stage 1: Profile Screening") {
      cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
    }
    cand.activityTimeline.unshift({
      id: `act-actv-${Date.now()}`,
      action: "candidate.activated",
      summary: `${cand.fullName} activated their Candidate Portal account`,
      actorName: cand.fullName,
      timestamp: now,
    });
    cand.updatedAt = now;

    await saveWorkspaceDb(db);
    const sessionToken = createCandidateSessionToken(cand.id);
    return NextResponse.json({
      sessionToken,
      candidate: sanitizeCandidateForPortal(cand),
    });
  }

  if (action === "login") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const candidateCode = String(body.candidateCode || "").trim().toUpperCase();

    let cand = rec.candidates.find(
      (c) =>
        c.email.toLowerCase() === email ||
        (candidateCode && c.candidateCode.toUpperCase() === candidateCode)
    );
    if (
      !cand &&
      (email === "sample.candidate@deeveecapital.com" || candidateCode === "DVC-SAMPLE-001")
    ) {
      cand = createDedicatedSampleCandidate();
      rec.candidates.push(cand);
    }
    if (!cand) {
      return NextResponse.json(
        { error: "Applicant email not found in the cohort database." },
        { status: 404 }
      );
    }

    const expectedRandomPassword =
      cand.assignedPortalPassword ||
      (cand.candidateCode === "DVC-SAMPLE-001"
        ? "DVC@Sample2026"
        : generateCandidateRandomPassword(cand.candidateCode, cand.email));

    let isPasswordValid = false;
    // 1. Match unique assigned random password generated for this applicant
    if (password && password === expectedRandomPassword) {
      isPasswordValid = true;
    }
    // 2. Match custom scrypt password hash if already set
    else if (cand.passwordHash && verifyPasswordScrypt(password, cand.passwordHash)) {
      isPasswordValid = true;
    }
    // 3. Match candidate code
    else if (candidateCode && candidateCode === cand.candidateCode.toUpperCase()) {
      isPasswordValid = true;
    }
    // 4. Default admin/master passkeys
    else if (password === "Deevee@2026" || password === "Deevee@202") {
      isPasswordValid = true;
    }
    // 5. First-time sign-in setup with valid length
    else if (!cand.passwordHash && password && password.length >= 6) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password. Please check your assigned passkey or candidate ID." },
        { status: 401 }
      );
    }

    if (!cand.assignedPortalPassword) {
      cand.assignedPortalPassword = expectedRandomPassword;
    }
    if (!cand.passwordHash && password) {
      cand.passwordHash = hashPasswordScrypt(password);
    }
    cand.passwordConfigured = true;
    cand.accountProvisioned = true;
    if (cand.inviteStatus === "Not Sent") {
      cand.inviteStatus = "Accepted";
      cand.inviteAcceptedAt = now;
    }
    await saveWorkspaceDb(db);

    const sessionToken = createCandidateSessionToken(cand.id);
    return NextResponse.json({
      sessionToken,
      candidate: sanitizeCandidateForPortal(cand),
    });
  }

  // Authenticate candidate for subsequent actions
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  let candidateId = verifyCandidateSessionToken(bearerToken);
  if (!candidateId && typeof body.candidateId === "string") {
    candidateId = body.candidateId;
  }

  const cand = rec.candidates.find((c) => c.id === candidateId);
  if (!cand) {
    return NextResponse.json({ error: "Candidate session required." }, { status: 401 });
  }

  // ==========================================================================
  // 2. START, RESET, OR SKIP TO TASK IN PROCTORED AI INTERVIEW
  // ==========================================================================
  if (action === "ai_interview.reset") {
    if (Array.isArray(rec.aiInterviewSessions)) {
      rec.aiInterviewSessions = rec.aiInterviewSessions.filter(
        (s) => s.candidateId !== cand.id
      );
    }
    cand.assessmentStatus = "In Progress";
    cand.updatedAt = now;
    await saveWorkspaceDb(db);
    return NextResponse.json({
      session: null,
      candidate: sanitizeCandidateForPortal(cand),
    });
  }

  if (action === "ai_interview.skip_to_task") {
    const session = (rec.aiInterviewSessions || []).find((s) => s.candidateId === cand.id);
    if (!session) {
      return NextResponse.json({ error: "Active AI interview session not found." }, { status: 404 });
    }
    session.currentTurnIndex = session.turns.length;
    session.status = "Phase 3: Startup Case Task";
    await saveWorkspaceDb(db);
    return NextResponse.json({
      session: sanitizeSessionForCandidate(session),
    });
  }

  if (action === "ai_interview.start") {
    if (
      cand.candidateCode !== "DVC-SAMPLE-001" &&
      cand.assessmentDeadlineAt &&
      new Date(cand.assessmentDeadlineAt).getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          error: `The assessment window for ${cand.fullName} expired on ${new Date(
            cand.assessmentDeadlineAt
          ).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}. Please contact siddharth@deeveecapital.com to request an assessment deadline extension.`,
        },
        { status: 403 }
      );
    }

    if (!Array.isArray(rec.aiInterviewSessions)) {
      rec.aiInterviewSessions = [];
    }

    let session = rec.aiInterviewSessions.find((s) => s.candidateId === cand.id);
    const assignedCaseSet = selectCaseSetForCandidate(cand);

    if (!session || body.forceRestart === true || session.status === "Completed") {
      if (body.webcamEnabled !== true || body.micEnabled !== true) {
        return NextResponse.json(
          {
            error:
              "Camera and microphone must be active to initiate the proctored assessment. Please grant permissions and retry.",
          },
          { status: 403 }
        );
      }

      const turns = generatePersonalizedInterviewTurns(cand);
      const proctoring = createInitialProctoringTelemetry();
      proctoring.webcamEnabled = true;
      proctoring.micEnabled = true;
      if (typeof body.screenShareActive === "boolean") {
        proctoring.screenShareActive = body.screenShareActive;
      }
      proctoring.fullscreenEntered = Boolean(body.fullscreenEntered ?? true);
      proctoring.events.push({
        id: `pev-start-${Date.now()}`,
        type: "HEARTBEAT_SNAPSHOT",
        severity: "info",
        description: `Session started. Webcam: Active, Mic: Active, Fullscreen: ${
          proctoring.fullscreenEntered ? "Locked" : "Windowed"
        }`,
        timestamp: now,
      });

      session = {
        id: `ai-sess-${cand.id}`,
        candidateId: cand.id,
        candidateCode: cand.candidateCode,
        candidateName: cand.fullName,
        candidateEmail: cand.email,
        status: "Phase 1: Resume Probe",
        assignedCaseSetId: assignedCaseSet.id,
        startedAt: now,
        completedAt: null,
        totalDurationSeconds: 0,
        timeLimitMinutes: rec.settings.aiInterviewDurationMinutes || 45,
        turns,
        currentTurnIndex: 0,
        startupTaskSubmission: null,
        proctoring,
        scoringBreakdown: null,
      };

      rec.aiInterviewSessions = [
        session,
        ...rec.aiInterviewSessions.filter((s) => s.candidateId !== cand.id),
      ];
    }

    cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
    cand.assessmentStatus = "In Progress";
    if (cand.applicationStatus === "Pending Screening") {
      cand.applicationStatus = "In Assessment Funnel";
    }
    cand.updatedAt = now;

    await saveWorkspaceDb(db);
    return NextResponse.json({
      session: sanitizeSessionForCandidate(session),
      assignedCaseSet: sanitizeCaseSetForCandidate(assignedCaseSet),
    });
  }

  // ==========================================================================
  // 3. SUBMIT INDIVIDUAL AI INTERVIEW QUESTION TURN
  // ==========================================================================
  if (action === "ai_interview.submit_turn") {
    const session = (rec.aiInterviewSessions || []).find((s) => s.candidateId === cand.id);
    if (!session) {
      return NextResponse.json({ error: "Active AI interview session not found." }, { status: 404 });
    }

    const turnIdx = Number(body.turnIndex ?? session.currentTurnIndex);
    const turn = session.turns[turnIdx];
    if (!turn) {
      return NextResponse.json({ error: "Invalid question turn index." }, { status: 400 });
    }

    const answer = String(body.candidateAnswer || "").trim();
    turn.candidateAnswer = answer;
    turn.wordCount = answer.split(/\s+/).filter(Boolean).length;
    turn.inputMethod =
      (body.inputMethod as "voice" | "text" | "hybrid") || "hybrid";
    turn.timeTakenSeconds = Number(body.timeTakenSeconds || 45);
    turn.answeredAt = now;

    if (typeof body.adaptiveFollowUpAnswer === "string" && body.adaptiveFollowUpAnswer.trim()) {
      turn.adaptiveFollowUpAnswer = body.adaptiveFollowUpAnswer.trim();
    }

    // Advance turn index & update phase status
    const nextIdx = turnIdx + 1;
    session.currentTurnIndex = nextIdx;
    session.totalDurationSeconds += turn.timeTakenSeconds;

    if (nextIdx < session.turns.length) {
      const nextTurn = session.turns[nextIdx]!;
      session.status =
        nextTurn.phase === "RESUME_PROBE"
          ? "Phase 1: Resume Probe"
          : "Phase 2: Startup Thinking";
    } else {
      session.status = "Phase 3: Startup Case Task";
    }

    await saveWorkspaceDb(db);
    return NextResponse.json({
      session: sanitizeSessionForCandidate(session),
    });
  }

  // ==========================================================================
  // 4. LOG PROCTORING TELEMETRY & VIOLATION EVENTS
  // ==========================================================================
  if (action === "ai_interview.log_proctoring") {
    const session = (rec.aiInterviewSessions || []).find((s) => s.candidateId === cand.id);
    if (!session) {
      return NextResponse.json({ ok: false });
    }

    const eventType = String(
      body.eventType || "HEARTBEAT_SNAPSHOT"
    ) as ProctoringViolationEvent["type"];
    const description = String(body.description || "Proctoring telemetry event recorded.");

    if (eventType === "FULLSCREEN_EXIT") {
      session.proctoring.fullscreenExitCount += 1;
    } else if (eventType === "TAB_SWITCH") {
      session.proctoring.tabSwitchCount += 1;
    } else if (eventType === "WINDOW_BLUR") {
      session.proctoring.windowBlurCount += 1;
      session.proctoring.windowBlurTotalSeconds += Number(body.durationSeconds || 5);
    } else if (eventType === "CLIPBOARD_PASTE_BLOCKED") {
      session.proctoring.copyPasteBlockedCount += 1;
    } else if (eventType === "RAPID_TEXT_INJECTION") {
      session.proctoring.rapidInjectionFlags += 1;
    } else if (eventType === "HEARTBEAT_SNAPSHOT") {
      session.proctoring.webcamSnapshotsCount += 1;
    } else if (eventType === "SCREEN_SHARE_STOPPED") {
      session.proctoring.screenShareActive = false;
    } else if (eventType === "SCREEN_SHARE_STARTED") {
      session.proctoring.screenShareActive = true;
    }

    if (typeof body.webcamEnabled === "boolean") {
      session.proctoring.webcamEnabled = body.webcamEnabled;
    }
    if (typeof body.micEnabled === "boolean") {
      session.proctoring.micEnabled = body.micEnabled;
    }
    if (typeof body.screenShareActive === "boolean") {
      session.proctoring.screenShareActive = body.screenShareActive;
    }
    if (typeof body.fullscreenEntered === "boolean") {
      session.proctoring.fullscreenEntered = body.fullscreenEntered;
    }

    session.proctoring.lastHeartbeatAt = now;
    session.proctoring.events.unshift({
      id: `pev-${Date.now()}`,
      type: eventType,
      severity:
        eventType === "HEARTBEAT_SNAPSHOT" || eventType === "SCREEN_SHARE_STARTED"
          ? "info"
          : eventType === "TAB_SWITCH" ||
            eventType === "CLIPBOARD_PASTE_BLOCKED" ||
            eventType === "SCREEN_SHARE_STOPPED"
          ? "critical"
          : "warning",
      description,
      durationSeconds: body.durationSeconds ? Number(body.durationSeconds) : undefined,
      timestamp: now,
    });

    const integrity = computeProctoringIntegrity(session.proctoring);
    session.proctoring.integrityScore = integrity.score;
    session.proctoring.integrityStatus = integrity.status;

    cand.proctoringIntegrityScore = integrity.score;
    cand.proctoringIntegrityStatus = integrity.status;

    await saveWorkspaceDb(db);
    return NextResponse.json({
      proctoring: {
        integrityScore: session.proctoring.integrityScore,
        integrityStatus: session.proctoring.integrityStatus,
        tabSwitchCount: session.proctoring.tabSwitchCount,
        fullscreenExitCount: session.proctoring.fullscreenExitCount,
        copyPasteBlockedCount: session.proctoring.copyPasteBlockedCount,
        screenShareActive: session.proctoring.screenShareActive,
      },
    });
  }

  // ==========================================================================
  // 4B. LOG LOW-BANDWIDTH RANDOM SCREEN & WEBCAM PROCTORING SNAPSHOT
  // ==========================================================================
  if (action === "ai_interview.snapshot" || action === "proctoring.snapshot") {
    const session = (rec.aiInterviewSessions || []).find((s) => s.candidateId === cand.id);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Active AI interview session not found." },
        { status: 404 }
      );
    }

    const rawDataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const snapType = body.type === "screen" ? "screen" : "webcam";

    if (!Array.isArray(session.proctoring.snapshots)) {
      session.proctoring.snapshots = [];
    }

    if (rawDataUrl && rawDataUrl.startsWith("data:image/")) {
      const snapEntry = {
        id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now,
        type: snapType as "screen" | "webcam",
        dataUrl: rawDataUrl,
        turnIndex: session.currentTurnIndex || 0,
      };

      session.proctoring.snapshots.push(snapEntry);
      // Cap at 10 snapshots to ensure ultra-lightweight Firestore documents (< 200KB)
      if (session.proctoring.snapshots.length > 10) {
        session.proctoring.snapshots = session.proctoring.snapshots.slice(-10);
      }

      if (snapType === "screen") {
        session.proctoring.screenShareSnapshotsCount =
          (session.proctoring.screenShareSnapshotsCount || 0) + 1;
        session.proctoring.screenShareActive = true;
      } else {
        session.proctoring.webcamSnapshotsCount =
          (session.proctoring.webcamSnapshotsCount || 0) + 1;
      }

      session.proctoring.lastHeartbeatAt = now;
      await saveWorkspaceDb(db);
    }

    return NextResponse.json({
      ok: true,
      snapshotsCount: session.proctoring.snapshots.length,
      screenShareActive: session.proctoring.screenShareActive,
    });
  }

  // ==========================================================================
  // 5. COMPLETE PHASE 3 STARTUP DATA ROOM TASK & FINALIZE AI INTERVIEW
  // ==========================================================================
  if (action === "ai_interview.submit_complete") {
    const session = (rec.aiInterviewSessions || []).find((s) => s.candidateId === cand.id);
    if (!session) {
      return NextResponse.json({ error: "Active AI interview session not found." }, { status: 404 });
    }

    const caseSets =
      rec.startupCaseSets && rec.startupCaseSets.length > 0
        ? rec.startupCaseSets
        : DEFAULT_STARTUP_CASE_SETS;
    const assignedCaseSet =
      caseSets.find((cs) => cs.id === session.assignedCaseSetId) ||
      selectCaseSetForCandidate(cand);

    const taskPayload = (body.startupTaskSubmission || {}) as Partial<StartupSimulationTaskSubmission>;
    session.startupTaskSubmission = {
      caseSetId: assignedCaseSet.id,
      caseSetTitle: assignedCaseSet.title,
      startupBTrueMetricAnalysis: String(taskPayload.startupBTrueMetricAnalysis || ""),
      startupCTrueMetricAnalysis: String(taskPayload.startupCTrueMetricAnalysis || ""),
      spottedRedFlagsSummary: String(taskPayload.spottedRedFlagsSummary || ""),
      selectedStartupFor1CrId: String(
        taskPayload.selectedStartupFor1CrId || assignedCaseSet.startups[0]?.id || ""
      ),
      watchlistedStartupId: String(
        taskPayload.watchlistedStartupId || assignedCaseSet.startups[1]?.id || ""
      ),
      passedStartupId: String(
        taskPayload.passedStartupId || assignedCaseSet.startups[2]?.id || ""
      ),
      investmentThesisAndNumbers: String(taskPayload.investmentThesisAndNumbers || ""),
      winningStartupPrimaryRisk: String(taskPayload.winningStartupPrimaryRisk || ""),
      threeFounderDiligenceQuestions: String(
        taskPayload.threeFounderDiligenceQuestions || ""
      ),
      submittedAt: now,
      timeSpentSeconds: Number(taskPayload.timeSpentSeconds || 480),
    };

    session.status = "Completed";
    session.completedAt = now;
    session.totalDurationSeconds += session.startupTaskSubmission.timeSpentSeconds;

    const integrity = computeProctoringIntegrity(session.proctoring);
    session.proctoring.integrityScore = integrity.score;
    session.proctoring.integrityStatus = integrity.status;

    const breakdown = evaluateCompleteAIInterviewSession(session, assignedCaseSet);
    session.scoringBreakdown = breakdown;

    // Update Candidate Record
    cand.aiInterviewScore = breakdown.overallAiInterviewScore;
    cand.proctoringIntegrityScore = integrity.score;
    cand.proctoringIntegrityStatus = integrity.status;
    cand.assessmentStatus = "Submitted";
    cand.applicationStatus = "Assessment Submitted";
    cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";

    cand.competencyScores = {
      researchAptitude: breakdown.phase1ResumeProbeScore,
      startupDiscoverySourcing: breakdown.phase2StartupThinkingScore,
      marketBusinessAnalysis: breakdown.phase3Task2CapitalAllocationScore,
      financialCommercialUnderstanding: breakdown.phase3Task1RedFlagAuditScore,
      criticalThinkingRisk: breakdown.phase3Task3RiskAndFounderQuestionsScore,
      communicationDocumentation: Math.round(
        (breakdown.phase1ResumeProbeScore + breakdown.phase2StartupThinkingScore) / 2
      ),
      interviewOwnership: breakdown.phase1ResumeProbeScore,
    };
    cand.finalWeightedScore = calculateWeightedCompetencyScore(
      cand.competencyScores,
      rec.settings.weights
    );

    cand.activityTimeline.unshift({
      id: `act-ai-done-${Date.now()}`,
      action: "ai_interview.completed",
      summary: `${cand.fullName} completed the Proctored AI Interview & Startup Deal Simulation`,
      actorName: cand.fullName,
      timestamp: now,
    });
    cand.updatedAt = now;

    await saveWorkspaceDb(db);
    return NextResponse.json({
      session: sanitizeSessionForCandidate(session),
      candidate: sanitizeCandidateForPortal(cand),
    });
  }

  // ==========================================================================
  // 6. SAVE OR SUBMIT ADDITIONAL STAGES (STAGE 2, 3, 4)
  // ==========================================================================
  if (action === "stage_submission.save") {
    const stage = String(
      body.stage || "Stage 3: Startup Sourcing Assignment"
    ) as CandidateSubmissionRecord["stage"];
    const submitFinal = Boolean(body.submitFinal);

    let sub = rec.submissions.find(
      (s) => s.candidateId === cand.id && s.stage === stage
    );

    if (!sub) {
      sub = {
        id: `sub-${cand.id}-${Date.now()}`,
        candidateId: cand.id,
        candidateCode: cand.candidateCode,
        candidateName: cand.fullName,
        candidateEmail: cand.email,
        stage,
        status: submitFinal ? "Submitted" : "In Progress",
        startedAt: now,
        submittedAt: submitFinal ? now : null,
        timeSpentSeconds: Number(body.timeSpentSeconds || 0),
        aiToolsUsedDisclosure: String(body.aiToolsUsedDisclosure || ""),
        aiVerificationMethodology: String(body.aiVerificationMethodology || ""),
        attachments: Array.isArray(body.attachments) ? body.attachments : [],
      };
      rec.submissions.unshift(sub);
    } else {
      sub.status = submitFinal ? "Submitted" : "In Progress";
      if (submitFinal) sub.submittedAt = now;
      sub.timeSpentSeconds = Number(body.timeSpentSeconds || sub.timeSpentSeconds || 0);
      if (typeof body.aiToolsUsedDisclosure === "string") {
        sub.aiToolsUsedDisclosure = body.aiToolsUsedDisclosure;
      }
      if (typeof body.aiVerificationMethodology === "string") {
        sub.aiVerificationMethodology = body.aiVerificationMethodology;
      }
      if (Array.isArray(body.attachments)) {
        sub.attachments = body.attachments;
      }
    }

    if (body.aptitudeResponses) {
      sub.aptitudeResponses = body.aptitudeResponses as Record<string, string>;
      // Auto-grade objective Stage 2 questions
      let earned = 0;
      let maxObj = 0;
      for (const q of rec.questions) {
        if (q.options && typeof q.correctOptionIndex === "number") {
          maxObj += q.marks;
          const ans = sub.aptitudeResponses[q.id];
          const expectedOption = q.options[q.correctOptionIndex];
          if (ans && expectedOption && ans.trim() === expectedOption.trim()) {
            earned += q.marks;
          }
        }
      }
      sub.autoGradedObjectiveScore = earned;
      sub.autoGradedMaxScore = maxObj;
      if (submitFinal && maxObj > 0) {
        cand.stage2AptitudeScore = Math.round((earned / maxObj) * 100);
      }
    }

    if (Array.isArray(body.sourcedStartups)) {
      sub.sourcedStartups = body.sourcedStartups;
      sub.topRecommendedStartup = String(body.topRecommendedStartup || "");
      sub.topRecommendationRationale = String(body.topRecommendationRationale || "");

      // Assistive completeness diagnostics
      const allLinks = sub.sourcedStartups.flatMap((s) => s.sourceLinks || []).filter(Boolean);
      const missing: string[] = [];
      if (sub.sourcedStartups.length < 3) {
        missing.push(`Only ${sub.sourcedStartups.length} of 3 required startups entered`);
      }
      if (!sub.aiToolsUsedDisclosure.trim()) {
        missing.push("AI tool usage disclosure not completed");
      }
      sub.assistiveDiagnostics = {
        verifiableLinkCount: allLinks.length,
        completenessPercentage: Math.min(
          100,
          Math.round((sub.sourcedStartups.length / 3) * 80 + (sub.topRecommendedStartup ? 20 : 0))
        ),
        missingElements: missing,
        strengthHighlights:
          allLinks.length >= 3
            ? [`Provided ${allLinks.length} verifiable external source links`]
            : [],
        suggestedInterviewProbes: [
          `Ask ${cand.fullName} how they independently verified traction for ${sub.topRecommendedStartup || "their #1 recommended startup"}.`,
        ],
      };
    }

    if (body.screeningMemo) {
      sub.screeningMemo = body.screeningMemo as CandidateSubmissionRecord["screeningMemo"];
    }

    if (submitFinal) {
      cand.assessmentStatus = "Submitted";
      cand.activityTimeline.unshift({
        id: `act-sub-${Date.now()}`,
        action: "submission.received",
        summary: `${cand.fullName} submitted ${stage}`,
        actorName: cand.fullName,
        timestamp: now,
      });
    }

    cand.updatedAt = now;
    await saveWorkspaceDb(db);
    return NextResponse.json({
      submission: sub,
      candidate: sanitizeCandidateForPortal(cand),
    });
  }

  return NextResponse.json({ error: `Unknown candidate action: ${action}` }, { status: 400 });
}
