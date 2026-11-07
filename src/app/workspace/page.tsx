"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  ClipboardList,
  CheckSquare,
  Calendar,
  BookOpen,
  Globe,
  Swords,
  Award,
  Users,
  BarChart3,
  History,
  Settings,
  Sliders,
  ShieldCheck,
  Search,
  Plus,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Download,
  Filter,
  Columns,
  Kanban,
  List,
  Table as TableIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Lock,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { AuthScreen } from "@/components/workspace/AuthScreen";
import {
  ActivityAndSettingsView,
  AnalyticsAndReportsView,
  EvaluationsDirectoryView,
  MarketAndCompetitorView,
  ResearchLibraryView,
  ResearchQueueView,
  TasksAndCalendarView,
  TeamAndRolesView,
} from "@/components/workspace/IntelligenceAndManagementViews";
import RecruitmentModuleViews, {
  RECRUITMENT_SUBMODULE_NAV,
  RecruitmentSubTab,
} from "@/components/workspace/RecruitmentModuleViews";
import {
  AssignResearchModal,
  CommandPaletteModal,
  CreateStartupModal,
} from "@/components/workspace/Modals";
import { StartupDetailView } from "@/components/workspace/StartupDetailView";
import {
  canEditStartup,
  hasPermission,
  ROLE_METADATA,
} from "@/lib/workspace/permissions";
import {
  StartupRecord,
  UserRole,
  WorkspaceDatabaseSchema,
  WorkspaceUser,
} from "@/lib/workspace/types";

