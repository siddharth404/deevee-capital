/**
 * DEEVEE CAPITAL — UNIFIED WORKSPACE DATABASE & MIGRATION ENGINE
 * Supports Cloud Firestore (via Firebase Admin SDK when enabled) and
 * Sovereign Local Persistence (data/workspace/db.json) with non-destructive
 * migration from data/submissions.jsonl.
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { getFirebaseAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { DEFAULT_ROLE_TEMPLATES } from "./permissions";
import {
  AuditLogEntry,
  CompetitorRecord,
  DecisionRecord,
  FounderSubmission,
  PipelineStageConfig,
  ResearchAssignment,
  ResearchCitationSource,
  ResearchLibraryEntry,
  ResearchTemplate,
  SavedViewConfig,
  ScorecardConfig,
  StartupEvaluation,
  StartupRecord,
  StartupResearchWorkspace,
  UserInvitation,
  WorkspaceComment,
  WorkspaceDatabaseSchema,
  WorkspaceDocument,
  WorkspaceNotification,
  WorkspaceSettings,
  WorkspaceTask,
  WorkspaceTeam,
  WorkspaceUser,
} from "./types";
import {
  buildInitialRecruitmentState,
  calculateWeightedCompetencyScore,
} from "./iimAmritsarApplicants";
import {
  DEFAULT_STARTUP_CASE_SETS,
  evaluateCompleteAIInterviewSession,
  selectCaseSetForCandidate,
} from "./aiInterviewEngine";
import type {
  AIInterviewSessionRecord,
  ApplicantCandidateRecord,
  RecruitmentModuleState,
  StartupSimulationTaskSubmission,
} from "./recruitmentTypes";

const DB_DIR = path.join(process.cwd(), "data", "workspace");
const DB_FILE = path.join(DB_DIR, "db.json");
const SUBMISSIONS_JSONL = path.join(process.cwd(), "data", "submissions.jsonl");

export function hashPasswordScrypt(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, usedSalt, 64).toString("hex");
  return `${usedSalt}:${derived}`;
}

export function verifyPasswordScrypt(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derived, "hex"));
  } catch {
    return false;
  }
}

export function extractDomain(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    return u.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return rawUrl
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0] || "";
  }
}

const DEFAULT_PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: "stage-new-submission",
    name: "New Submission",
    slug: "new-submission",
    order: 1,
    color: "#2238C4",
    description: "Inbound founder submissions and newly logged opportunities awaiting triage.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-initial-screening",
    name: "Initial Screening",
    slug: "initial-screening",
    order: 2,
    color: "#0284C7",
    description: "First-principles desk triage on founder background, problem gravity, and mandate fit.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-research-in-progress",
    name: "Research in Progress",
    slug: "research-in-progress",
    order: 3,
    color: "#D97706",
    description: "Active deep-dive research assigned to analysts/interns covering market, product, and competitors.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-internal-review",
    name: "Internal Review",
    slug: "internal-review",
    order: 4,
    color: "#7C3AED",
    description: "Completed analyst research awaiting reviewer verification and lead evaluation.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-founder-discussion",
    name: "Founder Discussion",
    slug: "founder-discussion",
    order: 5,
    color: "#0D9488",
    description: "Direct dialogue and meetings with the founding team.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-detailed-evaluation",
    name: "Detailed Evaluation",
    slug: "detailed-evaluation",
    order: 6,
    color: "#4F46E5",
    description: "Structured scorecard evaluation, financial assessment, and risk register review.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-investment-decision",
    name: "Investment Decision",
    slug: "investment-decision",
    order: 7,
    color: "#B45309",
    description: "Final investment committee / promoter review for capital commitment up to ₹1 Crore.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-approved",
    name: "Approved",
    slug: "approved",
    order: 8,
    color: "#15803D",
    description: "Approved for investment subject to closing conditions and definitive documentation.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-invested",
    name: "Invested",
    slug: "invested",
    order: 9,
    color: "#047857",
    description: "Capital deployed; active portfolio partner company.",
    isTerminal: true,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-on-hold",
    name: "On Hold",
    slug: "on-hold",
    order: 10,
    color: "#64748B",
    description: "Paused pending key traction milestones, regulatory clarity, or future round.",
    isTerminal: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "stage-passed",
    name: "Passed",
    slug: "passed",
    order: 11,
    color: "#991B1B",
    description: "Declined for current investment cycle with documented rationale.",
    isTerminal: true,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
];

const DEFAULT_RESEARCH_TEMPLATES: ResearchTemplate[] = [
  {
    id: "tpl-initial-screening",
    name: "Initial Startup Screening",
    description: "Rapid first-principles desk assessment of founder pedigree, customer problem, and initial product wedge.",
    category: "Screening",
    defaultObjectives: "Verify company existence, founder backgrounds, problem acuteness, and initial customer utility.",
    defaultInstructions: "Cite official website, LinkedIn profiles, and at least 2 independent market or competitor sources.",
    defaultChecklist: [
      "Verify company website, incorporation status, and headquarters",
      "Cross-check founder LinkedIn profiles and prior operational history",
      "Articulate the core customer problem in plain language",
      "Identify top 3 direct or adjacent competitors",
      "Draft initial screening recommendation and founder questions",
    ],
    requiredSections: ["companyOverview", "founderResearch", "productResearch", "conclusion"],
    isSystem: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
    updatedBy: "user-siddharth",
  },
  {
    id: "tpl-comprehensive-research",
    name: "Comprehensive Startup Research",
    description: "Full 9-section institutional research memo covering founders, market sizing (TAM/SAM/SOM), product, unit economics, competitors, and risk register.",
    category: "Deep Dive",
    defaultObjectives: "Complete all 9 research modules with verified citations, explicit TAM methodology, and full risk assessment.",
    defaultInstructions: "Never enter a TAM figure without both source URL and bottom-up/top-down methodology. Clearly separate founder-reported metrics from verified facts.",
    defaultChecklist: [
      "Complete Company Overview & Incorporation verification",
      "Document Founder & Co-founder employment and entrepreneurial history",
      "Calculate TAM, SAM, and SOM with cited sources and explicit methodology",
      "Analyze Product differentiation and technical/operational moat",
      "Evaluate Business Model, pricing power, and unit economics",
      "Classify Traction metrics (Founder-reported vs. Publicly verified)",
      "Map at least 3 Competitors with strengths, weaknesses, and pricing",
      "Populate Risk Register across market, execution, regulatory, and concentration risks",
      "Write Executive Summary and concrete questions for founder call",
    ],
    requiredSections: [
      "companyOverview",
      "founderResearch",
      "marketResearch",
      "productResearch",
      "businessModel",
      "tractionFinancials",
      "risksRedFlags",
      "conclusion",
    ],
    isSystem: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
    updatedBy: "user-siddharth",
  },
  {
    id: "tpl-founder-background",
    name: "Founder Background Research",
    description: "Focused diligence on founding team domain insight, execution track record, co-founder dynamics, and public footprint.",
    category: "Founders",
    defaultObjectives: "Assess founder-market fit, prior company outcomes, and team complementarity.",
    defaultInstructions: "Include links to LinkedIn, past ventures, interviews, patents, or industry publications.",
    defaultChecklist: [
      "Map complete career timeline for each founder",
      "Verify previous startup or corporate execution outcomes",
      "Assess howlong co-founders have worked together",
      "Review public interviews, podcasts, or articles for domain depth",
    ],
    requiredSections: ["founderResearch", "conclusion"],
    isSystem: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
    updatedBy: "user-siddharth",
  },
  {
    id: "tpl-competitor-analysis",
    name: "Competitor & Landscape Analysis",
    description: "Structured mapping of incumbent players, funded startups, pricing models, and defensibility.",
    category: "Market",
    defaultObjectives: "Map direct and indirect competitors across India and global benchmarks.",
    defaultInstructions: "Add each competitor to the structured Competitor Database tab and cite pricing/funding sources.",
    defaultChecklist: [
      "Identify at least 4 direct and indirect competitors",
      "Compare pricing tiers and target customer segments",
      "Document funding history and key backers of competitors",
      "Assess target startup's structural differentiation",
    ],
    requiredSections: ["productResearch", "marketResearch", "conclusion"],
    isSystem: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
    updatedBy: "user-siddharth",
  },
  {
    id: "tpl-market-research",
    name: "Market & Industry Research",
    description: "Bottom-up market sizing, demand drivers, regulatory tailwinds/headwinds, and value chain analysis.",
    category: "Market",
    defaultObjectives: "Validate addressable market size and structural growth drivers without sector bias.",
    defaultInstructions: "Every market size claim must include publication date, source type, and calculation assumptions.",
    defaultChecklist: [
      "Calculate bottom-up TAM/SAM/SOM in INR/USD",
      "Document calculation methodology and customer count assumptions",
      "Analyze macro demand drivers and structural constraints",
      "Identify regulatory or policy dependencies",
    ],
    requiredSections: ["marketResearch", "risksRedFlags", "conclusion"],
    isSystem: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
    updatedBy: "user-siddharth",
  },
  {
    id: "tpl-financial-assessment",
    name: "Financial & Unit Economics Assessment",
    description: "Evaluation of revenue quality, gross margins, customer acquisition cost, burn rate, and capital efficiency.",
    category: "Financials",
    defaultObjectives: "Understand how customer value translates into durable unit economics and runway.",
    defaultInstructions: "Explicitly label founder-reported figures vs. audited/verified figures vs. analyst estimates.",
    defaultChecklist: [
      "Break down revenue model and pricing architecture",
      "Analyze gross margins and contribution margins",
      "Review current monthly burn, runway, and proposed use of ₹1 Cr capital",
      "Flag any customer concentration or working-capital risks",
    ],
    requiredSections: ["businessModel", "tractionFinancials", "risksRedFlags", "conclusion"],
    isSystem: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
    updatedBy: "user-siddharth",
  },
  {
    id: "tpl-investment-dd",
    name: "Investment Due Diligence",
    description: "Pre-decision diligence checklist covering commercial, financial, operational, and governance verification.",
    category: "Due Diligence",
    defaultObjectives: "Verify all material claims prior to Investment Decision.",
    defaultInstructions: "Ensure all red flags have documented evidence and mitigation plans.",
    defaultChecklist: [
      "Verify corporate incorporation and cap table summary",
      "Validate top customer references and retention claims",
      "Review historical financial statements and bank/runway position",
      "Complete Risk Register review with Investment Lead",
    ],
    requiredSections: [
      "companyOverview",
      "founderResearch",
      "marketResearch",
      "productResearch",
      "businessModel",
      "tractionFinancials",
      "risksRedFlags",
      "conclusion",
    ],
    isSystem: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
    updatedBy: "user-siddharth",
  },
];

const DEFAULT_SCORECARD: ScorecardConfig = {
  id: "scorecard-default",
  name: "Deevee Capital Sector-Agnostic Evaluation Scorecard",
  description:
    "Systematic 10-dimension evaluation framework for early-stage opportunities across all industries. Ratings (1–5) require written justification and evidence.",
  isDefault: true,
  updatedAt: "2026-11-01T00:00:00.000Z",
  updatedBy: "user-siddharth",
  dimensions: [
    {
      id: "dim-founder",
      name: "Founder Capability",
      description: "Earned domain insight, execution stamina, intellectual honesty, and team complementarity.",
      weight: 15,
    },
    {
      id: "dim-problem",
      name: "Problem Significance",
      description: "Gravity and frequency of the customer pain point and cost of inaction.",
      weight: 12,
    },
    {
      id: "dim-market",
      name: "Market Opportunity",
      description: "Credible addressable market size, durability, and structural growth tailwinds.",
      weight: 12,
    },
    {
      id: "dim-product",
      name: "Product / Solution",
      description: "Tangible utility, product readiness, differentiation, and customer value creation.",
      weight: 10,
    },
    {
      id: "dim-business-model",
      name: "Business Model",
      description: "Clarity of monetization, pricing power, and unit economic structure.",
      weight: 10,
    },
    {
      id: "dim-traction",
      name: "Traction",
      description: "Early customer validation, pilot velocity, revenue momentum, or retention relative to stage.",
      weight: 10,
    },
    {
      id: "dim-competitive",
      name: "Competitive Positioning",
      description: "Defensibility, distribution wedge, and barriers to entry against incumbents and peers.",
      weight: 8,
    },
    {
      id: "dim-scalability",
      name: "Scalability",
      description: "Operational leverage and ability to expand across geographies or segments.",
      weight: 8,
    },
    {
      id: "dim-financial",
      name: "Financial Sustainability",
      description: "Capital efficiency, margin profile, and prudent deployment of up to ₹1 Crore.",
      weight: 8,
    },
    {
      id: "dim-risk",
      name: "Risk Assessment",
      description: "Manageability of execution, regulatory, concentration, and market risks (5 = low/well-mitigated risk).",
      weight: 7,
    },
  ],
};

const DEFAULT_SAVED_VIEWS: SavedViewConfig[] = [
  { id: "view-all", name: "All Startups", isSystem: true, filters: {}, createdAt: "2026-11-01T00:00:00.000Z" },
  {
    id: "view-website-submissions",
    name: "New Website Submissions",
    isSystem: true,
    filters: { source: "Website Submission", stage: "New Submission" },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "view-my-assigned",
    name: "My Assigned Startups",
    isSystem: true,
    filters: { myAssignedOnly: true },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "view-research-in-progress",
    name: "Research in Progress",
    isSystem: true,
    filters: { stage: "Research in Progress" },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "view-awaiting-review",
    name: "Awaiting My Review",
    isSystem: true,
    filters: { awaitingReviewOnly: true },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "view-high-priority",
    name: "High Priority",
    isSystem: true,
    filters: { priority: "High" },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "view-founder-meetings",
    name: "Founder Meetings",
    isSystem: true,
    filters: { stage: "Founder Discussion" },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "view-on-hold",
    name: "On Hold",
    isSystem: true,
    filters: { stage: "On Hold" },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "view-passed",
    name: "Passed Opportunities",
    isSystem: true,
    filters: { stage: "Passed" },
    createdAt: "2026-11-01T00:00:00.000Z",
  },
];

function createInitialUsers(): WorkspaceUser[] {
  const defaultAdminPass = process.env.WORKSPACE_DEFAULT_PASSWORD || "Deevee@202";
  const hash = hashPasswordScrypt(defaultAdminPass);

  return [
    {
      id: "user-siddharth",
      uid: "user-siddharth",
      email: "siddharth@deeveecapital.com",
      name: "Siddharth Kaushik",
      role: "SUPER_ADMIN",
      status: "active",
      accessScope: "all",
      teamIds: ["team-investment", "team-research"],
      permissions: DEFAULT_ROLE_TEMPLATES.SUPER_ADMIN,
      title: "Managing Partner & Super Admin",
      passwordHash: hash,
      lastLoginAt: null,
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
      createdBy: "system-bootstrap",
    },
  ];
}

const DEFAULT_TEAMS: WorkspaceTeam[] = [
  {
    id: "team-investment",
    name: "Investment Committee & Leads",
    description: "Core decision-making and evaluation leadership at Deevee Capital.",
    leadUserId: "user-siddharth",
    leadUserName: "Siddharth Kaushik",
    memberIds: ["user-siddharth"],
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "team-research",
    name: "Startup Discovery & Research Desk",
    description: "Interns and analysts conducting sector-agnostic startup discovery and diligence.",
    leadUserId: "user-siddharth",
    leadUserName: "Siddharth Kaushik",
    memberIds: ["user-siddharth"],
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
];

const DEFAULT_SETTINGS: WorkspaceSettings = {
  id: "default",
  organizationName: "Deevee Capital",
  domain: "deeveecapital.com",
  investmentCapNote: "Up to ₹1 Crore per individual startup, subject to evaluation and approval.",
  mandateNote:
    "Sector-agnostic early-stage investment initiative. Sector is a classification field, never an eligibility filter.",
  defaultInternAccessScope: "assigned",
  requireTamCitation: true,
  requireHumanDecisionConfirmation: true,
  customSectors: [
    "Technology & Software",
    "Manufacturing & Industrial",
    "Consumer & Retail",
    "Healthcare & Life Sciences",
    "Financial Services & FinTech",
    "Infrastructure & Real Assets",
    "Agriculture & Rural Economy",
    "Climate & Clean Energy",
    "Education & Knowledge",
    "Logistics & Supply Chain",
    "Media, Entertainment & Gaming",
    "Artificial Intelligence & Data",
    "Enterprise Software & SaaS",
    "Other / Emerging Sector",
  ],
  customIndustries: [
    "Industrial Automation & Supply Chain",
    "Civil Infrastructure Monitoring",
    "B2B SaaS",
    "Specialty Manufacturing",
    "Agri-Supply Chain & Cold Storage",
    "Diagnostic Devices & MedTech",
    "Consumer Packaged Goods (D2C)",
    "Clean Mobility & Energy Storage",
    "Embedded Finance",
  ],
  roleTemplates: DEFAULT_ROLE_TEMPLATES,
  updatedAt: "2026-11-01T00:00:00.000Z",
  updatedBy: "user-siddharth",
};

export function createEmptyResearchWorkspace(params: {
  id: string;
  startup: StartupRecord;
  assignmentId?: string | null;
  templateId?: string;
  primaryResearcherId: string;
  primaryResearcherName: string;
  collaboratorIds?: string[];
  collaboratorNames?: string[];
  reviewerId?: string | null;
  reviewerName?: string | null;
}): StartupResearchWorkspace {
  const {
    id,
    startup,
    assignmentId = null,
    templateId = "tpl-comprehensive-research",
    primaryResearcherId,
    primaryResearcherName,
    collaboratorIds = [],
    collaboratorNames = [],
    reviewerId = startup.reviewerId || startup.assignedLeadId || "user-siddharth",
    reviewerName = startup.reviewerName || startup.assignedLeadName || "Siddharth Kaushik",
  } = params;

  const assignedUsers = Array.from(
    new Set(
      [
        primaryResearcherId,
        ...collaboratorIds,
        reviewerId,
        startup.assignedLeadId,
      ].filter(Boolean) as string[]
    )
  );

  const primaryFounder = startup.founders[0];
  const now = new Date().toISOString();

  return {
    id,
    startupId: startup.id,
    startupName: startup.name,
    assignmentId,
    templateId,
    status: "draft",
    version: 1,
    primaryResearcherId,
    primaryResearcherName,
    collaboratorIds,
    collaboratorNames,
    reviewerId,
    reviewerName,
    assignedUsers,
    companyOverview: {
      background: startup.description || "",
      foundingDate: startup.yearFounded || "",
      headquarters: startup.headquarters || "India",
      foundersSummary: startup.founders.map((f) => `${f.name} (${f.role})`).join(", "),
      products: startup.business.productService || "",
      businessModel: startup.business.businessModel || "",
      website: startup.website || "",
      currentStage: startup.funding.currentStage || "",
    },
    founderResearch: {
      profiles: primaryFounder ? `${primaryFounder.name} — ${primaryFounder.email}` : "",
      previousCompanies: primaryFounder?.previousExperience || "",
      employmentHistory: primaryFounder?.background || "",
      relevantExperience: "",
      education: primaryFounder?.education || "",
      linkedinProfiles: primaryFounder?.linkedinUrl || "",
      previousOutcomes: "",
      cofounderRelationships: "",
      publicInterviews: "",
    },
    marketResearch: {
      marketSizeSummary: "",
      tam: "",
      tamSource: "",
      tamMethodology: "",
      sam: "",
      samSource: "",
      som: "",
      somSource: "",
      industryTrends: "",
      customerSegments: startup.business.customerSegments || "",
      demandDrivers: "",
      marketOpportunities: "",
      marketLimitations: "",
    },
    productResearch: {
      functionality: startup.business.productService || "",
      technology: "",
      differentiation: startup.business.valueProposition || "",
      customerProblem: startup.business.problemAddressed || startup.description || "",
      productMaturity: startup.funding.currentStage || "",
      competitiveAdvantage: "",
      barriersToEntry: "",
    },
    businessModel: {
      revenueModel: startup.business.revenueModel || "",
      pricing: "",
      customerAcquisition: "",
      distribution: startup.business.distributionChannels || "",
      unitEconomics: "",
      grossMargins: "",
      scalability: "",
      recurringRevenue: startup.traction.arrMrr || "",
    },
    tractionFinancials: {
      revenue: startup.traction.currentRevenue || "",
      growth: startup.traction.revenueGrowth || "",
      customers: startup.traction.payingCustomers || "",
      retention: startup.traction.retention || "",
      burnRate: "",
      cashRunway: "",
      fundingHistory: startup.funding.previouslyRaised || "",
      revenueProjections: "",
      founderReportedData: startup.description
        ? `Founder submission note: ${startup.description}`
        : "",
      publiclyVerifiedData: "",
      analystEstimates: "",
      unverifiedAssumptions: "",
    },
    risksRedFlags: [],
    conclusion: {
      executiveSummary: "",
      whyInteresting: "",
      whatMakesPromising: "",
      mainConcerns: "",
      missingInformation: "",
      questionsForFounders: "",
      recommendationNextStep: "",
    },
    reviewHistory: [],
    versionHistory: [
      {
        version: 1,
        savedAt: now,
        savedBy: primaryResearcherId,
        savedByName: primaryResearcherName,
        status: "draft",
        summaryNote: "Initialized research workspace",
      },
    ],
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    approvedAt: null,
    approvedBy: null,
    approvedByName: null,
  };
}

let cachedDb: WorkspaceDatabaseSchema | null = null;
let cachedDbLoadedAt = 0;

const SESSION_STATUS_RANK: Record<string, number> = {
  "Not Started": 0,
  "Phase 1: Resume Probe": 1,
  "Phase 2: Startup Thinking": 2,
  "Phase 3: Startup Case Task": 3,
  "Completed": 4,
};

const ASSESSMENT_STATUS_RANK: Record<string, number> = {
  "Not Started": 0,
  "Invited": 1,
  "In Progress": 2,
  "Submitted": 3,
  "Evaluated": 4,
};

function mergeStartupTaskSubmission(
  a?: StartupSimulationTaskSubmission | null,
  b?: StartupSimulationTaskSubmission | null
): StartupSimulationTaskSubmission | null {
  if (!a && !b) return null;
  if (!a) return b || null;
  if (!b) return a || null;

  const pickLonger = (x?: string, y?: string) => {
    const sx = (x || "").trim();
    const sy = (y || "").trim();
    return sy.length > sx.length ? y || "" : x || "";
  };

  return {
    caseSetId: a.caseSetId || b.caseSetId,
    caseSetTitle: a.caseSetTitle || b.caseSetTitle,
    startupBTrueMetricAnalysis: pickLonger(
      a.startupBTrueMetricAnalysis,
      b.startupBTrueMetricAnalysis
    ),
    startupCTrueMetricAnalysis: pickLonger(
      a.startupCTrueMetricAnalysis,
      b.startupCTrueMetricAnalysis
    ),
    spottedRedFlagsSummary: pickLonger(a.spottedRedFlagsSummary, b.spottedRedFlagsSummary),
    selectedStartupFor1CrId: a.selectedStartupFor1CrId || b.selectedStartupFor1CrId,
    watchlistedStartupId: a.watchlistedStartupId || b.watchlistedStartupId,
    passedStartupId: a.passedStartupId || b.passedStartupId,
    investmentThesisAndNumbers: pickLonger(
      a.investmentThesisAndNumbers,
      b.investmentThesisAndNumbers
    ),
    winningStartupPrimaryRisk: pickLonger(
      a.winningStartupPrimaryRisk,
      b.winningStartupPrimaryRisk
    ),
    threeFounderDiligenceQuestions: pickLonger(
      a.threeFounderDiligenceQuestions,
      b.threeFounderDiligenceQuestions
    ),
    submittedAt: a.submittedAt || b.submittedAt || "",
    timeSpentSeconds: Math.max(a.timeSpentSeconds || 0, b.timeSpentSeconds || 0),
  };
}

export function mergeSessionMonotonically(
  a: AIInterviewSessionRecord,
  b: AIInterviewSessionRecord
): AIInterviewSessionRecord {
  const rankA = SESSION_STATUS_RANK[a.status] ?? 0;
  const rankB = SESSION_STATUS_RANK[b.status] ?? 0;
  const primary = rankB >= rankA ? b : a;
  const secondary = primary === b ? a : b;

  const mergedTurns = (primary.turns || []).map((t, idx) => {
    const otherTurn = secondary.turns?.[idx];
    if (!otherTurn) return t;
    const primaryAns = (t.candidateAnswer || "").trim();
    const otherAns = (otherTurn.candidateAnswer || "").trim();
    if (!primaryAns && otherAns) {
      return otherTurn;
    }
    if (primaryAns && otherAns && otherAns.length > primaryAns.length && !t.turnScore && otherTurn.turnScore) {
      return otherTurn;
    }
    return {
      ...t,
      turnScore: t.turnScore ?? otherTurn.turnScore ?? null,
      turnStrengths: t.turnStrengths?.length ? t.turnStrengths : otherTurn.turnStrengths || [],
      turnConcerns: t.turnConcerns?.length ? t.turnConcerns : otherTurn.turnConcerns || [],
    };
  });

  const answeredCount = mergedTurns.filter((t) => (t.candidateAnswer || "").trim().length > 0).length;
  const maxTurnIdx = Math.max(primary.currentTurnIndex || 0, secondary.currentTurnIndex || 0, answeredCount);
  const mergedTask = mergeStartupTaskSubmission(
    primary.startupTaskSubmission,
    secondary.startupTaskSubmission
  );

  // CRITICAL: Only mark Completed when actually finalized (completedAt or submittedAt is non-empty).
  // Auto-saved Phase 3 drafts have submittedAt === "" and must stay in "Phase 3: Startup Case Task"!
  const isTrulyCompleted = Boolean(
    primary.completedAt ||
      secondary.completedAt ||
      (mergedTask?.submittedAt && mergedTask.submittedAt.trim().length > 0)
  );

  let effectiveStatus = primary.status;
  if (isTrulyCompleted) {
    effectiveStatus = "Completed";
  } else if (maxTurnIdx >= mergedTurns.length && mergedTurns.length > 0) {
    effectiveStatus = "Phase 3: Startup Case Task";
  } else if (maxTurnIdx >= 3) {
    effectiveStatus = "Phase 2: Startup Thinking";
  } else if (effectiveStatus === "Completed") {
    effectiveStatus = "Phase 1: Resume Probe";
  }

  return {
    ...secondary,
    ...primary,
    status: effectiveStatus,
    currentTurnIndex: Math.min(mergedTurns.length, maxTurnIdx),
    turns: mergedTurns,
    completedAt: primary.completedAt || secondary.completedAt || null,
    startupTaskSubmission: mergedTask,
    scoringBreakdown: primary.scoringBreakdown || secondary.scoringBreakdown || null,
    continuationEmailSentAt: primary.continuationEmailSentAt || secondary.continuationEmailSentAt || null,
    proctoring: {
      ...secondary.proctoring,
      ...primary.proctoring,
      snapshots:
        (primary.proctoring?.snapshots?.length || 0) >= (secondary.proctoring?.snapshots?.length || 0)
          ? primary.proctoring?.snapshots || []
          : secondary.proctoring?.snapshots || [],
    },
  };
}

export function reconcileCandidatesAndSessions(
  candidates: ApplicantCandidateRecord[],
  sessions: AIInterviewSessionRecord[],
  rec?: Partial<RecruitmentModuleState>
): void {
  const caseSets =
    rec?.startupCaseSets && rec.startupCaseSets.length > 0
      ? rec.startupCaseSets
      : DEFAULT_STARTUP_CASE_SETS;
  const weights = rec?.settings?.weights;

  const sessMap = new Map<string, AIInterviewSessionRecord>();
  for (const s of sessions) {
    if (!s?.candidateId) continue;
    const hasSubmittedTask = Boolean(
      s.startupTaskSubmission?.submittedAt && s.startupTaskSubmission.submittedAt.trim().length > 0
    );
    const isTrulyCompleted = Boolean(s.completedAt || hasSubmittedTask);

    // Heal any session that was prematurely marked Completed by an unsubmitted Phase 3 draft
    if (!isTrulyCompleted && s.status === "Completed") {
      const answeredCount = (s.turns || []).filter(
        (t) => (t.candidateAnswer || "").trim().length > 0
      ).length;
      const maxIdx = Math.max(s.currentTurnIndex || 0, answeredCount);
      if (maxIdx >= (s.turns?.length || 6)) {
        s.status = "Phase 3: Startup Case Task";
      } else if (maxIdx >= 3) {
        s.status = "Phase 2: Startup Thinking";
      } else {
        s.status = "Phase 1: Resume Probe";
      }
    } else if (isTrulyCompleted && s.status !== "Completed") {
      s.status = "Completed";
    }

    if (s.proctoring?.events && s.proctoring.events.length > 15) {
      s.proctoring.events = s.proctoring.events.slice(0, 15);
    }

    sessMap.set(s.candidateId, s);
  }

  for (const c of candidates) {
    if (c.activityTimeline && c.activityTimeline.length > 15) {
      c.activityTimeline = c.activityTimeline.slice(0, 15);
    }
    if (c.sessionDeleted) continue;
    const s = sessMap.get(c.id);
    if (!s) continue;

    const hasSubmittedTask = Boolean(
      s.startupTaskSubmission?.submittedAt && s.startupTaskSubmission.submittedAt.trim().length > 0
    );
    const isTrulyCompleted = Boolean(s.completedAt || hasSubmittedTask);

    const assignedCaseSet =
      caseSets.find((cs) => cs.id === s.assignedCaseSetId) || selectCaseSetForCandidate(c);

    // Recompute scoringBreakdown if missing OR if an unsubmitted Phase 3 draft dragged Phase 3 score to 0
    const needsRescore =
      !s.scoringBreakdown ||
      (!hasSubmittedTask &&
        s.startupTaskSubmission &&
        s.scoringBreakdown.phase3Task1RedFlagAuditScore === 0 &&
        s.scoringBreakdown.phase3Task2CapitalAllocationScore === 0 &&
        (s.scoringBreakdown.phase1ResumeProbeScore > 0 ||
          s.scoringBreakdown.phase2StartupThinkingScore > 0));

    if (needsRescore) {
      s.scoringBreakdown = evaluateCompleteAIInterviewSession(s, assignedCaseSet);
    }

    if (isTrulyCompleted) {
      if (c.assessmentStatus !== "Evaluated" && c.assessmentStatus !== "Submitted") {
        c.assessmentStatus = s.scoringBreakdown ? "Evaluated" : "Submitted";
      }
      if (
        c.applicationStatus === "In Assessment Funnel" ||
        c.applicationStatus === "Pending Screening"
      ) {
        c.applicationStatus = "Assessment Submitted";
      }
    } else {
      // Candidate is still actively in progress (including Phase 3 worksheet)
      if (
        c.assessmentStatus === "Evaluated" ||
        c.assessmentStatus === "Submitted" ||
        c.assessmentStatus === "Invited" ||
        c.assessmentStatus === "Not Assigned"
      ) {
        c.assessmentStatus = "In Progress";
      }
      if (c.applicationStatus === "Assessment Submitted" || c.applicationStatus === "Pending Screening") {
        c.applicationStatus = "In Assessment Funnel";
      }
    }

    if (s.scoringBreakdown) {
      const bd = s.scoringBreakdown;
      if (bd.overallAiInterviewScore > 0) {
        c.aiInterviewScore = bd.overallAiInterviewScore;
      }

      if (hasSubmittedTask && (bd.phase3Task1RedFlagAuditScore > 0 || bd.phase3Task2CapitalAllocationScore > 0)) {
        if (!c.competencyScores || c.competencyScores.researchAptitude === 0) {
          c.competencyScores = {
            researchAptitude: bd.phase1ResumeProbeScore,
            startupDiscoverySourcing: bd.phase2StartupThinkingScore,
            marketBusinessAnalysis: bd.phase3Task2CapitalAllocationScore,
            financialCommercialUnderstanding: bd.phase3Task1RedFlagAuditScore,
            criticalThinkingRisk: bd.phase3Task3RiskAndFounderQuestionsScore,
            communicationDocumentation: Math.round(
              (bd.phase1ResumeProbeScore + bd.phase2StartupThinkingScore) / 2
            ),
            interviewOwnership: bd.phase1ResumeProbeScore,
          };
          c.finalWeightedScore = calculateWeightedCompetencyScore(c.competencyScores, weights);
        }
      } else if (bd.phase1ResumeProbeScore > 0 || bd.phase2StartupThinkingScore > 0) {
        // Populate live competency & weighted scores from Phase 1 + Phase 2 interview performance
        // so candidates who completed 6/6 questions (e.g. Arpit Nath 77.7, Parth Shekhawat 69.0, Shrey Mishra 68.0)
        // never display 0 competency scores / 18 weighted score on the leaderboard.
        const p1 = bd.phase1ResumeProbeScore;
        const p2 = bd.phase2StartupThinkingScore || p1;
        const avg = bd.overallAiInterviewScore || Math.round((p1 + p2) / 2);
        c.competencyScores = {
          researchAptitude: p1,
          startupDiscoverySourcing: p2,
          marketBusinessAnalysis: p2,
          financialCommercialUnderstanding: avg,
          criticalThinkingRisk: p2,
          communicationDocumentation: avg,
          interviewOwnership: p1,
        };
        c.finalWeightedScore = calculateWeightedCompetencyScore(c.competencyScores, weights);
      }
    }

    if (s.proctoring) {
      c.proctoringIntegrityScore = s.proctoring.integrityScore;
      c.proctoringIntegrityStatus = s.proctoring.integrityStatus;
    }
  }
}

export function mergeCandidateMonotonically(
  a: ApplicantCandidateRecord,
  b: ApplicantCandidateRecord
): ApplicantCandidateRecord {
  // If either record explicitly had sessionDeleted toggled most recently, respect the newer timestamp
  const timeA = new Date(a.updatedAt || 0).getTime();
  const timeB = new Date(b.updatedAt || 0).getTime();
  const newer = timeB >= timeA ? b : a;
  const older = newer === b ? a : b;

  if (newer.sessionDeleted) {
    return newer;
  }

  const rankA = ASSESSMENT_STATUS_RANK[a.assessmentStatus] ?? 0;
  const rankB = ASSESSMENT_STATUS_RANK[b.assessmentStatus] ?? 0;
  const bestAssessmentStatus = rankB >= rankA ? b.assessmentStatus : a.assessmentStatus;

  const hasSubmitted =
    bestAssessmentStatus === "Submitted" ||
    bestAssessmentStatus === "Evaluated" ||
    a.applicationStatus === "Assessment Submitted" ||
    b.applicationStatus === "Assessment Submitted";

  return {
    ...older,
    ...newer,
    assessmentStatus: bestAssessmentStatus,
    applicationStatus:
      hasSubmitted && newer.applicationStatus === "In Assessment Funnel"
        ? "Assessment Submitted"
        : newer.applicationStatus,
    aiInterviewScore: newer.aiInterviewScore ?? older.aiInterviewScore ?? null,
    proctoringIntegrityScore:
      newer.proctoringIntegrityScore ?? older.proctoringIntegrityScore ?? null,
    proctoringIntegrityStatus:
      newer.proctoringIntegrityStatus ?? older.proctoringIntegrityStatus,
  };
}

async function readSubmissionsJsonl(): Promise<Array<Record<string, unknown>>> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_JSONL, "utf-8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((item): item is Record<string, unknown> => item !== null);
  } catch {
    return [];
  }
}

/**
 * Non-destructively migrates any founder submissions in data/submissions.jsonl
 * into the workspace database without duplicating records or deleting existing files.
 */
