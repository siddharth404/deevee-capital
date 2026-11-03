/**
 * DEEVEE CAPITAL — ROLE & PERMISSION ENGINE
 * Enforces backend & frontend RBAC + record-level authorization
 */

import {
  PermissionKey,
  StartupRecord,
  StartupResearchWorkspace,
  UserRole,
  WorkspaceDocument,
  WorkspaceUser,
} from "./types";

export const ALL_PERMISSIONS: Array<{
  key: PermissionKey;
  label: string;
  category: "Startups" | "Research" | "Evaluation" | "Team & Admin" | "Data & Documents";
  description: string;
}> = [
  {
    key: "startup.view_all",
    label: "View All Startups",
    category: "Startups",
    description: "Access the complete master startup database across all stages and sources.",
  },
  {
    key: "startup.view_assigned",
    label: "View Assigned Startups",
    category: "Startups",
    description: "Access startups where the user is assigned as lead, researcher, collaborator, or reviewer.",
  },
  {
    key: "startup.create",
    label: "Create Startups",
    category: "Startups",
    description: "Add new startup opportunities into the deal flow database.",
  },
  {
    key: "startup.edit",
    label: "Edit Startup Profiles",
    category: "Startups",
    description: "Update company details, founder information, business model, and traction fields.",
  },
  {
    key: "startup.archive",
    label: "Archive Startups",
    category: "Startups",
    description: "Move startup records to or from the archived state.",
  },
  {
    key: "startup.delete",
    label: "Delete Startups",
    category: "Startups",
    description: "Permanently remove startup records (restricted to Super Admin).",
  },
  {
    key: "submission.view",
    label: "View Website Submissions",
    category: "Startups",
    description: "View raw founder website submissions and intake queue.",
  },
  {
    key: "research.create",
    label: "Create Research Records",
    category: "Research",
    description: "Initiate startup research workspaces and research library notes.",
  },
  {
    key: "research.edit_own",
    label: "Edit Assigned Research",
    category: "Research",
    description: "Draft and update research sections, citations, competitors, and risks on assigned startups.",
  },
  {
    key: "research.edit_all",
    label: "Edit Any Research",
    category: "Research",
    description: "Modify any research workspace across the platform.",
  },
  {
    key: "research.submit",
    label: "Submit Research for Review",
    category: "Research",
    description: "Mark research drafts as completed and submit to a reviewer.",
  },
  {
    key: "research.review",
    label: "Review & Request Revisions",
    category: "Research",
    description: "Provide structured review feedback and request revisions from analysts.",
  },
  {
    key: "research.approve",
    label: "Approve Research",
    category: "Research",
    description: "Grant formal sign-off on completed startup research.",
  },
  {
    key: "evaluation.create",
    label: "Complete Evaluation Scorecards",
    category: "Evaluation",
    description: "Submit structured 10-dimension investment scorecards and written justifications.",
  },
  {
    key: "evaluation.decision",
    label: "Record Investment Decisions",
    category: "Evaluation",
    description: "Record official pipeline decisions (Proceed, Hold, Pass, Approved Subject to Conditions).",
  },
  {
    key: "task.assign",
    label: "Assign Research & Tasks",
    category: "Team & Admin",
    description: "Create research assignments and assign tasks to interns and team members.",
  },
  {
    key: "task.manage",
    label: "Manage All Tasks",
    category: "Team & Admin",
    description: "Update, reassign, or close any team task.",
  },
  {
    key: "users.invite",
    label: "Invite Team Members",
    category: "Team & Admin",
    description: "Send workspace invitations and onboard new users.",
  },
  {
    key: "users.manage",
    label: "Manage Roles & Permissions",
    category: "Team & Admin",
    description: "Modify user roles, access scopes, account status, and role templates.",
  },
  {
    key: "reports.view",
    label: "View Analytics & Reports",
    category: "Data & Documents",
    description: "Access deal flow, research productivity, and pipeline analytics.",
  },
  {
    key: "data.export",
    label: "Export Data (CSV / PDF)",
    category: "Data & Documents",
    description: "Export authorised startup lists, scorecards, and research reports.",
  },
  {
    key: "document.view_confidential",
    label: "Access Confidential Documents",
    category: "Data & Documents",
    description: "View and download restricted financial statements, legal docs, and confidential memos.",
  },
  {
    key: "settings.manage",
    label: "Manage Workspace Settings",
    category: "Team & Admin",
    description: "Configure pipeline stages, scorecard weights, security settings, and audit logs.",
  },
];

export const DEFAULT_ROLE_TEMPLATES: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS.map((p) => p.key),
  INVESTMENT_LEAD: [
    "startup.view_all",
    "startup.view_assigned",
    "startup.create",
    "startup.edit",
    "startup.archive",
    "submission.view",
    "research.create",
    "research.edit_own",
    "research.edit_all",
    "research.submit",
    "research.review",
    "research.approve",
    "evaluation.create",
    "evaluation.decision",
    "task.assign",
    "task.manage",
    "reports.view",
    "data.export",
    "document.view_confidential",
  ],
  RESEARCH_ANALYST: [
    "startup.view_assigned",
    "startup.create",
    "startup.edit",
    "research.create",
    "research.edit_own",
    "research.submit",
  ],
  REVIEWER: [
    "startup.view_assigned",
    "research.review",
    "research.approve",
    "evaluation.create",
    "reports.view",
  ],
  VIEWER: ["startup.view_assigned"],
};