function WorkspaceInner() {
  const searchParams = useSearchParams();
  const initialStartupId = searchParams.get("startupId");
  const initialStartupTab = searchParams.get("tab") || "overview";
  const initialNav = searchParams.get("nav") || "overview";

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] =
    useState<Omit<WorkspaceUser, "passwordHash"> | null>(null);
  const [dbData, setDbData] = useState<WorkspaceDatabaseSchema | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);

  // Navigation & UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(initialNav);
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    initialStartupId
  );
  const [selectedStartupTab, setSelectedStartupTab] =
    useState<string>(initialStartupTab);

  // Modals & Popovers
  const [createStartupOpen, setCreateStartupOpen] = useState(false);
  const [assignResearchOpen, setAssignResearchOpen] = useState(false);
  const [assignDefaultStartupId, setAssignDefaultStartupId] = useState<
    string | undefined
  >(undefined);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Deal Flow Filters & View Mode
  const [dealFlowViewMode, setDealFlowViewMode] = useState<
    "table" | "kanban" | "compact"
  >("table");
  const [activeSavedView, setActiveSavedView] = useState<string>("view-all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [researcherFilter, setResearcherFilter] = useState("");
  const [myAssignedOnly, setMyAssignedOnly] = useState(false);
  const [awaitingReviewOnly, setAwaitingReviewOnly] = useState(false);

  // Table Bulk Selection & Column Visibility
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStage, setBulkStage] = useState("");
  const [bulkResearcherId, setBulkResearcherId] = useState("");
  const [bulkTag, setBulkTag] = useState("");
  const [showRevenueCol, setShowRevenueCol] = useState(true);
  const [showSourceCol, setShowSourceCol] = useState(true);

  const fetchWorkspaceState = useCallback(async () => {
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("dvc_workspace_jwt") : null;
      const headers: HeadersInit = jwt ? { Authorization: `Bearer ${jwt}` } : {};

      const [authRes, stateRes] = await Promise.all([
        fetch("/api/workspace/auth", { headers }),
        fetch("/api/workspace/state", { headers }),
      ]);
      const authJson = await authRes.json();
      setAvailableAccounts(authJson.availableAccounts || []);
      setPendingInvitations(authJson.pendingInvitations || []);
      setFirebaseStatus(authJson.firebaseStatus || null);

      if (!authJson.authenticated || !authJson.user || !stateRes.ok) {
        setAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      const stateJson = await stateRes.json();
      setAuthenticated(true);
      setCurrentUser(stateJson.currentUser);
      setDbData(stateJson.data);
      setFirebaseStatus(stateJson.firebaseStatus);
    } catch (err) {
      console.error("[Workspace] Failed to load state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceState();
  }, [fetchWorkspaceState]);

  // Global Cmd/Ctrl + K Shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleOpenStartup = (startupId: string, tab = "overview") => {
    setSelectedStartupId(startupId);
    setSelectedStartupTab(tab);
  };

  const handleApplySavedView = (viewId: string) => {
    setActiveSavedView(viewId);
    setStageFilter("");
    setSectorFilter("");
    setSourceFilter("");
    setPriorityFilter("");
    setResearcherFilter("");
    setMyAssignedOnly(false);
    setAwaitingReviewOnly(false);

    if (viewId === "view-website-submissions") {
      setSourceFilter("Website Submission");
    } else if (viewId === "view-my-assigned") {
      setMyAssignedOnly(true);
    } else if (viewId === "view-research-in-progress") {
      setStageFilter("Research in Progress");
    } else if (viewId === "view-awaiting-review") {
      setAwaitingReviewOnly(true);
    } else if (viewId === "view-high-priority") {
      setPriorityFilter("High");
    } else if (viewId === "view-founder-meetings") {
      setStageFilter("Founder Discussion");
    } else if (viewId === "view-on-hold") {
      setStageFilter("On Hold");
    } else if (viewId === "view-passed") {
      setStageFilter("Passed");
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) return;
    await fetch("/api/workspace/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "startup.bulk_update",
        startupIds: selectedIds,
        pipelineStage: bulkStage || undefined,
        assignedResearcherId: bulkResearcherId || undefined,
        addTag: bulkTag || undefined,
      }),
    });
    setSelectedIds([]);
    setBulkStage("");
    setBulkResearcherId("");
    setBulkTag("");
    await fetchWorkspaceState();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D151E] text-[#F7F5F0] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded bg-[#C6AD7A] text-[#101A24] font-serif font-bold text-xl flex items-center justify-center mx-auto animate-pulse">
            D
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#C6AD7A]">
            Loading Deevee Capital Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated || !currentUser || !dbData) {
    return (
      <AuthScreen
        availableAccounts={availableAccounts}
        pendingInvitations={pendingInvitations}
        onAuthenticated={fetchWorkspaceState}
      />
    );
  }

  const unreadNotifications = dbData.notifications.filter((n) => !n.read);
  const selectedStartup = selectedStartupId
    ? dbData.startups.find((s) => s.id === selectedStartupId) || null
    : null;

  // Filtered Startups for Deal Flow
  const filteredStartups = dbData.startups.filter((st) => {
    if (st.archived) return false;
    if (stageFilter && st.pipelineStage !== stageFilter) return false;
    if (sectorFilter && st.sector !== sectorFilter) return false;
    if (sourceFilter && st.source !== sourceFilter) return false;
    if (priorityFilter && st.priority !== priorityFilter) return false;
    if (researcherFilter && st.assignedResearcherId !== researcherFilter)
      return false;
    if (
      myAssignedOnly &&
      st.assignedResearcherId !== currentUser.id &&
      st.assignedLeadId !== currentUser.id &&
      !st.collaboratorIds.includes(currentUser.id)
    ) {
      return false;
    }
    if (awaitingReviewOnly) {
      const resDoc = dbData.research.find((r) => r.startupId === st.id);
      if (st.pipelineStage !== "Internal Review" && resDoc?.status !== "submitted") {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = st.name.toLowerCase().includes(q);
      const matchCode = st.startupCode.toLowerCase().includes(q);
      const matchSector = st.sector.toLowerCase().includes(q);
      const matchFounder = st.founders.some((f) =>
        f.name.toLowerCase().includes(q)
      );
      if (!matchName && !matchCode && !matchSector && !matchFounder) return false;
    }
    return true;
  });

  // Live KPI calculations for Overview Dashboard (Part 4.1)
  const kpiTotalStartups = dbData.startups.filter((s) => !s.archived).length;
  const kpiNewSubmissions = dbData.startups.filter(
    (s) => !s.archived && s.pipelineStage === "New Submission"
  ).length;
  const kpiUnderResearch = dbData.startups.filter(
    (s) => !s.archived && s.pipelineStage === "Research in Progress"
  ).length;
  const kpiAwaitingReview = dbData.startups.filter(
    (s) =>
      !s.archived &&
      (s.pipelineStage === "Internal Review" ||
        dbData.research.some(
          (r) => r.startupId === s.id && r.status === "submitted"
        ))
  ).length;
  const kpiFounderMeetings = dbData.startups.filter(
    (s) => !s.archived && s.pipelineStage === "Founder Discussion"
  ).length;
  const kpiAdvancedEvaluations = dbData.startups.filter(
    (s) =>
      !s.archived &&
      (s.pipelineStage === "Detailed Evaluation" ||
        s.pipelineStage === "Investment Decision" ||
        s.pipelineStage === "Approved")
  ).length;

  // Permission-filtered Sidebar Navigation
  const navGroups = [
    {
      group: "WORKSPACE",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard, show: true },
        { id: "dealflow", label: "Deal Flow", icon: Briefcase, show: true },
        { id: "startups", label: "Startups & Intake", icon: Building2, show: true },
        {
          id: "research-queue",
          label: "Research Queue",
          icon: ClipboardList,
          show: true,
        },
        { id: "tasks", label: "Tasks", icon: CheckSquare, show: true },
        { id: "calendar", label: "Calendar", icon: Calendar, show: true },
      ],
    },
    {
      group: "INTELLIGENCE",
      items: [
        {
          id: "research-library",
          label: "Research Library",
          icon: BookOpen,
          show: true,
        },
        {
          id: "market-research",
          label: "Market & Industry",
          icon: Globe,
          show: true,
        },
        {
          id: "competitors",
          label: "Competitor Database",
          icon: Swords,
          show: true,
        },
        {
          id: "evaluations",
          label: "Investment Evaluations",
          icon: Award,
          show: true,
        },
      ],
    },
    {
      group: "RECRUITMENT & TALENT",
      items: RECRUITMENT_SUBMODULE_NAV.map((sub) => ({
        id: sub.id,
        label: sub.label,
        icon: GraduationCap,
        show: true,
      })),
    },
    {
      group: "MANAGEMENT",
      items: [
        {
          id: "team",
          label: "Team & Members",
          icon: Users,
          show:
            currentUser.role === "SUPER_ADMIN" ||
            currentUser.role === "INVESTMENT_LEAD",
        },
        {
          id: "analytics",
          label: "Reports & Analytics",
          icon: BarChart3,
          show: hasPermission(currentUser as WorkspaceUser, "reports.view"),
        },
        {
          id: "activity",
          label: "Activity Log",
          icon: History,
          show: true,
        },
      ],
    },
    {
      group: "SETTINGS",
      items: [
        {
          id: "settings",
          label: "Workspace Settings",
          icon: Settings,
          show: hasPermission(currentUser as WorkspaceUser, "settings.manage"),
        },
        {
          id: "pipeline-config",
          label: "Pipeline Configuration",
          icon: Sliders,
          show: hasPermission(currentUser as WorkspaceUser, "settings.manage"),
        },
        {
          id: "roles-permissions",
          label: "User Roles & Permissions",
          icon: ShieldCheck,
          show: hasPermission(currentUser as WorkspaceUser, "users.manage"),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-slate-900 flex">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ================================================================== */}
      {/* PERSISTENT COLLAPSIBLE LEFT SIDEBAR (Part 3.1)                     */}
      {/* ================================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-[#101A24] text-[#F7F5F0] shrink-0 flex flex-col justify-between transition-transform duration-200 border-r border-white/10 shadow-2xl md:shadow-none`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded bg-[#C6AD7A] text-[#101A24] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                D
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="font-serif text-xs font-semibold tracking-widest uppercase block text-white">
                    DEEVEE CAPITAL
                  </span>
                  <span className="font-mono text-[9px] text-[#C6AD7A] uppercase tracking-wider block">
                    Investment OS
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:block text-slate-400 hover:text-white p-1"
                title="Toggle Sidebar"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="md:hidden text-slate-400 hover:text-white p-1"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="p-2.5 space-y-4 overflow-y-auto max-h-[calc(100vh-130px)]">
            {navGroups.map((grp) => {
              const visibleItems = grp.items.filter((i) => i.show);
              if (visibleItems.length === 0) return null;
              return (
                <div key={grp.group}>
                  {!sidebarCollapsed && (
                    <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      {grp.group}
                    </div>
                  )}
                  <div className="space-y-0.5 mt-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        !selectedStartupId && activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedStartupId(null);
                            setActiveNav(item.id);
                            setMobileDrawerOpen(false);
                          }}
                          title={item.label}
                          className={`w-full px-2.5 py-2 rounded text-xs font-medium flex items-center gap-2.5 transition-colors ${
                            isActive
                              ? "bg-[#C6AD7A] text-[#101A24] font-semibold"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {!sidebarCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 text-[11px]">
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 truncate">
                  {currentUser.name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[#C6AD7A] font-mono text-[9px]">
                  {currentUser.role}
                </span>
              </div>
              <a
                href="/"
                className="text-slate-400 hover:text-[#C6AD7A] flex items-center gap-1 text-[10px] font-mono uppercase"
              >
                <span>Public Site (deeveecapital.com)</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <a
              href="/"
              title="Public Website"
              className="flex justify-center text-slate-400 hover:text-white"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MAIN CONTENT AREA & TOP NAVIGATION BAR                             */}
      {/* ================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">
          {/* Mobile Menu Button & Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-mono uppercase text-[10px] text-slate-400 hidden sm:inline">
              Workspace
            </span>
            <span className="hidden sm:inline">/</span>
            <button
              type="button"
              onClick={() => setSelectedStartupId(null)}
              className="font-medium text-slate-800 hover:underline capitalize truncate"
            >
              {activeNav.replace("-", " ")}
            </button>
            {selectedStartup && (
              <>
                <span>/</span>
                <span className="font-semibold text-[#101A24] truncate">
                  {selectedStartup.name} ({selectedStartup.startupCode})
                </span>
              </>
            )}
          </div>

          {/* Search, Quick Create, Notifications & Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Cmd+K Search Trigger */}
            <button
              type="button"
              onClick={() => setCmdPaletteOpen(true)}
              className="px-3 py-1.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search workspace...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Quick Create Startup */}
            {hasPermission(currentUser as WorkspaceUser, "startup.create") && (
              <button
                type="button"
                onClick={() => setCreateStartupOpen(true)}
                className="px-3 py-1.5 rounded bg-[#101A24] text-[#F7F5F0] hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#C6AD7A]" />
                <span className="hidden sm:inline">Add Startup</span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded border border-slate-200 hover:bg-slate-50 relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <strong className="text-slate-900">
                      Notifications ({unreadNotifications.length} unread)
                    </strong>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/workspace/state", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "notification.mark_all_read",
                          }),
                        });
                        await fetchWorkspaceState();
                      }}
                      className="text-[11px] text-blue-700 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1.5">
                    {dbData.notifications.length === 0 ? (
                      <div className="py-4 text-center text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      dbData.notifications.slice(0, 12).map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={async () => {
                            await fetch("/api/workspace/state", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "notification.mark_read",
                                notificationId: n.id,
                              }),
                            });
                            setNotifOpen(false);
                            if (n.startupId) handleOpenStartup(n.startupId);
                            await fetchWorkspaceState();
                          }}
                          className={`w-full text-left p-2.5 rounded border ${
                            n.read
                              ? "bg-white border-slate-100 text-slate-500"
                              : "bg-amber-50/60 border-amber-200 text-slate-900"
                          }`}
                        >
                          <div className="font-semibold">{n.title}</div>
                          <div className="text-[11px] mt-0.5">{n.message}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Role Switcher (for testing all 5 RBAC roles seamlessly) */}
            <select
              value={currentUser.id}
              onChange={async (e) => {
                const res = await fetch("/api/workspace/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "switch_role_account",
                    userId: e.target.value,
                  }),
                });
                if (res.ok) {
                  setSelectedStartupId(null);
                  await fetchWorkspaceState();
                }
              }}
              className="px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 text-xs font-medium text-slate-800"
              title="Switch active user role to verify RBAC permissions"
            >
              {dbData.users
                .filter((u) => u.status === "active")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({ROLE_METADATA[u.role]?.label || u.role})
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={async () => {
                await fetch("/api/workspace/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "logout" }),
                });
                if (typeof window !== "undefined") {
                  localStorage.removeItem("dvc_workspace_jwt");
                }
                setAuthenticated(false);
                setCurrentUser(null);
              }}
              className="p-2 rounded border border-slate-200 hover:bg-red-50 text-slate-600 hover:text-red-700"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="p-5 flex-1 overflow-y-auto">
          {/* If a Startup Profile is open, show the 12-Tab StartupDetailView */}
          {selectedStartup ? (
            <StartupDetailView
              startup={selectedStartup}
              dbData={dbData}
              currentUser={currentUser}
              initialTab={selectedStartupTab}
              onBack={() => setSelectedStartupId(null)}
              onRefresh={fetchWorkspaceState}
              onOpenAssignResearch={(stId) => {
                setAssignDefaultStartupId(stId);
                setAssignResearchOpen(true);
              }}
              onSelectStartup={handleOpenStartup}
            />
          ) : (
            <>
              {/* ============================================================ */}
              {/* 1. OVERVIEW DASHBOARD (Part 4)                               */}
              {/* ============================================================ */}
              {activeNav === "overview" && (
                <div className="space-y-5">
                  <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#101A24] block">
                        Deevee Capital &bull; Sector-Agnostic Investment Mandate (Up to ₹1 Crore)
                      </span>
                      <h1 className="text-2xl font-serif font-semibold text-slate-900 mt-0.5">
                        Good morning, {currentUser.name.split(" ")[0]}.
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Logged in as{" "}
                        <strong>{ROLE_METADATA[currentUser.role].label}</strong>{" "}
                        (Access Scope: {currentUser.accessScope}). Here is what needs your attention today.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveNav("rec-dashboard")}
                        className="px-4 py-2 rounded bg-[#2238C4] hover:bg-[#1b2da1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>IIM Amritsar Recruitment & AI Interviews (79)</span>
                      </button>
                      {hasPermission(
                        currentUser as WorkspaceUser,
                        "startup.create"
                      ) && (
                        <button
                          type="button"
                          onClick={() => setCreateStartupOpen(true)}
                          className="px-4 py-2 rounded bg-[#101A24] text-[#F7F5F0] text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C6AD7A]" />
                          <span>Add Discovered Startup</span>
                        </button>
                      )}
                      {hasPermission(
                        currentUser as WorkspaceUser,
                        "task.assign"
                      ) && (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignDefaultStartupId(undefined);
                            setAssignResearchOpen(true);
                          }}
                          className="px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800"
                        >
                          Assign Research to Intern
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4.1: 6 Clickable KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {[
                      {
                        label: "Total Startups",
                        value: kpiTotalStartups,
                        sub: "Authorised pipeline",
                        onClick: () => {
                          handleApplySavedView("view-all");
                          setActiveNav("dealflow");
                        },
                      },
                      {
                        label: "New Submissions",
                        value: kpiNewSubmissions,
                        sub: "Website intake queue",
                        onClick: () => {
                          handleApplySavedView("view-website-submissions");
                          setActiveNav("dealflow");
                        },
                      },
                      {
                        label: "Under Research",
                        value: kpiUnderResearch,
                        sub: "Active analyst work",
                        onClick: () => {
                          handleApplySavedView("view-research-in-progress");
                          setActiveNav("dealflow");
                        },
                      },
                      {
                        label: "Awaiting Review",
                        value: kpiAwaitingReview,
                        sub: "Pending sign-off",
                        onClick: () => {
                          handleApplySavedView("view-awaiting-review");
                          setActiveNav("dealflow");
                        },
                      },
                      {
                        label: "Founder Meetings",
                        value: kpiFounderMeetings,
                        sub: "Direct discussions",
                        onClick: () => {
                          handleApplySavedView("view-founder-meetings");
                          setActiveNav("dealflow");
                        },
                      },
                      {
                        label: "Advanced Evaluations",
                        value: kpiAdvancedEvaluations,
                        sub: "Diligence & decision",
                        onClick: () => {
                          setStageFilter("Detailed Evaluation");
                          setActiveNav("dealflow");
                        },
                      },
                    ].map((kpi) => (
                      <button
                        key={kpi.label}
                        type="button"
                        onClick={kpi.onClick}
                        className="bg-white border border-slate-200 hover:border-[#101A24] rounded-lg p-4 text-left transition-all shadow-2xs group"
                      >
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-hover:text-[#101A24] block">
                          {kpi.label}
                        </span>
                        <div className="text-2xl font-serif font-bold text-slate-900 mt-1">
                          {kpi.value}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          {kpi.sub} &rarr;
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* 4.2: Visual Pipeline Overview across 11 Stages */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-base font-semibold text-slate-900">
                        Pipeline Stage Distribution
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setDealFlowViewMode("kanban");
                          setActiveNav("dealflow");
                        }}
                        className="text-xs text-blue-700 hover:underline font-medium"
                      >
                        Open Kanban Board &rarr;
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2">
                      {dbData.pipeline_stages.map((st) => {
                        const count = dbData.startups.filter(
                          (s) => !s.archived && s.pipelineStage === st.name
                        ).length;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              handleApplySavedView("view-all");
                              setStageFilter(st.name);
                              setActiveNav("dealflow");
                            }}
                            className="p-2.5 rounded border border-slate-200 hover:border-[#101A24] bg-slate-50/70 text-left transition-colors"
                          >
                            <div className="text-lg font-serif font-bold text-slate-900">
                              {count}
                            </div>
                            <div className="text-[11px] font-medium text-slate-700 leading-tight mt-0.5 line-clamp-2">
                              {st.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4.3 Action Centre & 4.4 Team Activity Timeline */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Action Centre */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-base font-semibold text-slate-900">
                          Action Centre — Requires Attention Today
                        </h2>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px]">
                          Live Operational Queue
                        </span>
                      </div>

                      {/* New Website Submissions */}
                      <div className="space-y-2">
                        <div className="font-mono uppercase tracking-wider text-[10px] text-slate-400">
                          Website Founder Submissions &amp; Active Research
                        </div>
                        {dbData.startups.slice(0, 4).map((st) => {
                          const resDoc = dbData.research.find(
                            (r) => r.startupId === st.id
                          );
                          return (
                            <div
                              key={st.id}
                              className="p-3 rounded border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-slate-900">
                                    {st.name}
                                  </strong>
                                  <span className="font-mono text-[10px] text-slate-500">
                                    ({st.startupCode})
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px]">
                                    {st.pipelineStage}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Sector: {st.sector} &bull; Researcher:{" "}
                                  <strong>
                                    {st.assignedResearcherName || "Unassigned"}
                                  </strong>{" "}
                                  &bull; Research:{" "}
                                  <span className="uppercase font-mono">
                                    {resDoc?.status || "draft"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenStartup(st.id, "research")
                                  }
                                  className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 font-medium text-slate-800"
                                >
                                  Research
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenStartup(st.id)}
                                  className="px-3 py-1.5 rounded bg-[#101A24] text-white font-medium"
                                >
                                  Inspect &rarr;
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Open Tasks */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="font-mono uppercase tracking-wider text-[10px] text-slate-400">
                          Pending Research &amp; Evaluation Tasks
                        </div>
                        {dbData.tasks
                          .filter((t) => t.status !== "Completed")
                          .slice(0, 4)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="p-2.5 rounded border border-slate-200 flex items-center justify-between gap-3"
                            >
                              <div>
                                <strong className="text-slate-800">
                                  {t.title}
                                </strong>
                                <div className="text-[11px] text-slate-500">
                                  Owner: {t.assignedToName} &bull; Due{" "}
                                  {new Date(t.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  t.startupId
                                    ? handleOpenStartup(t.startupId, "tasks")
                                    : setActiveNav("tasks")
                                }
                                className="text-blue-700 hover:underline font-medium"
                              >
                                View Task
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 4.4 Team Activity Timeline */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-base font-semibold text-slate-900">
                          Recent Team Activity Timeline
                        </h2>
                        <button
                          type="button"
                          onClick={() => setActiveNav("activity")}
                          className="text-[11px] text-blue-700 hover:underline"
                        >
                          Full Audit Log &rarr;
                        </button>
                      </div>
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {dbData.activity_logs.slice(0, 10).map((log) => (
                          <div
                            key={log.id}
                            className="p-3 rounded border border-slate-100 bg-slate-50/70 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
                                {log.action}
                              </span>
                              <span className="text-slate-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-slate-800">{log.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* 2. DEAL FLOW CRM & STARTUPS DATABASE (Part 5 & Part 6)       */}
              {/* ============================================================ */}
              {(activeNav === "dealflow" || activeNav === "startups") && (
                <div className="space-y-4">
                  {/* Top Header & View Switcher */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h1 className="text-xl font-serif font-semibold text-slate-900">
                          {activeNav === "startups"
                            ? "Master Startup Database & Website Submissions Queue"
                            : "Deal Flow CRM & Pipeline"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Showing {filteredStartups.length} of{" "}
                          {dbData.startups.length} authorised startup records.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 3 View Modes: Table, Kanban, Compact List */}
                        <div className="inline-flex rounded border border-slate-300 bg-slate-50 p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setDealFlowViewMode("table")}
                            className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                              dealFlowViewMode === "table"
                                ? "bg-[#101A24] text-white font-medium"
                                : "text-slate-600"
                            }`}
                          >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>Table</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDealFlowViewMode("kanban")}
                            className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                              dealFlowViewMode === "kanban"
                                ? "bg-[#101A24] text-white font-medium"
                                : "text-slate-600"
                            }`}
                          >
                            <Kanban className="w-3.5 h-3.5" />
                            <span>Kanban</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDealFlowViewMode("compact")}
                            className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                              dealFlowViewMode === "compact"
                                ? "bg-[#101A24] text-white font-medium"
                                : "text-slate-600"
                            }`}
                          >
                            <List className="w-3.5 h-3.5" />
                            <span>Compact</span>
                          </button>
                        </div>

                        {hasPermission(
                          currentUser as WorkspaceUser,
                          "data.export"
                        ) && (
                          <a
                            href={`/api/workspace/export?type=csv&stage=${encodeURIComponent(stageFilter)}&sector=${encodeURIComponent(sectorFilter)}`}
                            className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                          </a>
                        )}

                        {hasPermission(
                          currentUser as WorkspaceUser,
                          "startup.create"
                        ) && (
                          <button
                            type="button"
                            onClick={() => setCreateStartupOpen(true)}
                            className="px-3.5 py-1.5 rounded bg-[#101A24] text-[#F7F5F0] text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#C6AD7A]" />
                            <span>Add Startup</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Saved Views Bar (Part 5.3) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
                      {dbData.saved_views.map((sv) => (
                        <button
                          key={sv.id}
                          type="button"
                          onClick={() => handleApplySavedView(sv.id)}
                          className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                            activeSavedView === sv.id
                              ? "bg-[#101A24] text-white font-semibold"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {sv.name}
                        </button>
                      ))}
                    </div>

                    {/* Search & Multi-Filter Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by startup, founder, ID..."
                        className="px-3 py-1.5 rounded border border-slate-300"
                      />
                      <select
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="">All Stages</option>
                        {dbData.pipeline_stages.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={sectorFilter}
                        onChange={(e) => setSectorFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="">All Sectors (Agnostic)</option>
                        {dbData.workspace_settings.customSectors.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                      <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="">All Sources</option>
                        <option value="Website Submission">
                          Website Submission
                        </option>
                        <option value="Intern Research">Intern Research</option>
                        <option value="Founder Referral">Founder Referral</option>
                        <option value="Investor Referral">
                          Investor Referral
                        </option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Direct Outreach">Direct Outreach</option>
                      </select>
                      <select
                        value={researcherFilter}
                        onChange={(e) => setResearcherFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="">All Researchers</option>
                        {dbData.users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showSourceCol}
                            onChange={() => setShowSourceCol(!showSourceCol)}
                          />
                          <span>Source Col</span>
                        </label>
                        <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showRevenueCol}
                            onChange={() => setShowRevenueCol(!showRevenueCol)}
                          />
                          <span>Traction Col</span>
                        </label>
                      </div>
                    </div>

                    {/* Multi-Select Bulk Action Bar */}
                    {selectedIds.length > 0 && (
                      <div className="p-3 rounded bg-[#101A24] text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-[#C6AD7A]">
                          {selectedIds.length} startup(s) selected
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={bulkStage}
                            onChange={(e) => setBulkStage(e.target.value)}
                            className="px-2.5 py-1 rounded bg-slate-800 border border-white/20 text-white"
                          >
                            <option value="">Bulk Move Stage...</option>
                            {dbData.pipeline_stages.map((st) => (
                              <option key={st.id} value={st.name}>
                                {st.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={bulkResearcherId}
                            onChange={(e) => setBulkResearcherId(e.target.value)}
                            className="px-2.5 py-1 rounded bg-slate-800 border border-white/20 text-white"
                          >
                            <option value="">Bulk Assign Researcher...</option>
                            {dbData.users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Bulk Add Tag..."
                            value={bulkTag}
                            onChange={(e) => setBulkTag(e.target.value)}
                            className="px-2.5 py-1 rounded bg-slate-800 border border-white/20 text-white"
                          />
                          <button
                            type="button"
                            onClick={handleBulkAction}
                            className="px-3 py-1 rounded bg-[#C6AD7A] text-[#101A24] font-semibold"
                          >
                            Apply Bulk Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedIds([])}
                            className="px-2 py-1 text-slate-300 hover:text-white"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VIEW 1: TABLE VIEW */}
                  {dealFlowViewMode === "table" && (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500">
                          <tr>
                            <th className="p-3.5 w-8">
                              <input
                                type="checkbox"
                                checked={
                                  filteredStartups.length > 0 &&
                                  selectedIds.length === filteredStartups.length
                                }
                                onChange={(e) =>
                                  setSelectedIds(
                                    e.target.checked
                                      ? filteredStartups.map((s) => s.id)
                                      : []
                                  )
                                }
                              />
                            </th>
                            <th className="p-3.5">Startup</th>
                            <th className="p-3.5">Sector</th>
                            <th className="p-3.5">Founder</th>
                            <th className="p-3.5">Pipeline Stage</th>
                            <th className="p-3.5">Priority</th>
                            {showSourceCol && <th className="p-3.5">Source</th>}
                            {showRevenueCol && (
                              <th className="p-3.5">Stage &amp; Sought</th>
                            )}
                            <th className="p-3.5">Researcher</th>
                            <th className="p-3.5">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStartups.map((st) => (
                            <tr key={st.id} className="hover:bg-slate-50/90">
                              <td className="p-3.5">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(st.id)}
                                  onChange={(e) =>
                                    setSelectedIds((prev) =>
                                      e.target.checked
                                        ? [...prev, st.id]
                                        : prev.filter((id) => id !== st.id)
                                    )
                                  }
                                />
                              </td>
                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenStartup(st.id)}
                                  className="font-semibold text-slate-900 hover:text-blue-700 text-left block"
                                >
                                  {st.name}
                                </button>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {st.startupCode} &bull; {st.headquarters}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-medium text-slate-800">
                                  {st.sector}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <div className="font-medium text-slate-800">
                                  {st.founders[0]?.name || "N/A"}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {st.founders[0]?.email || ""}
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-medium text-slate-800">
                                  {st.pipelineStage}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                                    st.priority === "Critical" ||
                                    st.priority === "High"
                                      ? "bg-amber-100 text-amber-900"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {st.priority}
                                </span>
                              </td>
                              {showSourceCol && (
                                <td className="p-3.5 text-slate-600">
                                  {st.source}
                                </td>
                              )}
                              {showRevenueCol && (
                                <td className="p-3.5">
                                  <div>{st.funding.currentStage}</div>
                                  <div className="text-[11px] text-slate-500">
                                    {st.funding.fundingSought || "—"}
                                  </div>
                                </td>
                              )}
                              <td className="p-3.5 font-medium text-slate-800">
                                {st.assignedResearcherName || "Unassigned"}
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenStartup(st.id)}
                                    className="px-2.5 py-1 rounded bg-[#101A24] text-white font-medium"
                                  >
                                    Open
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenStartup(st.id, "research")
                                    }
                                    className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700"
                                  >
                                    Research
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* VIEW 2: KANBAN PIPELINE VIEW */}
                  {dealFlowViewMode === "kanban" && (
                    <div className="flex gap-3.5 overflow-x-auto pb-4">
                      {dbData.pipeline_stages.map((stStage) => {
                        const stageStartups = filteredStartups.filter(
                          (s) => s.pipelineStage === stStage.name
                        );
                        return (
                          <div
                            key={stStage.id}
                            className="w-72 shrink-0 bg-slate-100 border border-slate-200 rounded-lg p-3 space-y-2.5"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 px-1">
                              <span>{stStage.name}</span>
                              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">
                                {stageStartups.length}
                              </span>
                            </div>
                            <div className="space-y-2.5 min-h-[200px]">
                              {stageStartups.map((st) => (
                                <div
                                  key={st.id}
                                  className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 text-xs shadow-2xs hover:border-[#101A24]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {st.startupCode}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-mono text-[10px]">
                                      {st.priority}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenStartup(st.id)}
                                    className="font-serif text-sm font-semibold text-slate-900 hover:text-blue-700 text-left block"
                                  >
                                    {st.name}
                                  </button>
                                  <div className="text-[11px] text-slate-500">
                                    {st.sector} &bull; {st.source}
                                  </div>
                                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
                                    <span>
                                      Analyst:{" "}
                                      {st.assignedResearcherName?.split(" ")[0] ||
                                        "None"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenStartup(st.id)}
                                      className="text-blue-700 font-medium hover:underline"
                                    >
                                      Profile &rarr;
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* VIEW 3: COMPACT LIST VIEW */}
                  {dealFlowViewMode === "compact" && (
                    <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                      {filteredStartups.map((st) => (
                        <div
                          key={st.id}
                          className="px-4 py-2.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-[11px] text-slate-400">
                              {st.startupCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenStartup(st.id)}
                              className="font-semibold text-slate-900 hover:underline truncate"
                            >
                              {st.name}
                            </button>
                            <span className="text-slate-500 truncate hidden md:inline">
                              {st.sector}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                              {st.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-slate-600">
                              {st.pipelineStage}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenStartup(st.id)}
                              className="px-2.5 py-1 rounded bg-[#101A24] text-white font-medium"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Website Submissions Raw Intake Queue (Part 6) */}
                  {activeNav === "startups" && dbData.submissions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-serif text-base font-semibold text-slate-900">
                            Website Founder Submissions Intake Ledger (
                            {dbData.submissions.length})
                          </h2>
                          <p className="text-slate-500">
                            Connected live to the public founder submission form at deeveecapital.com (#pitch-form).
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {dbData.submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-4 rounded border border-slate-200 bg-slate-50/70 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded bg-[#101A24] text-[#C6AD7A] font-mono text-[10px]">
                                {sub.referenceId}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(sub.submittedAt).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <strong className="text-sm text-slate-900">
                                {sub.startupName}
                              </strong>{" "}
                              <span className="text-slate-500">
                                ({sub.sector} &bull; {sub.stage})
                              </span>
                            </div>
                            <div className="text-slate-600">
                              Founder: <strong>{sub.founderName}</strong> (
                              {sub.founderEmail})
                            </div>
                            <p className="text-slate-700 line-clamp-2">
                              {sub.description}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              <span className="text-emerald-700 font-medium">
                                ✓ Consent Recorded
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenStartup(sub.startupId)}
                                className="px-3 py-1.5 rounded bg-[#101A24] text-white font-semibold"
                              >
                                Open Linked Startup Profile &rarr;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. RESEARCH QUEUE */}
              {activeNav === "research-queue" && (
                <ResearchQueueView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={(stId) => {
                    setAssignDefaultStartupId(stId);
                    setAssignResearchOpen(true);
                  }}
                />
              )}

              {/* 4. TASKS & CALENDAR */}
              {activeNav === "tasks" && (
                <TasksAndCalendarView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  mode="tasks"
                />
              )}
              {activeNav === "calendar" && (
                <TasksAndCalendarView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  mode="calendar"
                />
              )}

              {/* 5. RESEARCH LIBRARY */}
              {activeNav === "research-library" && (
                <ResearchLibraryView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                />
              )}

              {/* 6. MARKET & COMPETITORS */}
              {activeNav === "market-research" && (
                <MarketAndCompetitorView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  mode="market"
                />
              )}
              {activeNav === "competitors" && (
                <MarketAndCompetitorView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  mode="competitors"
                />
              )}

              {/* 7. EVALUATIONS */}
              {activeNav === "evaluations" && (
                <EvaluationsDirectoryView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                />
              )}

              {/* 8. TEAM & ROLES */}
              {activeNav === "team" && (
                <TeamAndRolesView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  showPermissionsMatrix={false}
                />
              )}
              {activeNav === "roles-permissions" && (
                <TeamAndRolesView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  showPermissionsMatrix={true}
                />
              )}

              {/* 9. ANALYTICS */}
              {activeNav === "analytics" && (
                <AnalyticsAndReportsView
                  dbData={dbData}
                  currentUser={currentUser}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                />
              )}

              {/* 10. ACTIVITY LOG & SETTINGS */}
              {activeNav === "activity" && (
                <ActivityAndSettingsView
                  dbData={dbData}
                  currentUser={currentUser}
                  firebaseStatus={firebaseStatus}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  mode="activity"
                />
              )}
              {(activeNav === "settings" || activeNav === "pipeline-config") && (
                <ActivityAndSettingsView
                  dbData={dbData}
                  currentUser={currentUser}
                  firebaseStatus={firebaseStatus}
                  onRefresh={fetchWorkspaceState}
                  onSelectStartup={handleOpenStartup}
                  onOpenAssignResearch={() => setAssignResearchOpen(true)}
                  mode="settings"
                />
              )}

              {/* 11. RECRUITMENT & TALENT ASSESSMENT SYSTEM (IIM AMRITSAR) */}
              {activeNav.startsWith("rec-") && (
                <RecruitmentModuleViews
                  activeSubTab={activeNav as RecruitmentSubTab}
                  onChangeSubTab={(tab) => setActiveNav(tab)}
                  currentUserEmail={currentUser.email}
                  currentUserName={currentUser.name}
                  initialRecruitment={dbData.recruitment}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ================================================================== */}
      {/* MODALS & COMMAND PALETTE                                           */}
      {/* ================================================================== */}
      <CreateStartupModal
        open={createStartupOpen}
        onClose={() => setCreateStartupOpen(false)}
        currentUser={currentUser}
        users={dbData.users}
        sectors={dbData.workspace_settings.customSectors}
        industries={dbData.workspace_settings.customIndustries}
        stages={dbData.pipeline_stages}
        onCreated={async (newSt) => {
          await fetchWorkspaceState();
          handleOpenStartup(newSt.id);
        }}
        onInspectExisting={(stId) => handleOpenStartup(stId)}
      />

      <AssignResearchModal
        open={assignResearchOpen}
        onClose={() => setAssignResearchOpen(false)}
        startups={dbData.startups}
        defaultStartupId={assignDefaultStartupId}
        users={dbData.users}
        templates={dbData.research_templates}
        onAssigned={fetchWorkspaceState}
      />

      <CommandPaletteModal
        open={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        dbData={dbData}
        currentUser={currentUser}
        onNavigateTab={(tab) => {
          setSelectedStartupId(null);
          setActiveNav(tab);
        }}
        onSelectStartup={(stId) => handleOpenStartup(stId)}
        onOpenCreateStartup={() => setCreateStartupOpen(true)}
        onOpenAssignResearch={() => setAssignResearchOpen(true)}
      />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D151E] text-[#F7F5F0] flex items-center justify-center font-mono text-xs uppercase tracking-widest">
          Loading Deevee Capital Workspace...
        </div>
      }
    >
      <WorkspaceInner />
    </Suspense>
  );
}