function syncJsonlSubmissionsIntoDb(
  db: WorkspaceDatabaseSchema,
  jsonlRows: Array<Record<string, unknown>>
): boolean {
  let mutated = false;

  for (const row of jsonlRows) {
    const referenceId = String(row.referenceId || "").trim();
    if (!referenceId) continue;

    const alreadyInSubmissions = db.submissions.some((s) => s.referenceId === referenceId);
    if (alreadyInSubmissions) continue;

    const submittedAt = String(row.submittedAt || new Date().toISOString());
    const founderName = String(row.founderName || "Unknown Founder").trim();
    const founderEmail = String(row.founderEmail || "").trim().toLowerCase();
    const founderPhone = row.founderPhone ? String(row.founderPhone) : null;
    const linkedinUrl = row.linkedinUrl ? String(row.linkedinUrl) : null;
    const startupName = String(row.startupName || "Unnamed Startup").trim();
    const websiteUrl = row.websiteUrl ? String(row.websiteUrl) : null;
    const sector = String(row.sector || "Other / Emerging Sector").trim();
    const stage = String(row.stage || "Early Stage").trim();
    const description = String(row.description || "").trim();
    const fundingSought = row.fundingSought ? String(row.fundingSought) : null;
    const pitchDeckUrl = row.pitchDeckUrl ? String(row.pitchDeckUrl) : null;
    const pitchDeckFileName = row.pitchDeckFileName ? String(row.pitchDeckFileName) : null;
    const pitchDeckStorageUrl = row.pitchDeckStorageUrl ? String(row.pitchDeckStorageUrl) : null;
    const memoStorageUrl = row.memoStorageUrl ? String(row.memoStorageUrl) : null;

    // Check if startup already exists by name, domain, or founder email
    const domain = extractDomain(websiteUrl);
    let existingStartup = db.startups.find(
      (st) =>
        st.name.toLowerCase() === startupName.toLowerCase() ||
        (domain && st.domain && st.domain.toLowerCase() === domain) ||
        st.founders.some((f) => f.email.toLowerCase() === founderEmail)
    );

    const submissionId = `sub-${referenceId.toLowerCase()}`;

    if (!existingStartup) {
      const nextNum = db.startups.length + 1;
      const startupCode = `DVC-ST-${String(nextNum).padStart(4, "0")}`;
      const startupId = `startup-${referenceId.toLowerCase()}`;

      existingStartup = {
        id: startupId,
        startupCode,
        name: startupName,
        website: websiteUrl || "",
        domain,
        description,
        headquarters: "India",
        country: "India",
        sector,
        industry: sector,
        vertical: "",
        yearFounded: new Date(submittedAt).getFullYear().toString(),
        incorporationStatus: "Private Limited / Early Stage",
        companyType: "Private Company",
        founders: [
          {
            id: `founder-${referenceId.toLowerCase()}`,
            name: founderName,
            email: founderEmail,
            phone: founderPhone || "",
            linkedinUrl: linkedinUrl || "",
            role: "Founder & CEO",
            isPrimary: true,
          },
        ],
        business: {
          problemAddressed: description,
          productService: description,
          valueProposition: "",
          businessModel: "",
          targetCustomers: "",
          customerSegments: "",
          distributionChannels: "",
          revenueModel: "",
        },
        traction: {
          dataClassification: "founder_reported",
          geographicPresence: "India",
        },
        funding: {
          currentStage: stage,
          fundingSought: fundingSought || "",
        },
        pipelineStage: "New Submission",
        stageUpdatedAt: submittedAt,
        priority: "High",
        assignedLeadId: "user-siddharth",
        assignedLeadName: "Siddharth Kaushik",
        assignedResearcherId: "user-siddharth",
        assignedResearcherName: "Siddharth Kaushik",
        reviewerId: "user-siddharth",
        reviewerName: "Siddharth Kaushik",
        collaboratorIds: [],
        collaboratorNames: [],
        assignedUsers: ["user-siddharth"],
        source: "Website Submission",
        originalSubmissionId: submissionId,
        originalSubmissionRef: referenceId,
        tags: ["Website Intake", stage, sector.split("&")[0]?.trim() || "Startup"],
        internalSummary: `Inbound founder submission (${referenceId}) received via deeveecapital.com.`,
        nextFollowUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        archived: false,
        latestDecision: null,
        decisionHistory: [],
        createdAt: submittedAt,
        updatedAt: submittedAt,
        createdBy: "system-website-intake",
        createdByName: "Website Submission Intake",
        updatedBy: "system-website-intake",
        updatedByName: "Website Submission Intake",
      };

      db.startups.push(existingStartup);

      // Create initial research workspace for this startup
      const researchId = `res-${existingStartup.id}`;
      const researchWorkspace = createEmptyResearchWorkspace({
        id: researchId,
        startup: existingStartup,
        primaryResearcherId: "user-siddharth",
        primaryResearcherName: "Siddharth Kaushik",
        collaboratorIds: [],
        collaboratorNames: [],
        reviewerId: "user-siddharth",
        reviewerName: "Siddharth Kaushik",
      });
      db.research.push(researchWorkspace);

      // Create research assignment
      const assignmentId = `asgn-${existingStartup.id}`;
      researchWorkspace.assignmentId = assignmentId;
      db.assignments.push({
        id: assignmentId,
        startupId: existingStartup.id,
        startupName: existingStartup.name,
        startupCode: existingStartup.startupCode,
        title: `Initial Screening & Market Research — ${existingStartup.name}`,
        primaryResearcherId: "user-siddharth",
        primaryResearcherName: "Siddharth Kaushik",
        collaboratorIds: [],
        collaboratorNames: [],
        reviewerId: "user-siddharth",
        reviewerName: "Siddharth Kaushik",
        assignedUsers: ["user-siddharth"],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "High",
        status: "Assigned",
        objectives:
          "Validate founder background, product claims, market sizing (with cited TAM methodology), and map direct competitors.",
        instructions:
          "Preserve original founder claims in Founder-Reported section and add verified citations before submitting for review.",
        templateId: "tpl-comprehensive-research",
        checklist: DEFAULT_RESEARCH_TEMPLATES[1]!.defaultChecklist.map((text, idx) => ({
          id: `chk-${idx + 1}`,
          text,
          completed: false,
        })),
        researchId,
        createdAt: submittedAt,
        updatedAt: submittedAt,
        createdBy: "user-siddharth",
        createdByName: "Siddharth Kaushik",
      });

      // Create initial task
      db.tasks.push({
        id: `task-intake-${referenceId.toLowerCase()}`,
        title: `Complete Initial Screening Memo for ${existingStartup.name}`,
        description: `Review founder submission (${referenceId}), verify product & founder LinkedIn, and complete market sizing section.`,
        startupId: existingStartup.id,
        startupName: existingStartup.name,
        assignedToId: "user-siddharth",
        assignedToName: "Siddharth Kaushik",
        assignedUsers: ["user-siddharth"],
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "High",
        status: "To Do",
        checklist: [
          { id: "c1", text: "Verify founder background & LinkedIn", completed: false },
          { id: "c2", text: "Add market sizing sources & TAM calculation", completed: false },
          { id: "c3", text: "Complete initial evaluation", completed: false },
        ],
        attachments: [],
        createdBy: "user-siddharth",
        createdByName: "Siddharth Kaushik",
        createdAt: submittedAt,
        updatedAt: submittedAt,
      });

      // Add documents if deck/memo URLs exist
      if (pitchDeckUrl || pitchDeckStorageUrl) {
        db.documents.push({
          id: `doc-deck-${referenceId.toLowerCase()}`,
          startupId: existingStartup.id,
          startupName: existingStartup.name,
          title: `${existingStartup.name} — Founder Pitch Deck (${referenceId})`,
          fileName: pitchDeckFileName || `${referenceId}_Pitch_Deck.pdf`,
          fileSize: 1450000,
          mimeType: "application/pdf",
          category: "Pitch Deck",
          confidentiality: "restricted",
          allowedRoles: ["SUPER_ADMIN", "INVESTMENT_LEAD", "REVIEWER", "RESEARCH_ANALYST"],
          allowedUserIds: ["user-siddharth"],
          storagePath: pitchDeckStorageUrl || pitchDeckUrl || "",
          downloadUrl: pitchDeckStorageUrl || pitchDeckUrl || "",
          version: 1,
          uploadedBy: "system-website-intake",
          uploadedByName: `${founderName} (Founder Submission)`,
          createdAt: submittedAt,
        });
      }

      // Add activity log
      const logEntry: AuditLogEntry = {
        id: `log-intake-${referenceId.toLowerCase()}`,
        actorId: "system-website-intake",
        actorName: founderName,
        actorRole: "VIEWER",
        action: "submission.received",
        entityType: "submission",
        entityId: submissionId,
        entityName: existingStartup.name,
        startupId: existingStartup.id,
        summary: `Founder ${founderName} submitted ${existingStartup.name} (${referenceId}) via deeveecapital.com`,
        previousValue: null,
        newValue: "New Submission",
        timestamp: submittedAt,
      };
      db.activity_logs.unshift(logEntry);
      db.audit_logs.unshift(logEntry);

      // Notify Super Admin
      db.notifications.unshift({
        id: `notif-sub-admin-${referenceId.toLowerCase()}`,
        recipientId: "user-siddharth",
        type: "submission",
        title: `New Founder Submission: ${existingStartup.name}`,
        message: `${founderName} submitted ${existingStartup.name} (${sector}) under ${referenceId}.`,
        startupId: existingStartup.id,
        entityId: submissionId,
        link: `/workspace/startups/${existingStartup.id}`,
        read: false,
        actorId: "system-website-intake",
        actorName: founderName,
        createdAt: submittedAt,
      });
    }

    const submission: FounderSubmission = {
      id: submissionId,
      referenceId,
      startupId: existingStartup.id,
      submittedAt,
      founderName,
      founderEmail,
      founderPhone,
      linkedinUrl,
      startupName,
      websiteUrl,
      sector,
      stage,
      description,
      fundingSought,
      pitchDeckUrl,
      pitchDeckFileName,
      pitchDeckStorageUrl,
      memoStorageUrl,
      privacyConsent: Boolean(row.privacyConsent ?? true),
      status: "new",
      rawPayload: row,
    };

    db.submissions.unshift(submission);
    mutated = true;
  }

  return mutated;
}