export const ROLE_METADATA: Record<
  UserRole,
  { label: string; badgeColor: string; description: string }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeColor: "bg-[#101A24] text-[#F7F5F0] border-[#C6AD7A]",
    description: "Full administrative, investment, security, and user-management authority.",
  },
  INVESTMENT_LEAD: {
    label: "Investment Lead",
    badgeColor: "bg-amber-950/10 text-amber-900 border-amber-800/30",
    description: "Operational lead managing deal flow, intern assignments, reviews, evaluations, and decisions.",
  },
  RESEARCH_ANALYST: {
    label: "Research Analyst / Intern",
    badgeColor: "bg-sky-950/10 text-sky-900 border-sky-800/30",
    description: "Discovers startups, conducts structured company/market/competitor research, and submits for review.",
  },
  REVIEWER: {
    label: "Reviewer",
    badgeColor: "bg-emerald-950/10 text-emerald-900 border-emerald-800/30",
    description: "Reviews analyst research, requests revisions, completes evaluation scorecards, and approves research.",
  },
  VIEWER: {
    label: "Viewer",
    badgeColor: "bg-slate-200/70 text-slate-700 border-slate-300",
    description: "Read-only access to specifically authorised startup records.",
  },
};

export function hasPermission(user: WorkspaceUser | null | undefined, permission: PermissionKey): boolean {
  if (!user || user.status !== "active") return false;
  if (user.role === "SUPER_ADMIN") return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

export function canViewStartup(user: WorkspaceUser | null | undefined, startup: StartupRecord): boolean {
  if (!user || user.status !== "active") return false;
  if (user.role === "SUPER_ADMIN" || user.role === "INVESTMENT_LEAD") return true;
  if (user.accessScope === "all" || hasPermission(user, "startup.view_all")) return true;
  if (!hasPermission(user, "startup.view_assigned")) return false;

  return (
    startup.createdBy === user.id ||
    startup.assignedLeadId === user.id ||
    startup.assignedResearcherId === user.id ||
    startup.reviewerId === user.id ||
    (Array.isArray(startup.collaboratorIds) && startup.collaboratorIds.includes(user.id)) ||
    (Array.isArray(startup.assignedUsers) && startup.assignedUsers.includes(user.id))
  );
}

export function canEditStartup(user: WorkspaceUser | null | undefined, startup: StartupRecord): boolean {
  if (!user || user.status !== "active") return false;
  if (user.role === "SUPER_ADMIN" || user.role === "INVESTMENT_LEAD") return true;
  if (!hasPermission(user, "startup.edit")) return false;
  return canViewStartup(user, startup);
}

export function canDeleteStartup(user: WorkspaceUser | null | undefined): boolean {
  if (!user || user.status !== "active") return false;
  return user.role === "SUPER_ADMIN" && hasPermission(user, "startup.delete");
}

export function canApproveResearch(
  user: WorkspaceUser | null | undefined,
  research: StartupResearchWorkspace
): boolean {
  if (!user || user.status !== "active") return false;
  // Interns can NEVER approve their own research
  if (user.role === "RESEARCH_ANALYST" || research.primaryResearcherId === user.id) {
    if (user.role !== "SUPER_ADMIN" && user.role !== "INVESTMENT_LEAD") {
      return false;
    }
  }
  return hasPermission(user, "research.approve");
}

export function canReviewResearch(
  user: WorkspaceUser | null | undefined,
  research: StartupResearchWorkspace
): boolean {
  if (!user || user.status !== "active") return false;
  if (user.role === "RESEARCH_ANALYST") return false;
  return (
    user.role === "SUPER_ADMIN" ||
    user.role === "INVESTMENT_LEAD" ||
    hasPermission(user, "research.review") ||
    research.reviewerId === user.id
  );
}

export function canViewDocument(
  user: WorkspaceUser | null | undefined,
  doc: WorkspaceDocument,
  startup?: StartupRecord | null
): boolean {
  if (!user || user.status !== "active") return false;
  if (user.role === "SUPER_ADMIN" || user.role === "INVESTMENT_LEAD") return true;

  if (startup && !canViewStartup(user, startup)) {
    return false;
  }

  if (doc.confidentiality === "confidential") {
    if (hasPermission(user, "document.view_confidential")) return true;
    if (Array.isArray(doc.allowedUserIds) && doc.allowedUserIds.includes(user.id)) return true;
    return false;
  }

  if (doc.confidentiality === "restricted") {
    if (Array.isArray(doc.allowedRoles) && doc.allowedRoles.includes(user.role)) return true;
    if (Array.isArray(doc.allowedUserIds) && doc.allowedUserIds.includes(user.id)) return true;
    return false;
  }

  return true;
}
