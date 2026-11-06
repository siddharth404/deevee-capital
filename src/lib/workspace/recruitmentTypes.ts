/**
 * DEEVEE CAPITAL — RECRUITMENT, TALENT ASSESSMENT & CANDIDATE MANAGEMENT TYPES
 * Complete domain and Firestore schema definitions for the IIM Amritsar MBA
 * Investment Research & Startup Sourcing Intern recruitment system, including
 * the Proctored AI Interview (Resume Probe + Startup Thinking) and Interactive
 * Startup Virtual Data Room Simulation Task.
 */

export type RecruitmentRole =
  | "SUPER_ADMIN"
  | "RECRUITMENT_MANAGER"
  | "RESEARCH_REVIEWER"
  | "INTERVIEWER"
  | "CANDIDATE";

export type CandidateApplicationStage =
  | "Stage 1: Profile Screening"
  | "Stage 1B: AI Interview & Startup Simulation"
  | "Stage 2: Research Aptitude Test"
  | "Stage 3: Startup Sourcing Assignment"
  | "Stage 4: Investment Screening Case"
  | "Stage 5: Interview & Defence"
  | "Shortlisted"
  | "Selected"
  | "Waitlisted"
  | "Rejected";

export type CandidateAssessmentStatus =
  | "Not Assigned"
  | "Invited"
  | "In Progress"
  | "Submitted"
  | "Under Review"
  | "Evaluated"
  | "Overdue";

export type CandidateSelectionStatus =
  | "Pending Screening"
  | "Shortlisted for Assessment"
  | "In Assessment Funnel"
  | "Interview Stage"
  | "Recommended"
  | "Selected"
  | "Waitlisted"
  | "Rejected";

export interface CandidateInternshipItem {
  designation: string;
  organization: string;
}

export interface CandidateWorkExItem {
  designation: string;
  organization: string;
  durationMonths: number;
}

export interface Stage1ProfileBreakdown {
  researchExperienceScore: number; // max 30
  startupCommercialExposureScore: number; // max 20
  analyticalTechnicalToolkitScore: number; // max 20
  ownershipInitiativeScore: number; // max 20
  communicationAcademicContextScore: number; // max 10 (academics capped at 5)
  totalScore: number; // max 100
  rationale: string[];
  hasSubstantiveResearch: boolean;
  hasStartupOrFounderExposure: boolean;
}

export interface CompetencyScores {
  researchAptitude: number; // 0-100 (default weight 15%)
  startupDiscoverySourcing: number; // 0-100 (default weight 20%)
  marketBusinessAnalysis: number; // 0-100 (default weight 20%)
  financialCommercialUnderstanding: number; // 0-100 (default weight 10%)
  criticalThinkingRisk: number; // 0-100 (default weight 15%)
  communicationDocumentation: number; // 0-100 (default weight 10%)
  interviewOwnership: number; // 0-100 (default weight 10%)
}

export interface ReviewerScoreRecord {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  stage: CandidateApplicationStage;
  competencies: CompetencyScores;
  weightedScore: number;
  strengths: string;
  concerns: string;
  recommendation: "Strong Proceed" | "Proceed" | "Hold / Borderline" | "Reject";
  submittedAt: string;
}

export interface ScoreAdjustmentAuditEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  actorId: string;
  actorName: string;
  previousScore: number;
  newScore: number;
  reason: string;
  timestamp: string;
}

export interface CandidateActivityEntry {
  id: string;
  action: string;
  summary: string;
  actorName: string;
  timestamp: string;
}

// ============================================================================
// PROCTORED ENVIRONMENT & ANTI-CHEAT TELEMETRY TYPES
// ============================================================================

export interface ProctoringSnapshotEntry {
  id: string;
  timestamp: string;
  type: "screen" | "webcam";
  dataUrl: string; // low-resolution 640x360 compressed JPEG data URI (~15-25KB)
  turnIndex: number;
}