function buildInitialDatabase(): WorkspaceDatabaseSchema {
  return {
    users: createInitialUsers(),
    teams: DEFAULT_TEAMS,
    invitations: [],
    startups: [],
    submissions: [],
    assignments: [],
    research: [],
    research_sources: [],
    competitors: [],
    research_templates: DEFAULT_RESEARCH_TEMPLATES,
    scorecards: [DEFAULT_SCORECARD],
    evaluations: [],
    decisions: [],
    tasks: [],
    comments: [],
    notifications: [],
    documents: [],
    research_library: [],
    pipeline_stages: DEFAULT_PIPELINE_STAGES,
    saved_views: DEFAULT_SAVED_VIEWS,
    activity_logs: [],
    audit_logs: [],
    workspace_settings: DEFAULT_SETTINGS,
    recruitment: buildInitialRecruitmentState(),
  };
}

const FIRESTORE_ARRAY_COLLECTIONS = [
  "users",
  "teams",
  "invitations",
  "startups",
  "submissions",
  "assignments",
  "research",
  "research_sources",
  "competitors",
  "research_templates",
  "scorecards",
  "evaluations",
  "decisions",
  "tasks",
  "comments",
  "notifications",
  "documents",
  "research_library",
  "pipeline_stages",
  "saved_views",
  "activity_logs",
  "audit_logs",
] as const;

