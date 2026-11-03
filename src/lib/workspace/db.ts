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
  const defaultAdminPass = process.env.WORKSPACE_DEFAULT_PASSWORD || "Deevee@2026";
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
        status: "Not Started",
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

    for (const colName of FIRESTORE_ARRAY_COLLECTIONS) {
      const items = (db[colName] as unknown as Array<{ id: string }>) || [];
      const slice =
        colName === "activity_logs" || colName === "audit_logs" ? items.slice(0, 150) : items;

      for (const item of slice) {
        if (!item?.id) continue;
        const docRef = firestore.collection(colName).doc(String(item.id));
        batch.set(docRef, JSON.parse(JSON.stringify(item)), { merge: true });
        opCount += 1;
        if (opCount >= 400) {
          await commitAndReset();
        }
      }
    }

    await commitAndReset();
  } catch (err) {
    console.warn("[Workspace DB] Firestore collection sync warning:", err);
  }
}

async function loadDatabaseFromFirestore(): Promise<WorkspaceDatabaseSchema | null> {
  if (!isFirebaseAdminConfigured()) return null;
  const firestore = getFirebaseAdminFirestore();
  if (!firestore) return null;

  try {
    const usersSnap = await firestore.collection("users").get();
    if (usersSnap.empty) return null;

    const base = buildInitialDatabase();
    const settingsDoc = await firestore.collection("workspace_settings").doc("default").get();
    if (settingsDoc.exists) {
      base.workspace_settings = {
        ...base.workspace_settings,
        ...(settingsDoc.data() as WorkspaceSettings),
      };
    }

    await Promise.all(
      FIRESTORE_ARRAY_COLLECTIONS.map(async (colName) => {
        const snap = await firestore.collection(colName).get();
        if (!snap.empty) {
          (base as unknown as Record<string, unknown[]>)[colName] = snap.docs.map((d) => d.data());
        } else {
          (base as unknown as Record<string, unknown[]>)[colName] = [];
        }
      })
    );

    // Ensure structural defaults if empty
    if (base.pipeline_stages.length === 0) base.pipeline_stages = DEFAULT_PIPELINE_STAGES;
    if (base.saved_views.length === 0) base.saved_views = DEFAULT_SAVED_VIEWS;
    if (base.research_templates.length === 0) base.research_templates = DEFAULT_RESEARCH_TEMPLATES;
    if (base.scorecards.length === 0) base.scorecards = [DEFAULT_SCORECARD];
    if (base.teams.length === 0) base.teams = DEFAULT_TEAMS;

    return base;
  } catch (err) {
    console.warn("[Workspace DB] Failed to load from Cloud Firestore:", err);
    return null;
  }
}

export async function getWorkspaceDb(): Promise<WorkspaceDatabaseSchema> {
  if (!cachedDb) {
    if (isFirebaseAdminConfigured()) {
      const fromCloud = await loadDatabaseFromFirestore();
      if (fromCloud) {
        cachedDb = fromCloud;
      }
    }

    if (!cachedDb) {
      try {
        await fs.mkdir(DB_DIR, { recursive: true });
        const raw = await fs.readFile(DB_FILE, "utf-8");
        cachedDb = JSON.parse(raw) as WorkspaceDatabaseSchema;
      } catch {
        cachedDb = buildInitialDatabase();
        if (isFirebaseAdminConfigured()) {
          await syncAllCollectionsToFirestore(cachedDb);
        }
      }
    }
  }

  // Always check if new submissions were added to data/submissions.jsonl
  const jsonlRows = await readSubmissionsJsonl();
  const migrated = syncJsonlSubmissionsIntoDb(cachedDb, jsonlRows);
  if (migrated) {
    await saveWorkspaceDb(cachedDb);
  }

  return cachedDb;
}

export async function saveWorkspaceDb(db: WorkspaceDatabaseSchema): Promise<void> {
  cachedDb = db;
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), {
      encoding: "utf-8",
      mode: 0o600,
    });
  } catch {
    // Ignore local filesystem write errors on read-only serverless runtimes
  }

  // Mirror all collections to Cloud Firestore when configured
  if (isFirebaseAdminConfigured()) {
    await syncAllCollectionsToFirestore(db);
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