export interface ProctoringViolationEvent {
  id: string;
  type:
    | "FULLSCREEN_EXIT"
    | "TAB_SWITCH"
    | "WINDOW_BLUR"
    | "CLIPBOARD_PASTE_BLOCKED"
    | "DEVTOOLS_ATTEMPT"
    | "WEBCAM_DISCONNECTED"
    | "SCREEN_SHARE_STOPPED"
    | "SCREEN_SHARE_STARTED"
    | "RAPID_TEXT_INJECTION"
    | "HEARTBEAT_SNAPSHOT";
  severity: "info" | "warning" | "critical";
  description: string;
  durationSeconds?: number;
  timestamp: string;
}

export interface ProctoringTelemetry {
  webcamEnabled: boolean;
  micEnabled: boolean;
  screenShareActive?: boolean;
  fullscreenEntered: boolean;
  fullscreenExitCount: number;
  tabSwitchCount: number;
  windowBlurCount: number;
  windowBlurTotalSeconds: number;
  copyPasteBlockedCount: number;
  rapidInjectionFlags: number;
  webcamSnapshotsCount: number;
  screenShareSnapshotsCount?: number;
  lastHeartbeatAt: string;
  integrityScore: number; // 0-100 (starts at 100, deducts on violations)
  integrityStatus: "High Integrity" | "Review Telemetry" | "Flagged";
  events: ProctoringViolationEvent[];
  snapshots?: ProctoringSnapshotEntry[];
}

// ============================================================================
// AI INTERVIEW (PHASE 1: RESUME PROBE + PHASE 2: STARTUP THINKING)
// ============================================================================

export interface AIInterviewQuestionTurn {
  id: string;
  questionIndex: number;
  phase: "RESUME_PROBE" | "STARTUP_THINKING";
  phaseLabel: string;
  resumeContextCited: string; // e.g. "Strategy Intern @ Litti King | EV & Fintech Research"
  questionPrompt: string;
  expectedSignals: string[];
  candidateAnswer: string;
  inputMethod: "voice" | "text" | "hybrid";
  timeTakenSeconds: number;
  wordCount: number;
  answeredAt: string | null;
  // Assistive AI & Rubric Scoring per turn (0-100)
  turnScore: number | null;
  turnStrengths: string[];
  turnConcerns: string[];
  adaptiveFollowUpAsked?: string;
  adaptiveFollowUpAnswer?: string;
}

// ============================================================================
// PHASE 3: INTERACTIVE DUMMY STARTUP VIRTUAL DATA ROOM & TASK SIMULATOR
// ============================================================================

export interface DummyStartupDossier {
  id: string;
  code: "STARTUP_A" | "STARTUP_B" | "STARTUP_C";
  name: string;
  tagline: string;
  sector: string;
  cityAndStage: string;
  askAmountINR: string; // e.g., "₹1.0 Crore"
  proposedValuationINR: string; // e.g., "₹12 Crore Post-Money"
  founderHeadlineClaim: string;
  founderBackground: string;
  productAndModel: string;
  financialMetricsTable: Array<{
    metric: string;
    founderDeckValue: string;
    dataRoomVerifiedValue: string;
    auditFootnote: string;
  }>;
  cohortAndOperatingNotes: string[];
  competitorLandscape: string;
  // Ground-truth evaluation keys (used server-side for assistive rubric grading)
  groundTruthClassification: "BEST_INVESTMENT_CANDIDATE" | "TRAP_INFLATED_ARR" | "TRAP_BROKEN_UNIT_ECONOMICS";
  hiddenRedFlags: string[];
  primaryDiligenceRisk: string;
}

export interface StartupCaseSet {
  id: string;
  title: string;
  subtitle: string;
  briefingInstructions: string;
  timeLimitMinutes: number;
  startups: DummyStartupDossier[];
  taskPrompts: {
    task1DiscrepancyAuditPrompt: string;
    task2AllocationDecisionPrompt: string;
    task3FounderDiligencePrompt: string;
  };
}