export async function syncAllCollectionsToFirestore(db: WorkspaceDatabaseSchema): Promise<void> {
  if (!isFirebaseAdminConfigured()) return;
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) return;

  try {
    let batch = firestore.batch();
    let opCount = 0;

    const commitAndReset = async () => {
      if (opCount > 0) {
        await batch.commit();
        batch = firestore.batch();
        opCount = 0;
      }
    };

    const settingsRef = firestore.collection("workspace_settings").doc("default");
    batch.set(settingsRef, JSON.parse(JSON.stringify(db.workspace_settings)), { merge: true });
    opCount += 1;

    if (db.recruitment) {
      reconcileCandidatesAndSessions(
        db.recruitment.candidates || [],
        db.recruitment.aiInterviewSessions || [],
        db.recruitment
      );

      const candidates = db.recruitment.candidates || [];
      const chunkSize = 40;
      const chunkCount = Math.ceil(candidates.length / chunkSize);

      const recruitmentMeta = {
        settings: db.recruitment.settings,
        questions: db.recruitment.questions || [],
        submissions: db.recruitment.submissions || [],
        aiInterviewSessions: [],
        sessionChunkCount: 0,
        startupCaseSets: db.recruitment.startupCaseSets || [],
        interviews: db.recruitment.interviews || [],
        emailTemplates: db.recruitment.emailTemplates || [],
        emailLogs: (db.recruitment.emailLogs || []).slice(0, 120),
        scoreAuditLogs: (db.recruitment.scoreAuditLogs || []).slice(0, 120),
        candidateChunkCount: chunkCount,
        updatedAt: new Date().toISOString(),
      };
      const recMetaRef = firestore.collection("workspace_settings").doc("recruitment_meta");
      batch.set(recMetaRef, JSON.parse(JSON.stringify(recruitmentMeta)));
      opCount += 1;

      for (let i = 0; i < chunkCount; i++) {
        const chunk = candidates.slice(i * chunkSize, (i + 1) * chunkSize);
        const chunkRef = firestore
          .collection("workspace_settings")
          .doc(`recruitment_candidates_${i}`);
        batch.set(chunkRef, JSON.parse(JSON.stringify({ chunkIndex: i, items: chunk })));
        opCount += 1;
        if (opCount >= 200) {
          await commitAndReset();
        }
      }
    }

    for (const colName of FIRESTORE_ARRAY_COLLECTIONS) {
      const items = (db[colName] as unknown as Array<{ id: string }>) || [];
      const slice =
        colName === "activity_logs" || colName === "audit_logs" ? items.slice(0, 40) : items;

      for (const item of slice) {
        if (!item?.id) continue;
        const docRef = firestore.collection(colName).doc(String(item.id));
        batch.set(docRef, JSON.parse(JSON.stringify(item)), { merge: true });
        opCount += 1;
        if (opCount >= 200) {
          await commitAndReset();
        }
      }
    }

    await commitAndReset();
  } catch (err) {
    console.warn("[Workspace DB] Firestore collection sync warning:", err);
  }
}

