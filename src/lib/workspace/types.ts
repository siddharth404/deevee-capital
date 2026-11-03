/**
 * DEEVEE CAPITAL — INTERNAL INVESTMENT MANAGEMENT PLATFORM
 * Master Domain & Firestore Schema Types
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "INVESTMENT_LEAD"
  | "RESEARCH_ANALYST"
  | "REVIEWER"
  | "VIEWER";

export type UserStatus = "active" | "invited" | "deactivated";

export type AccessScope = "all" | "assigned";

export type PermissionKey =
  | "startup.view_all"
  | "startup.view_assigned"
  | "startup.create"
  | "startup.edit"
  | "startup.archive"
  | "startup.delete"
  | "submission.view"
  | "research.create"
  | "research.edit_own"
  | "research.edit_all"
  | "research.submit"
  | "research.review"
  | "research.approve"
  | "task.assign"
  | "task.manage"
  | "users.invite"
  | "users.manage"
  | "reports.view"
  | "data.export"
  | "settings.manage"
  | "evaluation.create"
  | "evaluation.decision"
  | "document.view_confidential";

export type StartupSource =
  | "Website Submission"
  | "Intern Research"
  | "Founder Referral"
  | "Investor Referral"
  | "LinkedIn"
  | "Startup Database"
  | "Incubator / Accelerator"
  | "Events"
  | "Direct Outreach"
  | "Other";

export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export type PipelineStageName =
  | "New Submission"
  | "Initial Screening"
  | "Research in Progress"
  | "Internal Review"
  | "Founder Discussion"
  | "Detailed Evaluation"
  | "Investment Decision"
  | "Approved"
  | "Invested"
  | "On Hold"
  | "Passed"
  | string;

export type DecisionOutcome =
  | "Proceed"
  | "Request More Information"
  | "Further Discussion"
  | "Hold"
  | "Pass"
  | "Approved Subject to Conditions";

export type DataClassification =
  | "founder_reported"
  | "publicly_verified"
  | "analyst_estimate"
  | "unverified";

export type SourceType =
  | "Official website"
  | "Company announcement"
  | "Government source"
  | "Regulatory filing"
  | "News article"
  | "LinkedIn"
  | "Founder interview"
  | "Database"
  | "Other";

export type ConfidenceLevel =
  | "Verified Fact"
  | "High Confidence"
  | "Medium Confidence"
  | "Analyst Estimate"
  | "Unverified Claim";

export type ResearchStatus =
  | "draft"
  | "submitted"
  | "revision_requested"
  | "approved";

export type AssignmentStatus =
  | "Assigned"
  | "In Progress"
  | "Submitted for Review"
  | "Revision Requested"
  | "Approved";

export type TaskStatus =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked";

export type DocumentCategory =
  | "Pitch Deck"
  | "Financial Statement"
  | "Business Plan"
  | "Market Research"
  | "Founder Profile"
  | "Due Diligence"
  | "Internal Investment Note"
  | "Legal Document";

export type ConfidentialityLevel = "standard" | "restricted" | "confidential";

export type LibraryCategory =
  | "Startups"
  | "Founders"
  | "Industries"
  | "Competitors"
  | "Markets"
  | "Emerging Business Models"
  | "Investment Themes"
  | "Events & Incubators";

export interface WorkspaceUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  accessScope: AccessScope;
  teamIds: string[];
  permissions: PermissionKey[];
  title?: string;
  avatarUrl?: string;
  passwordHash?: string; // Used in local sovereign mode
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkspaceTeam {
  id: string;
  name: string;
  description: string;
  leadUserId: string;
  leadUserName: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accessScope: AccessScope;
  teamIds: string[];
  permissions: PermissionKey[];
  inviteCode: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  invitedBy: string;
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
}

export interface FounderProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  role: string;
  isPrimary: boolean;
  previousExperience?: string;
  background?: string;
  education?: string;
}

export interface StartupBusinessInfo {
  problemAddressed: string;
  productService: string;
  valueProposition: string;
  businessModel: string;
  targetCustomers: string;
  customerSegments: string;
  distributionChannels: string;
  revenueModel: string;
}

export interface StartupTractionInfo {
  currentRevenue?: string;
  arrMrr?: string;
  revenueGrowth?: string;
  payingCustomers?: string;
  userCount?: string;
  retention?: string;
  majorCustomers?: string;
  geographicPresence?: string;
  dataClassification: DataClassification;
}

export interface StartupFundingInfo {
  currentStage: string;
  fundingSought?: string;
  previouslyRaised?: string;
  previousRounds?: string;
  existingInvestors?: string;
  proposedValuation?: string;
  instrument?: string;
  useOfFunds?: string;
}

export interface DecisionRecord {
  id: string;
  startupId: string;
  startupName: string;
  outcome: DecisionOutcome;
  reason: string;
  conditions?: string;
  previousStage: string;
  newStage: string;
  decidedBy: string;
  decidedByName: string;
  decidedAt: string;
}

export interface StartupRecord {
  id: string;
  startupCode: string; // e.g., DVC-ST-0001
  name: string;
  website?: string;
  domain?: string;
  description: string;
  logoUrl?: string;
  headquarters: string;
  country: string;
  sector: string;
  industry?: string;
  vertical?: string;
  yearFounded?: string;
  incorporationStatus?: string;
  companyType?: string;

  founders: FounderProfile[];
  business: StartupBusinessInfo;
  traction: StartupTractionInfo;
  funding: StartupFundingInfo;

  // Internal Management
  pipelineStage: PipelineStageName;
  stageUpdatedAt: string;
  priority: PriorityLevel;
  assignedLeadId?: string | null;
  assignedLeadName?: string | null;
  assignedResearcherId?: string | null;
  assignedResearcherName?: string | null;
  reviewerId?: string | null;
  reviewerName?: string | null;
  collaboratorIds: string[];
  collaboratorNames: string[];
  assignedUsers: string[]; // All user IDs assigned to this record

  source: StartupSource;
  originalSubmissionId?: string | null;
  originalSubmissionRef?: string | null;

  tags: string[];
  internalSummary?: string;
  nextFollowUpAt?: string | null;
  archived: boolean;

  latestDecision?: DecisionRecord | null;
  decisionHistory: DecisionRecord[];

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  updatedBy: string;
  updatedByName: string;
}

export interface FounderSubmission {
  id: string;
  referenceId: string;
  startupId: string;
  submittedAt: string;
  founderName: string;
  founderEmail: string;
  founderPhone?: string | null;
  linkedinUrl?: string | null;
  startupName: string;
  websiteUrl?: string | null;
  sector: string;
  stage: string;
  description: string;
  fundingSought?: string | null;
  pitchDeckUrl?: string | null;
  pitchDeckFileName?: string | null;
  pitchDeckStorageUrl?: string | null;
  memoStorageUrl?: string | null;
  privacyConsent: boolean;
  status: "new" | "reviewed" | "assigned" | "merged";
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rawPayload: Record<string, unknown>;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ResearchAssignment {
  id: string;
  startupId: string;
  startupName: string;
  startupCode: string;
  title: string;
  primaryResearcherId: string;
  primaryResearcherName: string;
  collaboratorIds: string[];
  collaboratorNames: string[];
  reviewerId: string;
  reviewerName: string;
  assignedUsers: string[];
  dueDate: string;
  priority: PriorityLevel;
  status: AssignmentStatus;
  objectives: string;
  instructions: string;
  templateId: string;
  checklist: ChecklistItem[];
  researchId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

export interface RiskEntry {
  id: string;
  category:
    | "Market risk"
    | "Founder risk"
    | "Product risk"
    | "Financial risk"
    | "Competitive risk"
    | "Regulatory risk"
    | "Execution risk"
    | "Customer concentration"
    | "Dependency risks"
    | "Unverified claims";
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  evidence: string;
  mitigation: string;
  researcherId: string;
  researcherName: string;
  dateIdentified: string;
  reviewStatus: "Open" | "Under Review" | "Verified" | "Mitigated";
}

export interface ResearchReviewEntry {
  id: string;
  version: number;
  action: "submitted" | "approved" | "revision_requested" | "reassigned";
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  feedback: string;
  missingEvidence?: string;
  additionalAnalysisRequested?: string;
  createdAt: string;
}

export interface ResearchVersionSnapshot {
  version: number;
  savedAt: string;
  savedBy: string;
  savedByName: string;
  status: ResearchStatus;
  summaryNote: string;
}

export interface StartupResearchWorkspace {
  id: string;
  startupId: string;
  startupName: string;
  assignmentId?: string | null;
  templateId: string;
  status: ResearchStatus;
  version: number;
  primaryResearcherId: string;
  primaryResearcherName: string;
  collaboratorIds: string[];
  collaboratorNames: string[];
  reviewerId?: string | null;
  reviewerName?: string | null;
  assignedUsers: string[];

  // A. Company Overview
  companyOverview: {
    background: string;
    foundingDate: string;
    headquarters: string;
    foundersSummary: string;
    products: string;
    businessModel: string;
    website: string;
    currentStage: string;
  };

  // B. Founder Research
  founderResearch: {
    profiles: string;
    previousCompanies: string;
    employmentHistory: string;
    relevantExperience: string;
    education: string;
    linkedinProfiles: string;
    previousOutcomes: string;
    cofounderRelationships: string;
    publicInterviews: string;
  };

  // C. Market Research (TAM requires source + methodology)
  marketResearch: {
    marketSizeSummary: string;
    tam: string;
    tamSource: string;
    tamMethodology: string;
    sam: string;
    samSource: string;
    som: string;
    somSource: string;
    industryTrends: string;
    customerSegments: string;
    demandDrivers: string;
    marketOpportunities: string;
    marketLimitations: string;
  };

  // D. Product Research
  productResearch: {
    functionality: string;
    technology: string;
    differentiation: string;
    customerProblem: string;
    productMaturity: string;
    competitiveAdvantage: string;
    barriersToEntry: string;
  };

  // E. Business Model
  businessModel: {
    revenueModel: string;
    pricing: string;
    customerAcquisition: string;
    distribution: string;
    unitEconomics: string;
    grossMargins: string;
    scalability: string;
    recurringRevenue: string;
  };

  // F. Traction & Financial Research (Distinct classifications)
  tractionFinancials: {
    revenue: string;
    growth: string;
    customers: string;
    retention: string;
    burnRate: string;
    cashRunway: string;
    fundingHistory: string;
    revenueProjections: string;
    founderReportedData: string;
    publiclyVerifiedData: string;
    analystEstimates: string;
    unverifiedAssumptions: string;
  };

  // H. Risks & Red Flags
  risksRedFlags: RiskEntry[];

  // I. Overall Research Conclusion
  conclusion: {
    executiveSummary: string;
    whyInteresting: string;
    whatMakesPromising: string;
    mainConcerns: string;
    missingInformation: string;
    questionsForFounders: string;
    recommendationNextStep: string;
  };

  reviewHistory: ResearchReviewEntry[];
  versionHistory: ResearchVersionSnapshot[];

  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  approvedByName?: string | null;
}

export interface ResearchCitationSource {
  id: string;
  startupId?: string | null;
  researchId?: string | null;
  libraryItemId?: string | null;
  section: string;
  claimSummary: string;
  sourceUrl: string;
  sourceTitle: string;
  publicationDate?: string;
  dateAccessed: string;
  sourceType: SourceType;
  analystNotes: string;
  confidenceLevel: ConfidenceLevel;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface CompetitorRecord {
  id: string;
  startupId: string;
  startupName: string;
  name: string;
  website?: string;
  geography: string;
  product: string;
  pricing: string;
  targetMarket: string;
  fundingHistory: string;
  strengths: string;
  weaknesses: string;
  differentiation: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultObjectives: string;
  defaultInstructions: string;
  defaultChecklist: string[];
  requiredSections: string[];
  isSystem: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface ScorecardDimension {
  id: string;
  name: string;
  description: string;
  weight: number; // e.g., 10 for 10%
}

export interface ScorecardConfig {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  dimensions: ScorecardDimension[];
  updatedAt: string;
  updatedBy: string;
}

export interface EvaluationDimensionScore {
  dimensionId: string;
  dimensionName: string;
  weight: number;
  score: number; // 1 to 5
  justification: string;
  evidence: string;
}

export interface StartupEvaluation {
  id: string;
  startupId: string;
  startupName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: UserRole;
  scores: EvaluationDimensionScore[];
  weightedScore: number; // 1.00 to 5.00
  reviewerComments: string;
  strengths: string;
  weaknesses: string;
  majorRisks: string;
  missingInformation: string;
  recommendation: DecisionOutcome;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  startupId?: string | null;
  startupName?: string | null;
  assignedToId: string;
  assignedToName: string;
  assignedUsers: string[];
  dueDate: string;
  priority: PriorityLevel;
  status: TaskStatus;
  checklist: ChecklistItem[];
  attachments: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceComment {
  id: string;
  startupId: string;
  taskId?: string | null;
  researchId?: string | null;
  parentId?: string | null;
  content: string;
  mentions: string[]; // User IDs mentioned
  mentionNames: string[];
  attachmentIds: string[];
  resolved: boolean;
  resolvedBy?: string | null;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceNotification {
  id: string;
  recipientId: string;
  type:
    | "assignment"
    | "mention"
    | "comment"
    | "review_request"
    | "revision_requested"
    | "approval"
    | "due_date"
    | "submission"
    | "decision";
  title: string;
  message: string;
  startupId?: string | null;
  entityId?: string | null;
  link: string;
  read: boolean;
  actorId: string;
  actorName: string;
  createdAt: string;
}

export interface WorkspaceDocument {
  id: string;
  startupId?: string | null;
  startupName?: string | null;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  confidentiality: ConfidentialityLevel;
  allowedRoles: UserRole[];
  allowedUserIds: string[];
  storagePath: string;
  downloadUrl: string;
  version: number;
  previousVersionId?: string | null;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

export interface ResearchLibraryEntry {
  id: string;
  title: string;
  category: LibraryCategory;
  summary: string;
  notes: string;
  sourceUrls: Array<{
    title: string;
    url: string;
    sourceType: SourceType;
    confidenceLevel: ConfidenceLevel;
  }>;
  authorId: string;
  authorName: string;
  contributorIds: string[];
  contributorNames: string[];
  attachments: string[];
  tags: string[];
  relatedStartupIds: string[];
  relatedStartupNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStageConfig {
  id: string;
  name: string;
  slug: string;
  order: number;
  color: string;
  description: string;
  isTerminal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedViewConfig {
  id: string;
  name: string;
  userId?: string | null;
  isSystem: boolean;
  filters: {
    stage?: string;
    sector?: string;
    fundingStage?: string;
    source?: string;
    assignedResearcherId?: string;
    priority?: string;
    search?: string;
    myAssignedOnly?: boolean;
    awaitingReviewOnly?: boolean;
  };
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType:
    | "startup"
    | "submission"
    | "assignment"
    | "research"
    | "evaluation"
    | "decision"
    | "task"
    | "comment"
    | "document"
    | "user"
    | "role"
    | "settings"
    | "library"
    | "competitor";
  entityId: string;
  entityName: string;
  startupId?: string | null;
  summary: string;
  previousValue?: string | null;
  newValue?: string | null;
  timestamp: string;
}

export interface WorkspaceSettings {
  id: string;
  organizationName: string;
  domain: string;
  investmentCapNote: string;
  mandateNote: string;
  defaultInternAccessScope: AccessScope;
  requireTamCitation: boolean;
  requireHumanDecisionConfirmation: boolean;
  customSectors: string[];
  customIndustries: string[];
  roleTemplates: Record<UserRole, PermissionKey[]>;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkspaceDatabaseSchema {
  users: WorkspaceUser[];
  teams: WorkspaceTeam[];
  invitations: UserInvitation[];
  startups: StartupRecord[];
  submissions: FounderSubmission[];
  assignments: ResearchAssignment[];
  research: StartupResearchWorkspace[];
  research_sources: ResearchCitationSource[];
  competitors: CompetitorRecord[];
  research_templates: ResearchTemplate[];
  scorecards: ScorecardConfig[];
  evaluations: StartupEvaluation[];
  decisions: DecisionRecord[];
  tasks: WorkspaceTask[];
  comments: WorkspaceComment[];
  notifications: WorkspaceNotification[];
  documents: WorkspaceDocument[];
  research_library: ResearchLibraryEntry[];
  pipeline_stages: PipelineStageConfig[];
  saved_views: SavedViewConfig[];
  activity_logs: AuditLogEntry[];
  audit_logs: AuditLogEntry[];
  workspace_settings: WorkspaceSettings;
}