export interface StartupSimulationTaskSubmission {
  caseSetId: string;
  caseSetTitle: string;
  // Task 1: Discrepancy & Red Flag Audit (25 marks)
  startupBTrueMetricAnalysis: string;
  startupCTrueMetricAnalysis: string;
  spottedRedFlagsSummary: string;
  // Task 2: ₹1 Crore Capital Allocation & Ranking (40 marks)
  selectedStartupFor1CrId: string; // id of the startup chosen to advance to IC
  watchlistedStartupId: string;
  passedStartupId: string;
  investmentThesisAndNumbers: string; // Why the chosen startup wins (citing numbers)
  // Task 3: Critical Risk in Winning Startup & 3 Founder Questions (35 marks)
  winningStartupPrimaryRisk: string;
  threeFounderDiligenceQuestions: string;
  submittedAt: string;
  timeSpentSeconds: number;
}

export interface AIInterviewScoringBreakdown {
  phase1ResumeProbeScore: number; // 0-100 (Weight 20%)
  phase2StartupThinkingScore: number; // 0-100 (Weight 20%)
  phase3Task1RedFlagAuditScore: number; // 0-100 (Weight 25%)
  phase3Task2CapitalAllocationScore: number; // 0-100 (Weight 20%)
  phase3Task3RiskAndFounderQuestionsScore: number; // 0-100 (Weight 15%)
  overallAiInterviewScore: number; // Weighted 0-100
  pickedCorrectWinningStartup: boolean;
  caughtFreeTrialArrTrap: boolean;
  caughtUnitEconomicsRtoTrap: boolean;
  identifiedWorkingCapitalRisk: boolean;
  executiveSummary: string;
  keyStrengths: string[];
  keyRedFlags: string[];
  recommendedNextStep: "Fast-Track to Final Partner Call" | "Assign Deep-Dive Sourcing Task" | "Hold / Review" | "Pass";
}