/**
 * Fast, low-memory single-candidate session persistence for Candidate Portal actions.
 * Writes ONLY the active candidate's session document (`ai_interview_sessions/{candidateId}`)
 * and optionally their candidate chunk (`recruitment_candidates_0` or `1`), avoiding full-DB rewrites.
 */
export async function saveSingleCandidateSessionToFirestore(
  db: WorkspaceDatabaseSchema,
  candidateId: string,
  syncCandidateRecord = true
): Promise<void> {
  cachedDb = db;
  cachedDbLoadedAt = Date.now();

  if (!isFirebaseAdminConfigured()) {
    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), {
        encoding: "utf-8",
        mode: 0o600,
      });
    } catch {
      // ignore
    }
    return;
  }

  const firestore = getFirebaseAdminFirestore();
  if (!firestore || !db.recruitment) return;

  try {
    const sessions = db.recruitment.aiInterviewSessions || [];
    const sessIdx = sessions.findIndex(
      (s) => s.candidateId === candidateId
    );
    if (sessIdx >= 0) {
      let localSess = sessions[sessIdx]!;
      const sessRef = firestore.collection("ai_interview_sessions").doc(String(candidateId));
      try {
        const cloudDoc = await sessRef.get();
        if (cloudDoc.exists) {
          const cloudSess = cloudDoc.data() as AIInterviewSessionRecord;
          if (cloudSess?.candidateId && localSess.candidateCode !== "DVC-SAMPLE-001") {
            localSess = mergeSessionMonotonically(cloudSess, localSess);
            sessions[sessIdx] = localSess;
          }
        }
      } catch {
        // non-blocking read before write
      }
      await sessRef.set(JSON.parse(JSON.stringify(localSess)));
    }

    reconcileCandidatesAndSessions(
      db.recruitment.candidates || [],
      db.recruitment.aiInterviewSessions || [],
      db.recruitment
    );

    if (syncCandidateRecord) {
      const candidates = db.recruitment.candidates || [];
      const candIdx = candidates.findIndex((c) => c.id === candidateId);
      const chunkSize = 40;
      if (candIdx >= 0) {
        const chunkIndex = Math.floor(candIdx / chunkSize);
        const chunk = candidates.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
        const chunkRef = firestore
          .collection("workspace_settings")
          .doc(`recruitment_candidates_${chunkIndex}`);
        await chunkRef.set(JSON.parse(JSON.stringify({ chunkIndex, items: chunk })));
      }
    }
  } catch (err) {
    console.warn("[Workspace DB] Single candidate session save warning:", err);
  }
}

async function refreshRecruitmentFromFirestore(
  existingDb: WorkspaceDatabaseSchema
): Promise<boolean> {
  if (!isFirebaseAdminConfigured()) return false;
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) return false;

  try {
    const [recMetaDoc, perCandSnap] = await Promise.all([
      firestore.collection("workspace_settings").doc("recruitment_meta").get(),
      firestore.collection("ai_interview_sessions").get().catch(() => null),
    ]);
    if (!recMetaDoc.exists) return false;

    const meta = recMetaDoc.data() as Partial<RecruitmentModuleState> & {
      candidateChunkCount?: number;
    };
    const chunkCount = Number(meta.candidateChunkCount || 2);
    const candChunkDocs = await Promise.all(
      Array.from({ length: chunkCount }, (_, i) =>
        firestore.collection("workspace_settings").doc(`recruitment_candidates_${i}`).get()
      )
    );
    const loadedCandidates: ApplicantCandidateRecord[] = [];
    for (const chunkDoc of candChunkDocs) {
      if (chunkDoc.exists) {
        const data = chunkDoc.data() as { items?: ApplicantCandidateRecord[] };
        if (Array.isArray(data?.items)) {
          loadedCandidates.push(...data.items);
        }
      }
    }

    const sessionByCandidateId = new Map<string, AIInterviewSessionRecord>();
    if (perCandSnap && !perCandSnap.empty) {
      for (const docSnap of perCandSnap.docs) {
        const s = docSnap.data() as AIInterviewSessionRecord;
        if (!s?.candidateId) continue;
        const prev = sessionByCandidateId.get(s.candidateId);
        sessionByCandidateId.set(
          s.candidateId,
          prev ? mergeSessionMonotonically(prev, s) : s
        );
      }
    }

    const deletedCandIds = new Set(
      loadedCandidates.filter((c) => c.sessionDeleted).map((c) => c.id)
    );
    for (const localS of existingDb.recruitment?.aiInterviewSessions || []) {
      if (!localS?.candidateId || deletedCandIds.has(localS.candidateId)) continue;
      const cloudS = sessionByCandidateId.get(localS.candidateId);
      if (!cloudS) {
        if (
          localS.candidateCode !== "DVC-SAMPLE-001" &&
          localS.candidateId !== "cand-sample-demo"
        ) {
          sessionByCandidateId.set(localS.candidateId, localS);
        }
      } else {
        sessionByCandidateId.set(
          localS.candidateId,
          mergeSessionMonotonically(cloudS, localS)
        );
      }
    }

    const loadedSessions = Array.from(sessionByCandidateId.values()).filter(
      (s) => !deletedCandIds.has(s.candidateId)
    );

    reconcileCandidatesAndSessions(loadedCandidates, loadedSessions, meta);

    if (existingDb.recruitment) {
      if (loadedCandidates.length > 0) {
        existingDb.recruitment.candidates = loadedCandidates;
      }
      existingDb.recruitment.aiInterviewSessions = loadedSessions;
      if (meta.settings) existingDb.recruitment.settings = meta.settings;
      if (Array.isArray(meta.submissions)) existingDb.recruitment.submissions = meta.submissions;
      if (Array.isArray(meta.interviews)) existingDb.recruitment.interviews = meta.interviews;
      if (Array.isArray(meta.emailLogs)) existingDb.recruitment.emailLogs = meta.emailLogs;
      if (Array.isArray(meta.scoreAuditLogs)) {
        existingDb.recruitment.scoreAuditLogs = meta.scoreAuditLogs;
      }
    }
    return true;
  } catch (err) {
    console.warn("[Workspace DB] Lightweight recruitment refresh warning:", err);
    return false;
  }
}