export interface AIInterviewSessionRecord {
  id: string;
  candidateId: string;
  candidateCode: string;
  candidateName: string;
  candidateEmail: string;
  status: "Not Started" | "Phase 1: Resume Probe" | "Phase 2: Startup Thinking" | "Phase 3: Startup Case Task" | "Completed";
  assignedCaseSetId: string;
  startedAt: string;
  completedAt: string | null;
  totalDurationSeconds: number;
  timeLimitMinutes: number; // default 25 mins
  turns: AIInterviewQuestionTurn[];
  currentTurnIndex: number;
  startupTaskSubmission: StartupSimulationTaskSubmission | null;
  proctoring: ProctoringTelemetry;
  scoringBreakdown: AIInterviewScoringBreakdown | null;
  reviewerOverrideScore?: number | null;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CandidateRecord {
  id: string;
  candidateCode: string; // e.g., DVC-IIMA-001
  serialNo: number;
  fullName: string;
  email: string;
  institution: string; // "IIM Amritsar"
  cohortProgram: string; // e.g. "MBA (General)", "MBA-BA", "MBA-HR"
  gender: string; // Administrative reference ONLY — never used in scoring
  classXPercentage: number | null;
  classXIIPercentage: number | null;
  ugDegree: string;
  ugSpecialisation: string;
  ugPercentage: number | null;
  internships: CandidateInternshipItem[];
  internshipSummary: string;
  totalWorkExMonths: number;
  workExperiences: CandidateWorkExItem[];
  previousOrganisations: string[];
  certifications: string;
  achievements: string;
  otherQualifications: string;
  technicalSkills: string;
  startupResearchExperience: string;
  marketResearchExperience: string;
  hasSubstantiveResearchExperience: boolean;
  // Original verbatim values from Excel
  originalRowPayload: Record<string, string>;
  // Status & Pipeline
  currentStage: CandidateApplicationStage;
  applicationStatus: CandidateSelectionStatus;
  assessmentStatus: CandidateAssessmentStatus;
  assignedReviewerId: string;
  assignedReviewerName: string;
  assignedInterviewerId?: string;
  assignedInterviewerName?: string;
  // Scores
  stage1ProfileBreakdown: Stage1ProfileBreakdown;
  profileScore: number; // 0-100
  aiInterviewScore?: number | null; // 0-100 (from Proctored AI Interview + Startup Task)
  proctoringIntegrityScore?: number | null; // 0-100
  proctoringIntegrityStatus?: "High Integrity" | "Review Telemetry" | "Flagged";
  stage2AptitudeScore: number | null; // 0-100
  stage3SourcingScore: number | null; // 0-100
  stage4CaseMemoScore: number | null; // 0-100
  stage5InterviewScore: number | null; // 0-100
  competencyScores: CompetencyScores;
  finalWeightedScore: number; // 0-100
  manualScoreOverride: number | null;
  manualOverrideReason: string | null;
  reviewerDisagreementFlag: boolean;
  reviewerEvaluations: ReviewerScoreRecord[];
  reviewerComments: Array<{
    id: string;
    authorId: string;
    authorName: string;
    comment: string;
    stage: string;
    createdAt: string;
  }>;
  // Account & Portal Auth
  accountProvisioned: boolean;
  passwordConfigured: boolean;
  passwordHash?: string;
  inviteToken?: string;
  inviteStatus: "Not Sent" | "Previewed" | "Sent" | "Accepted" | "Failed";
  inviteSentAt: string | null;
  inviteAcceptedAt: string | null;
  lastCommunicationAt: string | null;
  assignedAssessmentIds: string[];
  assessmentDeadlineAt: string | null;
  activityTimeline: CandidateActivityEntry[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicantCandidateRecord = CandidateRecord;

export type QuestionFormat =
  | "mcq"
  | "data_interpretation"
  | "short_answer"
  | "case_based"
  | "research_verification";

export type QuestionCompetencyTag =
  | "Research Methodology"
  | "Information Verification"
  | "Financial Reasoning"
  | "Business Model Comprehension"
  | "Analytical Reasoning"
  | "Attention to Detail";

export interface AssessmentQuestion {
  id: string;
  code: string;
  stage: "Stage 2: Research Aptitude Test" | "Stage 3: Startup Sourcing Assignment" | "Stage 4: Investment Screening Case";
  format: QuestionFormat;
  competency: QuestionCompetencyTag;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  marks: number;
  prompt: string;
  contextData?: string; // Table/scenario context for data interpretation & case questions
  options?: string[]; // For MCQ / objective data interpretation
  correctOptionIndex?: number; // Server-side grading key (never sent to candidate portal)
  evaluationRubric: string;
  sampleStrongAnswer?: string;
  active: boolean;
}

export interface SourcedStartupEntry {
  startupName: string;
  websiteUrl: string;
  sector: string;
  stageAndCity: string;
  discoveryTrail: string; // Exact search method / database / incubator used
  sourceLinks: string[]; // Verifiable URLs
  foundersAndBackground: string;
  problemSolved: string;
  productAndBusinessModel: string;
  targetCustomersAndCompetitors: string;
  marketOpportunityEstimate: string;
  verifiedFacts: string;
  assumptionsAndUnverified: string;
  keyRisks: string;
}

export interface ScreeningCaseMemoSubmission {
  startupName: string;
  websiteUrl: string;
  companyOverview: string;
  founderBackground: string;
  problemAndSolution: string;
  marketOpportunityAndSizing: string;
  businessAndRevenueModel: string;
  competitorAnalysis: string;
  tractionAndEvidence: string;
  growthPotential: string;
  keyRisks: string;
  preliminaryInvestmentThesis: string;
  reasonsNotToInvest: string; // Mandatory critical thinking section
  recommendation: "Recommend Deep Diligence" | "Track / Hold" | "Pass / Reject";
  questionsForFounderCall: string;
}

export interface CandidateSubmissionAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface CandidateSubmissionRecord {
  id: string;
  candidateId: string;
  candidateCode: string;
  candidateName: string;
  candidateEmail: string;
  stage:
    | "Stage 1B: AI Interview & Startup Simulation"
    | "Stage 2: Research Aptitude Test"
    | "Stage 3: Startup Sourcing Assignment"
    | "Stage 4: Investment Screening Case";
  status: "In Progress" | "Submitted" | "Evaluated";
  startedAt: string;
  submittedAt: string | null;
  timeSpentSeconds: number;
  // Stage 2 answers: questionId -> selected option text or written response
  aptitudeResponses?: Record<string, string>;
  autoGradedObjectiveScore?: number;
  autoGradedMaxScore?: number;
  // Stage 3 answers: 3 discovered Indian startups + recommendation
  sourcedStartups?: SourcedStartupEntry[];
  topRecommendedStartup?: string;
  topRecommendationRationale?: string;
  // Stage 4 answers: screening memo
  screeningMemo?: ScreeningCaseMemoSubmission;
  // AI Tool Disclosure (Mandatory in Stage 3 & 4)
  aiToolsUsedDisclosure: string;
  aiVerificationMethodology: string;
  // Uploaded files (PDF, DOCX, PPTX, XLSX)
  attachments: CandidateSubmissionAttachment[];
  // Automated quality & completeness diagnostics (assistive only, non-autonomous)
  assistiveDiagnostics?: {
    verifiableLinkCount: number;
    completenessPercentage: number;
    missingElements: string[];
    strengthHighlights: string[];
    suggestedInterviewProbes: string[];
  };
  reviewerScore?: number | null;
  reviewerFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface InterviewEvaluationRecord {
  id: string;
  candidateId: string;
  candidateCode: string;
  candidateName: string;
  candidateEmail: string;
  interviewerId: string;
  interviewerName: string;
  scheduledAt: string;
  meetingLink: string;
  status: "Scheduled" | "Completed" | "No Show" | "Rescheduled";
  defenceQuestions: Array<{
    id: string;
    question: string;
    candidateResponseNotes: string;
    rating: number; // 1-5
  }>;
  aiToolDefenceAssessment: string;
  independentVerificationRating: number; // 1-5
  ownershipAndCuriosityRating: number; // 1-5
  overallInterviewScore: number; // 0-100
  overallNotes: string;
  decisionRecommendation: "Strong Hire" | "Hire" | "Waitlist" | "No Hire";
  completedAt: string | null;
}

export interface RecruitmentEmailTemplate {
  id: string;
  name: string;
  stageTrigger: string;
  subject: string;
  bodyText: string;
  updatedAt: string;
}

export interface RecruitmentEmailLog {
  id: string;
  candidateId: string;
  candidateName: string;
  recipientEmail: string;
  templateId: string;
  subject: string;
  status: "Previewed" | "Sent (SMTP)" | "Sent (Logged Sandbox)" | "Failed";
  isTestSend: boolean;
  sentBy: string;
  sentAt: string;
  error?: string;
}

export interface RecruitmentScoringWeights {
  researchAptitude: number; // default 15
  startupDiscoverySourcing: number; // default 20
  marketBusinessAnalysis: number; // default 20
  financialCommercialUnderstanding: number; // default 10
  criticalThinkingRisk: number; // default 15
  communicationDocumentation: number; // default 10
  interviewOwnership: number; // default 10
}

export interface RecruitmentSettings {
  id: string;
  campaignTitle: string;
  institution: string;
  roleTitle: string;
  eligibility: string;
  workArrangement: string;
  stipend: string;
  workingHours: string;
  reportingTo: string;
  aiInterviewDurationMinutes?: number; // default 25
  proctoringStrictMode?: boolean; // default true
  stage2TimeLimitMinutes: number; // default 35
  stage3WindowHours: number; // default 48
  stage1ShortlistThreshold: number; // default 48
  overallShortlistThreshold: number; // default 70
  weights: RecruitmentScoringWeights;
  workbookImported: boolean;
  workbookImportedAt: string | null;
  workbookFileName: string;
  updatedAt: string;
}

export interface RecruitmentModuleState {
  settings: RecruitmentSettings;
  candidates: CandidateRecord[];
  questions: AssessmentQuestion[];
  submissions: CandidateSubmissionRecord[];
  aiInterviewSessions?: AIInterviewSessionRecord[];
  startupCaseSets?: StartupCaseSet[];
  interviews: InterviewEvaluationRecord[];
  emailTemplates: RecruitmentEmailTemplate[];
  emailLogs: RecruitmentEmailLog[];
  scoreAuditLogs: ScoreAdjustmentAuditEntry[];
}