/**
 * Fast persistence for Recruitment Admin mutations (settings, candidate statuses, evaluations, email logs).
 * Writes ONLY recruitment_meta and recruitment_candidates_0..N (~80ms) instead of rewriting all 28 sessions + 21 collections.
 */
export async function saveRecruitmentMetadataAndCandidatesToFirestore(
  db: WorkspaceDatabaseSchema
): Promise<void> {
  cachedDb = db;
  cachedDbLoadedAt = Date.now();

  if (!isFirebaseAdminConfigured()) {
    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), {
        encoding: "utf-8",
        mode: 0o600,
      });
    } catch {
      // ignore
    }
    return;
  }

  const firestore = getFirebaseAdminFirestore();
  if (!firestore || !db.recruitment) return;

  try {
    reconcileCandidatesAndSessions(
      db.recruitment.candidates || [],
      db.recruitment.aiInterviewSessions || [],
      db.recruitment
    );

    const candidates = db.recruitment.candidates || [];
    const chunkSize = 40;
    const chunkCount = Math.ceil(candidates.length / chunkSize);

    const recruitmentMeta = {
      settings: db.recruitment.settings,
      questions: db.recruitment.questions || [],
      submissions: db.recruitment.submissions || [],
      aiInterviewSessions: [],
      sessionChunkCount: 0,
      startupCaseSets: db.recruitment.startupCaseSets || [],
      interviews: db.recruitment.interviews || [],
      emailTemplates: db.recruitment.emailTemplates || [],
      emailLogs: (db.recruitment.emailLogs || []).slice(0, 120),
      scoreAuditLogs: (db.recruitment.scoreAuditLogs || []).slice(0, 120),
      candidateChunkCount: chunkCount,
      updatedAt: new Date().toISOString(),
    };

    const batch = firestore.batch();
    const recMetaRef = firestore.collection("workspace_settings").doc("recruitment_meta");
    batch.set(recMetaRef, JSON.parse(JSON.stringify(recruitmentMeta)));

    for (let i = 0; i < chunkCount; i++) {
      const chunk = candidates.slice(i * chunkSize, (i + 1) * chunkSize);
      const chunkRef = firestore
        .collection("workspace_settings")
        .doc(`recruitment_candidates_${i}`);
      batch.set(chunkRef, JSON.parse(JSON.stringify({ chunkIndex: i, items: chunk })));
    }

    await batch.commit();
  } catch (err) {
    console.warn("[Workspace DB] Fast recruitment metadata save warning:", err);
  }
}

async function loadDatabaseFromFirestore(): Promise<WorkspaceDatabaseSchema | null> {
  if (!isFirebaseAdminConfigured()) return null;
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) return null;

  try {
    const nonUserCollections = FIRESTORE_ARRAY_COLLECTIONS.filter((c) => c !== "users");
    const [
      usersSnap,
      settingsDoc,
      recMetaDoc,
      perCandSnap,
      candChunk0,
      candChunk1,
      candChunk2,
      ...collectionSnaps
    ] = await Promise.all([
      firestore.collection("users").get(),
      firestore.collection("workspace_settings").doc("default").get(),
      firestore.collection("workspace_settings").doc("recruitment_meta").get(),
      firestore.collection("ai_interview_sessions").get().catch(() => null),
      firestore.collection("workspace_settings").doc("recruitment_candidates_0").get().catch(() => null),
      firestore.collection("workspace_settings").doc("recruitment_candidates_1").get().catch(() => null),
      firestore.collection("workspace_settings").doc("recruitment_candidates_2").get().catch(() => null),
      ...nonUserCollections.map((colName) => {
        const ref = firestore.collection(colName);
        return (
          colName === "activity_logs" || colName === "audit_logs"
            ? ref.limit(40).get()
            : ref.get()
        ).catch(() => null);
      }),
    ]);
    if (usersSnap.empty) return null;

    const base = buildInitialDatabase();
    if (settingsDoc.exists) {
      base.workspace_settings = {
        ...base.workspace_settings,
        ...(settingsDoc.data() as WorkspaceSettings),
      };
    }

    if (recMetaDoc.exists) {
      const meta = recMetaDoc.data() as Partial<RecruitmentModuleState> & {
        candidateChunkCount?: number;
        sessionChunkCount?: number;
      };
      const chunkCount = Number(meta.candidateChunkCount || 2);
      const preloadedChunks = [candChunk0, candChunk1, candChunk2];
      const extraChunkDocs =
        chunkCount > 3
          ? await Promise.all(
              Array.from({ length: chunkCount - 3 }, (_, idx) =>
                firestore
                  .collection("workspace_settings")
                  .doc(`recruitment_candidates_${idx + 3}`)
                  .get()
              )
            )
          : [];
      const allCandChunks = [...preloadedChunks.slice(0, chunkCount), ...extraChunkDocs];
      const loadedCandidates: ApplicantCandidateRecord[] = [];
      for (const chunkDoc of allCandChunks) {
        if (chunkDoc && chunkDoc.exists) {
          const data = chunkDoc.data() as { items?: ApplicantCandidateRecord[] };
          if (Array.isArray(data?.items)) {
            loadedCandidates.push(...data.items);
          }
        }
      }

      const sessionByCandidateId = new Map<string, AIInterviewSessionRecord>();

      // Primary source: isolated per-candidate session docs in ai_interview_sessions
      if (perCandSnap && !perCandSnap.empty) {
        for (const docSnap of perCandSnap.docs) {
          const s = docSnap.data() as AIInterviewSessionRecord;
          if (!s?.candidateId) continue;
          const prev = sessionByCandidateId.get(s.candidateId);
          sessionByCandidateId.set(
            s.candidateId,
            prev ? mergeSessionMonotonically(prev, s) : s
          );
        }
      }

      const deletedCandIds = new Set(
        loadedCandidates.filter((c) => c.sessionDeleted).map((c) => c.id)
      );
      const loadedSessions = Array.from(sessionByCandidateId.values()).filter(
        (s) => !deletedCandIds.has(s.candidateId)
      );

      reconcileCandidatesAndSessions(loadedCandidates, loadedSessions, meta);

      const fallbackRecruitment = buildInitialRecruitmentState();
      base.recruitment = {
        settings: meta.settings || fallbackRecruitment.settings,
        candidates:
          loadedCandidates.length > 0 ? loadedCandidates : fallbackRecruitment.candidates,
        questions:
          Array.isArray(meta.questions) && meta.questions.length > 0
            ? meta.questions
            : fallbackRecruitment.questions,
        submissions: Array.isArray(meta.submissions) ? meta.submissions : [],
        aiInterviewSessions: loadedSessions,
        startupCaseSets:
          Array.isArray(meta.startupCaseSets) && meta.startupCaseSets.length > 0
            ? meta.startupCaseSets
            : fallbackRecruitment.startupCaseSets,
        interviews: Array.isArray(meta.interviews) ? meta.interviews : [],
        emailTemplates:
          Array.isArray(meta.emailTemplates) && meta.emailTemplates.length > 0
            ? meta.emailTemplates
            : fallbackRecruitment.emailTemplates,
        emailLogs: Array.isArray(meta.emailLogs) ? meta.emailLogs : [],
        scoreAuditLogs: Array.isArray(meta.scoreAuditLogs) ? meta.scoreAuditLogs : [],
      };
    }

    base.users = usersSnap.docs.map((d) => d.data() as WorkspaceUser);

    nonUserCollections.forEach((colName, idx) => {
      const snap = collectionSnaps[idx];
      if (snap && !snap.empty) {
        (base as unknown as Record<string, unknown[]>)[colName] = snap.docs.map((d) => d.data());
      } else {
        (base as unknown as Record<string, unknown[]>)[colName] = [];
      }
    });

    if (base.pipeline_stages.length === 0) base.pipeline_stages = DEFAULT_PIPELINE_STAGES;
    if (base.saved_views.length === 0) base.saved_views = DEFAULT_SAVED_VIEWS;
    if (base.research_templates.length === 0) base.research_templates = DEFAULT_RESEARCH_TEMPLATES;
    if (base.scorecards.length === 0) base.scorecards = [DEFAULT_SCORECARD];
    if (base.teams.length === 0) base.teams = DEFAULT_TEAMS;
    if (!base.recruitment || !base.recruitment.candidates?.length) {
      base.recruitment = buildInitialRecruitmentState();
    }

    return base;
  } catch (err) {
    console.warn("[Workspace DB] Failed to load from Cloud Firestore:", err);
    return null;
  }
}

let inFlightLoadPromise: Promise<WorkspaceDatabaseSchema | null> | null = null;
let inFlightRefreshPromise: Promise<boolean> | null = null;
let jsonlMigratedOnce = false;

export async function getWorkspaceDb(): Promise<WorkspaceDatabaseSchema> {
  const isStale = Date.now() - cachedDbLoadedAt > 15000;
  if (!cachedDb) {
    if (isFirebaseAdminConfigured()) {
      if (!inFlightLoadPromise) {
        inFlightLoadPromise = loadDatabaseFromFirestore().finally(() => {
          inFlightLoadPromise = null;
        });
      }
      const fromCloud = await inFlightLoadPromise;
      if (fromCloud) {
        cachedDb = fromCloud;
        cachedDbLoadedAt = Date.now();
      }
    }

    if (!cachedDb) {
      try {
        await fs.mkdir(DB_DIR, { recursive: true });
        const raw = await fs.readFile(DB_FILE, "utf-8");
        cachedDb = JSON.parse(raw) as WorkspaceDatabaseSchema;
        cachedDbLoadedAt = Date.now();
      } catch {
        cachedDb = buildInitialDatabase();
        cachedDbLoadedAt = Date.now();
        if (isFirebaseAdminConfigured()) {
          await syncAllCollectionsToFirestore(cachedDb);
        }
      }
    }
  } else if (isFirebaseAdminConfigured() && isStale) {
    // Stale-While-Revalidate: return cachedDb immediately in 0ms while refreshing recruitment docs in background
    cachedDbLoadedAt = Date.now();
    if (!inFlightRefreshPromise) {
      inFlightRefreshPromise = refreshRecruitmentFromFirestore(cachedDb).finally(() => {
        inFlightRefreshPromise = null;
      });
    }
  }

  let recruitmentInitialized = false;
  if (!cachedDb.recruitment || !cachedDb.recruitment.candidates?.length) {
    cachedDb.recruitment = buildInitialRecruitmentState();
    recruitmentInitialized = true;
  } else {
    if (!Array.isArray(cachedDb.recruitment.aiInterviewSessions)) {
      cachedDb.recruitment.aiInterviewSessions = [];
      recruitmentInitialized = true;
    }
    if (!Array.isArray(cachedDb.recruitment.startupCaseSets) || cachedDb.recruitment.startupCaseSets.length === 0) {
      cachedDb.recruitment.startupCaseSets = buildInitialRecruitmentState().startupCaseSets;
      recruitmentInitialized = true;
    }
  }

  if (!jsonlMigratedOnce) {
    jsonlMigratedOnce = true;
    const jsonlRows = await readSubmissionsJsonl();
    const migrated = syncJsonlSubmissionsIntoDb(cachedDb, jsonlRows);
    if (migrated || recruitmentInitialized) {
      void saveWorkspaceDb(cachedDb);
    }
  }

  return cachedDb;
}

export async function saveWorkspaceDb(db: WorkspaceDatabaseSchema): Promise<void> {
  cachedDb = db;
  cachedDbLoadedAt = Date.now();

  if (isFirebaseAdminConfigured()) {
    await syncAllCollectionsToFirestore(db);
    return;
  }

  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), {
      encoding: "utf-8",
      mode: 0o600,
    });
  } catch {
    // Ignore local filesystem write errors on read-only serverless runtimes
  }
}

export async function deleteSessionFromFirestore(candidateId: string): Promise<void> {
  if (!isFirebaseAdminConfigured()) return;
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) return;
  try {
    await firestore.collection("ai_interview_sessions").doc(String(candidateId)).delete();
  } catch (err) {
    console.warn("[Workspace DB] Firestore delete session warning:", err);
  }
}

export async function recordAuditAndActivity(
  db: WorkspaceDatabaseSchema,
  entry: Omit<AuditLogEntry, "id" | "timestamp">
): Promise<AuditLogEntry> {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    timestamp: new Date().toISOString(),
  };

  db.activity_logs.unshift(fullEntry);
  db.audit_logs.unshift(fullEntry);
  return fullEntry;
}

export interface DuplicateMatch {
  startupId: string;
  startupCode: string;
  name: string;
  website?: string;
  sector: string;
  pipelineStage: string;
  source: string;
  matchReasons: string[];
}

export function detectDuplicateStartups(
  db: WorkspaceDatabaseSchema,
  candidate: {
    name?: string;
    website?: string;
    founderEmail?: string;
    excludeStartupId?: string;
  }
): DuplicateMatch[] {
  const normName = (candidate.name || "").trim().toLowerCase();
  const normDomain = extractDomain(candidate.website);
  const normEmail = (candidate.founderEmail || "").trim().toLowerCase();

  const matches: DuplicateMatch[] = [];

  for (const st of db.startups) {
    if (candidate.excludeStartupId && st.id === candidate.excludeStartupId) continue;

    const reasons: string[] = [];
    if (normName && normName.length >= 2) {
      const stName = st.name.trim().toLowerCase();
      if (stName === normName || (normName.length >= 4 && stName.includes(normName))) {
        reasons.push(`Company name matches "${st.name}"`);
      }
    }

    if (normDomain && normDomain.length >= 3) {
      const stDomain = st.domain || extractDomain(st.website);
      if (stDomain && stDomain === normDomain) {
        reasons.push(`Website domain matches "${stDomain}"`);
      }
    }

    if (normEmail && normEmail.includes("@")) {
      const hasFounderEmail = st.founders.some((f) => f.email.trim().toLowerCase() === normEmail);
      if (hasFounderEmail) {
        reasons.push(`Founder email matches "${normEmail}"`);
      }
    }

    if (reasons.length > 0) {
      matches.push({
        startupId: st.id,
        startupCode: st.startupCode,
        name: st.name,
        website: st.website,
        sector: st.sector,
        pipelineStage: st.pipelineStage,
        source: st.source,
        matchReasons: reasons,
      });
    }
  }

  return matches;
}

/**
 * Ingests a live website pitch submission directly from POST /api/pitch
 * into the internal workspace database.
 */
export async function ingestWebsitePitchSubmission(
  submissionRecord: Record<string, unknown>
): Promise<{ startupId: string; submissionId: string }> {
  const db = await getWorkspaceDb();
  syncJsonlSubmissionsIntoDb(db, [submissionRecord]);
  await saveWorkspaceDb(db);

  const refId = String(submissionRecord.referenceId || "");
  const sub = db.submissions.find((s) => s.referenceId === refId);
  return {
    startupId: sub?.startupId || "",
    submissionId: sub?.id || "",
  };
}

export async function deleteStartupFromFirestore(startupId: string): Promise<void> {
  if (!isFirebaseAdminConfigured()) return;
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) return;
  try {
    await firestore.collection("startups").doc(startupId).delete();
  } catch (err) {
    console.warn("[Workspace DB] Firestore delete startup warning:", err);
  }
}

export async function deleteInvitationFromFirestore(invitationId: string): Promise<void> {
  if (!isFirebaseAdminConfigured()) return;
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) return;
  try {
    await firestore.collection("invitations").doc(invitationId).delete();
  } catch (err) {
    console.warn("[Workspace DB] Firestore delete invitation warning:", err);
  }
}

