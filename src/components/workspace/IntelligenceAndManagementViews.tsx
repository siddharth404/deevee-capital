"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  CheckSquare,
  Calendar,
  BookOpen,
  Globe,
  Building2,
  Award,
  Users,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Plus,
  ExternalLink,
  Download,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Link2,
  Sliders,
} from "lucide-react";
import {
  ALL_PERMISSIONS,
  hasPermission,
  ROLE_METADATA,
} from "@/lib/workspace/permissions";
import {
  AccessScope,
  ConfidenceLevel,
  LibraryCategory,
  PermissionKey,
  PriorityLevel,
  SourceType,
  TaskStatus,
  UserRole,
  UserStatus,
  WorkspaceDatabaseSchema,
  WorkspaceUser,
} from "@/lib/workspace/types";

interface CommonViewProps {
  dbData: WorkspaceDatabaseSchema;
  currentUser: Omit<WorkspaceUser, "passwordHash">;
  onRefresh: () => Promise<void>;
  onSelectStartup: (startupId: string, tab?: string) => void;
  onOpenAssignResearch: (startupId?: string) => void;
}

// ============================================================================
// 1. RESEARCH QUEUE VIEW (Part 7.1)
// ============================================================================
export function ResearchQueueView({
  dbData,
  currentUser,
  onSelectStartup,
  onOpenAssignResearch,
}: CommonViewProps) {
  const [filterMode, setFilterMode] = useState<
    "all" | "mine" | "awaiting_review" | "approved"
  >(currentUser.role === "RESEARCH_ANALYST" ? "mine" : "all");

  const canAssign = hasPermission(currentUser as WorkspaceUser, "task.assign");

  const filteredAssignments = dbData.assignments.filter((a) => {
    if (filterMode === "mine") {
      return (
        a.primaryResearcherId === currentUser.id ||
        a.collaboratorIds.includes(currentUser.id)
      );
    }
    if (filterMode === "awaiting_review") {
      return a.status === "Submitted for Review";
    }
    if (filterMode === "approved") {
      return a.status === "Approved";
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-slate-900">
            Startup Research Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured company, founder, market, and competitor research assignments across the team.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { id: "all", label: "All Assignments" },
              { id: "mine", label: "My Research Queue" },
              { id: "awaiting_review", label: "Awaiting Review" },
              { id: "approved", label: "Approved" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterMode(f.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                filterMode === f.id
                  ? "bg-[#101A24] text-white border-[#101A24]"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
          {canAssign && (
            <button
              type="button"
              onClick={() => onOpenAssignResearch()}
              className="px-3.5 py-1.5 rounded bg-[#C6AD7A] text-[#101A24] text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Research</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
            No research assignments match the current filter.
          </div>
        ) : (
          filteredAssignments.map((asgn) => {
            const doneCount = asgn.checklist.filter((c) => c.completed).length;
            const totalCount = asgn.checklist.length || 1;
            const pct = Math.round((doneCount / totalCount) * 100);
            const researchDoc = dbData.research.find(
              (r) => r.startupId === asgn.startupId
            );

            return (
              <div
                key={asgn.id}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {asgn.startupCode}
                    </span>
                    <h3 className="font-serif text-base font-semibold text-slate-900">
                      {asgn.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                        asgn.status === "Approved"
                          ? "bg-emerald-100 text-emerald-900"
                          : asgn.status === "Submitted for Review"
                            ? "bg-purple-100 text-purple-900"
                            : asgn.status === "Revision Requested"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-sky-100 text-sky-900"
                      }`}
                    >
                      {asgn.status}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      Priority: {asgn.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{asgn.objectives}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                    <span>
                      Primary Researcher:{" "}
                      <strong className="text-slate-800">
                        {asgn.primaryResearcherName}
                      </strong>
                    </span>
                    {asgn.collaboratorNames.length > 0 && (
                      <span>
                        Collaborators: {asgn.collaboratorNames.join(", ")}
                      </span>
                    )}
                    <span>
                      Reviewer:{" "}
                      <strong className="text-slate-800">
                        {asgn.reviewerName}
                      </strong>
                    </span>
                    <span>
                      Due: {new Date(asgn.dueDate).toLocaleDateString()}
                    </span>
                    <span>Version: v{researchDoc?.version || 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-36">
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Checklist</span>
                      <span className="font-mono">
                        {doneCount}/{asgn.checklist.length} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#101A24]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectStartup(asgn.startupId, "research")}
                    className="px-4 py-2 rounded bg-[#101A24] text-[#F7F5F0] text-xs font-semibold hover:bg-slate-800"
                  >
                    Open Research Workspace &rarr;
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. TASKS & CALENDAR VIEW (Part 8)
// ============================================================================
export function TasksAndCalendarView({
  dbData,
  currentUser,
  onRefresh,
  onSelectStartup,
  mode = "tasks",
}: CommonViewProps & { mode?: "tasks" | "calendar" }) {
  const [taskScope, setTaskScope] = useState<"mine" | "team">(
    currentUser.role === "RESEARCH_ANALYST" ? "mine" : "team"
  );
  const [title, setTitle] = useState("");
  const [startupId, setStartupId] = useState("");
  const [assignedToId, setAssignedToId] = useState(currentUser.id);
  const [priority, setPriority] = useState<PriorityLevel>("High");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const visibleTasks = dbData.tasks.filter((t) =>
    taskScope === "mine" ? t.assignedToId === currentUser.id : true
  );

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/workspace/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "task.create",
        title,
        startupId: startupId || null,
        assignedToId,
        priority,
        dueDate: new Date(dueDate).toISOString(),
      }),
    });
    setTitle("");
    await onRefresh();
  };

  if (mode === "calendar") {
    // Combine startup follow-ups, research due dates, and task due dates
    const events = [
      ...dbData.startups
        .filter((s) => s.nextFollowUpAt)
        .map((s) => ({
          id: `fu-${s.id}`,
          date: s.nextFollowUpAt!,
          type: "Founder Follow-Up",
          title: `Follow up with ${s.name} (${s.pipelineStage})`,
          owner: s.assignedLeadName || "Investment Team",
          startupId: s.id,
        })),
      ...dbData.assignments.map((a) => ({
        id: `asgn-${a.id}`,
        date: a.dueDate,
        type: "Research Deadline",
        title: a.title,
        owner: a.primaryResearcherName,
        startupId: a.startupId,
      })),
      ...dbData.tasks
        .filter((t) => t.status !== "Completed")
        .map((t) => ({
          id: `tsk-${t.id}`,
          date: t.dueDate,
          type: "Task Due",
          title: t.title,
          owner: t.assignedToName,
          startupId: t.startupId || undefined,
        })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h1 className="text-xl font-serif font-semibold text-slate-900">
            Operational Schedule &amp; Follow-Up Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated timeline of founder discussions, follow-up reminders, research deadlines, and team tasks.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1.5 rounded bg-[#101A24] text-[#C6AD7A] font-mono text-center min-w-[85px]">
                  {new Date(ev.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] mr-2">
                    {ev.type}
                  </span>
                  <strong className="text-slate-900">{ev.title}</strong>
                  <div className="text-slate-500 mt-0.5">Owner: {ev.owner}</div>
                </div>
              </div>
              {ev.startupId && (
                <button
                  type="button"
                  onClick={() => onSelectStartup(ev.startupId!)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Open Startup &rarr;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-slate-900">
            Task Management ({visibleTasks.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track execution across startup diligence, founder outreach, and research deliverables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTaskScope("mine")}
            className={`px-3 py-1.5 rounded text-xs font-medium border ${
              taskScope === "mine"
                ? "bg-[#101A24] text-white border-[#101A24]"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            My Tasks
          </button>
          <button
            type="button"
            onClick={() => setTaskScope("team")}
            className={`px-3 py-1.5 rounded text-xs font-medium border ${
              taskScope === "team"
                ? "bg-[#101A24] text-white border-[#101A24]"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            Team Tasks
          </button>
        </div>
      </div>

      {/* Quick Create Task Bar */}
      <form
        onSubmit={handleAddTask}
        className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-6 gap-2.5 text-xs"
      >
        <input
          type="text"
          required
          placeholder="New task title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="sm:col-span-2 px-3 py-2 rounded border border-slate-300"
        />
        <select
          value={startupId}
          onChange={(e) => setStartupId(e.target.value)}
          className="px-2.5 py-2 rounded border border-slate-300 bg-white"
        >
          <option value="">General Workspace Task</option>
          {dbData.startups.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
          className="px-2.5 py-2 rounded border border-slate-300 bg-white"
        >
          {dbData.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-2.5 py-2 rounded border border-slate-300"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-[#101A24] text-white font-semibold"
        >
          + Create Task
        </button>
      </form>

      {/* 5-Status Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {(
          ["To Do", "In Progress", "In Review", "Completed", "Blocked"] as TaskStatus[]
        ).map((statusCol) => {
          const colTasks = visibleTasks.filter((t) => t.status === statusCol);
          return (
            <div
              key={statusCol}
              className="bg-slate-100/80 border border-slate-200 rounded-lg p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                <span>{statusCol}</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-slate-200 rounded p-3 space-y-2 text-xs shadow-2xs"
                  >
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    {t.startupName && (
                      <button
                        type="button"
                        onClick={() => t.startupId && onSelectStartup(t.startupId)}
                        className="text-[11px] text-blue-700 hover:underline block"
                      >
                        Startup: {t.startupName}
                      </button>
                    )}
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{t.assignedToName}</span>
                      <span>{new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                    <select
                      value={t.status}
                      onChange={async (e) => {
                        await fetch("/api/workspace/state", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "task.update",
                            taskId: t.id,
                            status: e.target.value,
                          }),
                        });
                        await onRefresh();
                      }}
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px]"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 3. RESEARCH LIBRARY VIEW (Part 13)
// ============================================================================
export function ResearchLibraryView({
  dbData,
  currentUser,
  onRefresh,
  onSelectStartup,
}: CommonViewProps) {
  const [catFilter, setCatFilter] = useState<string>("All");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<LibraryCategory>("Industries");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [relatedStartupId, setRelatedStartupId] = useState("");
  const [tagsText, setTagsText] = useState("");

  const categories: LibraryCategory[] = [
    "Startups",
    "Founders",
    "Industries",
    "Competitors",
    "Markets",
    "Emerging Business Models",
    "Investment Themes",
    "Events & Incubators",
  ];

  const entries = dbData.research_library.filter(
    (e) => catFilter === "All" || e.category === catFilter
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/workspace/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "library.create",
        title,
        category,
        summary,
        notes,
        sourceUrls:
          sourceTitle && sourceUrl
            ? [
                {
                  title: sourceTitle,
                  url: sourceUrl.startsWith("http")
                    ? sourceUrl
                    : `https://${sourceUrl}`,
                  sourceType: "Database",
                  confidenceLevel: "High Confidence",
                },
              ]
            : [],
        relatedStartupIds: relatedStartupId ? [relatedStartupId] : [],
        tags: tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    setTitle("");
    setSummary("");
    setNotes("");
    setSourceTitle("");
    setSourceUrl("");
    setTagsText("");
    await onRefresh();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-slate-900">
            Central Research Library ({entries.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent repository for industries, markets, emerging business models, investment themes, and pre-pipeline startups.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded text-xs border ${
                catFilter === c
                  ? "bg-[#101A24] text-white border-[#101A24]"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Create New Library Entry */}
      {hasPermission(currentUser as WorkspaceUser, "research.create") && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs"
        >
          <h3 className="font-mono uppercase tracking-wider text-slate-500">
            + Publish New Research Record to Library
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Research Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as LibraryCategory)}
              className="px-3 py-2 rounded border border-slate-300 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={relatedStartupId}
              onChange={(e) => setRelatedStartupId(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300 bg-white"
            >
              <option value="">Link to Startup (Optional)...</option>
              {dbData.startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startupCode})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <textarea
              rows={2}
              placeholder="Executive Summary *"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <textarea
              rows={2}
              placeholder="Detailed Analyst Notes & Findings"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Primary Source Title"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <input
              type="text"
              placeholder="Primary Source URL"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#101A24] text-white font-semibold"
            >
              Save to Research Library
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-[#101A24] text-[#C6AD7A] font-mono text-[10px] uppercase">
                {entry.category}
              </span>
              <span className="text-slate-400">
                By {entry.authorName} &bull;{" "}
                {new Date(entry.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-serif text-base font-semibold text-slate-900">
              {entry.title}
            </h3>
            <p className="text-slate-700 leading-relaxed">{entry.summary}</p>
            {entry.notes && (
              <p className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                {entry.notes}
              </p>
            )}
            {entry.sourceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.sourceUrls.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline inline-flex items-center gap-1"
                  >
                    <span>{s.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex flex-wrap gap-1.5">
                {entry.relatedStartupNames.map((name, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const stId = entry.relatedStartupIds[idx];
                      if (stId) onSelectStartup(stId);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium"
                  >
                    Linked: {name}
                  </button>
                ))}
              </div>
              <select
                defaultValue=""
                onChange={async (e) => {
                  if (!e.target.value) return;
                  await fetch("/api/workspace/state", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "library.link_startup",
                      libraryId: entry.id,
                      startupId: e.target.value,
                    }),
                  });
                  await onRefresh();
                }}
                className="px-2 py-1 rounded border border-slate-200 text-[11px] bg-white"
              >
                <option value="">+ Link to Startup...</option>
                {dbData.startups.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 4. MARKET & COMPETITOR INTELLIGENCE VIEW
// ============================================================================
export function MarketAndCompetitorView({
  dbData,
  onSelectStartup,
  mode = "market",
}: CommonViewProps & { mode?: "market" | "competitors" }) {
  if (mode === "competitors") {
    return (
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h1 className="text-xl font-serif font-semibold text-slate-900">
            Cross-Portfolio Competitor Database ({dbData.competitors.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized competitive intelligence mapped across evaluated startups.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500">
              <tr>
                <th className="p-3.5">Competitor</th>
                <th className="p-3.5">Geography</th>
                <th className="p-3.5">Target Startup</th>
                <th className="p-3.5">Product &amp; Pricing</th>
                <th className="p-3.5">Differentiation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbData.competitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No competitors added yet. Open any startup&apos;s Competitors tab to add records.
                  </td>
                </tr>
              ) : (
                dbData.competitors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-semibold text-slate-900">{c.name}</td>
                    <td className="p-3.5">{c.geography}</td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => onSelectStartup(c.startupId, "competitors")}
                        className="text-blue-700 hover:underline font-medium"
                      >
                        {c.startupName}
                      </button>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {c.product} {c.pricing ? `(${c.pricing})` : ""}
                    </td>
                    <td className="p-3.5 text-slate-700">{c.differentiation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h1 className="text-xl font-serif font-semibold text-slate-900">
          Market Sizing &amp; Verified Citation Repository ({dbData.research_sources.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          All TAM/SAM/SOM calculations and verified evidence citations across active startup research.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbData.research.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <strong className="text-sm text-slate-900">{r.startupName}</strong>
              <button
                type="button"
                onClick={() => onSelectStartup(r.startupId, "market")}
                className="text-blue-700 hover:underline"
              >
                Edit Market Sizing &rarr;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">TAM</span>
                <strong>{r.marketResearch.tam || "Pending"}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">SAM</span>
                <strong>{r.marketResearch.sam || "Pending"}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">Source</span>
                <span className="truncate block">
                  {r.marketResearch.tamSource || "Unverified"}
                </span>
              </div>
            </div>
            {r.marketResearch.tamMethodology && (
              <p className="text-slate-600">
                <strong>Methodology:</strong> {r.marketResearch.tamMethodology}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 5. EVALUATIONS DIRECTORY VIEW (Part 10)
// ============================================================================
export function EvaluationsDirectoryView({
  dbData,
  onSelectStartup,
}: CommonViewProps) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h1 className="text-xl font-serif font-semibold text-slate-900">
          Investment Evaluations, Scorecards &amp; Decision Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Sector-agnostic 10-dimension scorecards and official human investment decisions.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500">
            <tr>
              <th className="p-3.5">Startup</th>
              <th className="p-3.5">Sector</th>
              <th className="p-3.5">Current Stage</th>
              <th className="p-3.5">Evaluations Submitted</th>
              <th className="p-3.5">Avg Weighted Score</th>
              <th className="p-3.5">Latest Official Decision</th>
              <th className="p-3.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dbData.startups.map((st) => {
              const stEvals = dbData.evaluations.filter(
                (e) => e.startupId === st.id
              );
              const avgScore =
                stEvals.length > 0
                  ? (
                      stEvals.reduce((acc, e) => acc + e.weightedScore, 0) /
                      stEvals.length
                    ).toFixed(2)
                  : "—";

              return (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-semibold text-slate-900">
                    {st.name}{" "}
                    <span className="font-mono text-[11px] text-slate-400">
                      ({st.startupCode})
                    </span>
                  </td>
                  <td className="p-3.5">{st.sector}</td>
                  <td className="p-3.5">{st.pipelineStage}</td>
                  <td className="p-3.5">{stEvals.length} reviewer(s)</td>
                  <td className="p-3.5 font-serif text-sm font-bold text-[#101A24]">
                    {avgScore !== "—" ? `${avgScore} / 5.00` : "Not scored"}
                  </td>
                  <td className="p-3.5">
                    {st.latestDecision ? (
                      <div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px]">
                          {st.latestDecision.outcome}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          by {st.latestDecision.decidedByName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Awaiting Decision</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <button
                      type="button"
                      onClick={() => onSelectStartup(st.id, "evaluation")}
                      className="px-3 py-1.5 rounded bg-[#101A24] text-white font-medium"
                    >
                      Scorecard &amp; Decide &rarr;
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 6. TEAM, INVITATIONS & ROLE PERMISSIONS VIEW (Part 9 & Workflow E)
// ============================================================================
export function TeamAndRolesView({
  dbData,
  currentUser,
  onRefresh,
  showPermissionsMatrix = false,
}: CommonViewProps & { showPermissionsMatrix?: boolean }) {
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("RESEARCH_ANALYST");
  const [inviteScope, setInviteScope] = useState<AccessScope>("assigned");
  const [lastCreatedCode, setLastCreatedCode] = useState("");
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] =
    useState<UserRole>("RESEARCH_ANALYST");

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/workspace/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "user.invite",
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        accessScope: inviteScope,
      }),
    });
    const data = await res.json();
    if (res.ok && data.invitation) {
      setLastCreatedCode(data.invitation.inviteCode);
      setInviteName("");
      setInviteEmail("");
      await onRefresh();
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h1 className="text-xl font-serif font-semibold text-slate-900">
          {showPermissionsMatrix
            ? "User Roles & Granular Permission Templates"
            : "Team Directory, Onboarding Invitations & Access Scopes"}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enforces backend role-based and permission-based access control across all 5 roles.
        </p>
      </div>

      {/* Invite New Team Member Form (Workflow E) */}
      {isSuperAdmin && (
        <form
          onSubmit={handleInvite}
          className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-mono uppercase tracking-wider text-slate-500">
              + Invite New Team Member or Research Intern (Workflow E)
            </h3>
            {lastCreatedCode && (
              <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-900 font-mono font-semibold">
                Invitation Created! Code: {lastCreatedCode} (Use on Sign-In screen &rarr; Accept Invitation)
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              required
              placeholder="Full Name *"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <input
              type="email"
              required
              placeholder="Work Email *"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="px-3 py-2 rounded border border-slate-300 bg-white"
            >
              <option value="RESEARCH_ANALYST">
                Research Analyst / Intern
              </option>
              <option value="INVESTMENT_LEAD">Investment Lead</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="VIEWER">Viewer</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <select
              value={inviteScope}
              onChange={(e) => setInviteScope(e.target.value as AccessScope)}
              className="px-3 py-2 rounded border border-slate-300 bg-white"
            >
              <option value="assigned">Scope: Assigned Records Only</option>
              <option value="all">Scope: All Startup Records</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#101A24] text-white font-semibold"
            >
              Send Invitation
            </button>
          </div>
        </form>
      )}

      {/* Pending Invitations */}
      {dbData.invitations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-2.5 text-xs">
          <h3 className="font-mono uppercase tracking-wider text-slate-400 text-[10px]">
            Pending &amp; Recent Invitations ({dbData.invitations.length})
          </h3>
          {dbData.invitations.map((inv) => (
            <div
              key={inv.id}
              className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
            >
              <div>
                <strong className="text-slate-900">{inv.name}</strong> ({inv.email})
                &bull; Role: <strong>{inv.role}</strong> &bull; Scope:{" "}
                {inv.accessScope}
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-[#101A24] text-[#C6AD7A] font-mono">
                  Code: {inv.inviteCode}
                </span>
                <span className="uppercase font-mono text-[10px] text-slate-500">
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Members Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500">
            <tr>
              <th className="p-3.5">Member</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Access Scope</th>
              <th className="p-3.5">Assigned Workload</th>
              <th className="p-3.5">Last Login</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dbData.users.map((u) => {
              const assignedStartups = dbData.startups.filter(
                (s) =>
                  s.assignedResearcherId === u.id || s.assignedLeadId === u.id
              ).length;
              const openTasks = dbData.tasks.filter(
                (t) => t.assignedToId === u.id && t.status !== "Completed"
              ).length;

              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-3.5">
                    {isSuperAdmin ? (
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          await fetch("/api/workspace/state", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "user.update_role_or_status",
                              targetUserId: u.id,
                              role: e.target.value,
                            }),
                          });
                          await onRefresh();
                        }}
                        className="px-2 py-1 rounded border border-slate-300 bg-white font-medium"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="INVESTMENT_LEAD">INVESTMENT_LEAD</option>
                        <option value="RESEARCH_ANALYST">RESEARCH_ANALYST</option>
                        <option value="REVIEWER">REVIEWER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    ) : (
                      <span className="font-mono">{u.role}</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {isSuperAdmin ? (
                      <select
                        value={u.accessScope}
                        onChange={async (e) => {
                          await fetch("/api/workspace/state", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "user.update_role_or_status",
                              targetUserId: u.id,
                              accessScope: e.target.value,
                            }),
                          });
                          await onRefresh();
                        }}
                        className="px-2 py-1 rounded border border-slate-300 bg-white"
                      >
                        <option value="assigned">Assigned Only</option>
                        <option value="all">All Startups</option>
                      </select>
                    ) : (
                      <span>{u.accessScope}</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {assignedStartups} startups &bull; {openTasks} open tasks
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="p-3.5">
                    {isSuperAdmin && u.id !== currentUser.id ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch("/api/workspace/state", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "user.update_role_or_status",
                              targetUserId: u.id,
                              status:
                                u.status === "active"
                                  ? "deactivated"
                                  : "active",
                            }),
                          });
                          await onRefresh();
                        }}
                        className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase ${
                          u.status === "active"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {u.status} (Click to Toggle)
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] uppercase">
                        {u.status}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Template Permission Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-semibold text-slate-900">
              Granular Role Permission Template Configurator
            </h3>
            <p className="text-slate-500">
              Inspect or customize the 23 backend permission keys assigned to each role template.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {(
              [
                "SUPER_ADMIN",
                "INVESTMENT_LEAD",
                "RESEARCH_ANALYST",
                "REVIEWER",
                "VIEWER",
              ] as UserRole[]
            ).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRoleForMatrix(r)}
                className={`px-2.5 py-1.5 rounded font-mono text-[11px] border ${
                  selectedRoleForMatrix === r
                    ? "bg-[#101A24] text-white border-[#101A24]"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                {ROLE_METADATA[r].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ALL_PERMISSIONS.map((perm) => {
            const rolePerms =
              dbData.workspace_settings.roleTemplates[selectedRoleForMatrix] ||
              [];
            const enabled =
              selectedRoleForMatrix === "SUPER_ADMIN" ||
              rolePerms.includes(perm.key);

            return (
              <label
                key={perm.key}
                className={`p-3 rounded border flex items-start gap-2.5 ${
                  enabled
                    ? "bg-slate-50 border-slate-300"
                    : "bg-white border-slate-200 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!isSuperAdmin || selectedRoleForMatrix === "SUPER_ADMIN"}
                  checked={enabled}
                  onChange={async () => {
                    const nextPerms = enabled
                      ? rolePerms.filter((k) => k !== perm.key)
                      : [...rolePerms, perm.key];
                    await fetch("/api/workspace/state", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "settings.update",
                        settings: {
                          roleTemplates: {
                            ...dbData.workspace_settings.roleTemplates,
                            [selectedRoleForMatrix]: nextPerms,
                          },
                        },
                      }),
                    });
                    await onRefresh();
                  }}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-mono text-[11px] font-semibold text-slate-900">
                    {perm.key}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {perm.description}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. ANALYTICS & REPORTING VIEW (Part 11)
// ============================================================================
export function AnalyticsAndReportsView({
  dbData,
  currentUser,
}: CommonViewProps) {
  const canExport = hasPermission(currentUser as WorkspaceUser, "data.export");

  const totalStartups = dbData.startups.length;
  const websiteSubmissionsCount = dbData.startups.filter(
    (s) => s.source === "Website Submission"
  ).length;
  const discoveredCount = totalStartups - websiteSubmissionsCount;

  // Group by Sector (descriptive only, never evaluative)
  const sectorCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  for (const s of dbData.startups) {
    sectorCounts[s.sector] = (sectorCounts[s.sector] || 0) + 1;
    sourceCounts[s.source] = (sourceCounts[s.source] || 0) + 1;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-slate-900">
            Deal Flow, Research Productivity &amp; Pipeline Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            All metrics are computed live from workspace records. Sector distribution is strictly descriptive.
          </p>
        </div>
        {canExport ? (
          <a
            href="/api/workspace/export?type=csv"
            className="px-4 py-2 rounded bg-[#101A24] text-[#F7F5F0] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#C6AD7A]" />
            <span>Export Authorised Startups (CSV)</span>
          </a>
        ) : (
          <span className="px-3 py-1.5 rounded bg-slate-100 text-slate-500 text-xs flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>CSV Database Export Restricted to Leads &amp; Admins</span>
          </span>
        )}
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Total Startups Received (Website)
          </span>
          <div className="text-2xl font-serif font-bold text-slate-900 mt-1">
            {websiteSubmissionsCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Independently Discovered
          </span>
          <div className="text-2xl font-serif font-bold text-slate-900 mt-1">
            {discoveredCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Verified Citations Logged
          </span>
          <div className="text-2xl font-serif font-bold text-slate-900 mt-1">
            {dbData.research_sources.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Scorecard Evaluations
          </span>
          <div className="text-2xl font-serif font-bold text-slate-900 mt-1">
            {dbData.evaluations.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sector Distribution (Descriptive Only) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
          <h3 className="font-serif text-base font-semibold text-slate-900">
            Descriptive Sector Distribution (Sector-Agnostic Mandate)
          </h3>
          {Object.entries(sectorCounts).map(([sec, count]) => (
            <div key={sec} className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-800">{sec}</span>
                <span className="font-mono text-slate-600">{count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#101A24]"
                  style={{
                    width: `${Math.max(10, Math.round((count / Math.max(1, totalStartups)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Source Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
          <h3 className="font-serif text-base font-semibold text-slate-900">
            Source-Wise Opportunity Distribution
          </h3>
          {Object.entries(sourceCounts).map(([src, count]) => (
            <div key={src} className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-800">{src}</span>
                <span className="font-mono text-slate-600">{count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#C6AD7A]"
                  style={{
                    width: `${Math.max(10, Math.round((count / Math.max(1, totalStartups)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. ACTIVITY LOG, AUDIT TRAIL & SETTINGS VIEW (Part 16 & 17)
// ============================================================================
export function ActivityAndSettingsView({
  dbData,
  currentUser,
  firebaseStatus,
  onRefresh,
  mode = "activity",
}: CommonViewProps & {
  firebaseStatus?: {
    mode: string;
    projectId: string;
    missingItems: string[];
  };
  mode?: "activity" | "settings" | "pipeline";
}) {
  const [newStageName, setNewStageName] = useState("");
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  if (mode === "activity") {
    return (
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h1 className="text-xl font-serif font-semibold text-slate-900">
            Immutable Activity Log &amp; Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only chronological record of all startup changes, assignments, reviews, role updates, and investment decisions. Ordinary users cannot edit or delete audit logs.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Change Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbData.activity_logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-medium text-slate-900">
                    {log.actorName}{" "}
                    <span className="text-[10px] font-mono text-slate-400">
                      ({log.actorRole})
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">
                    {log.entityName}
                  </td>
                  <td className="p-3.5 text-slate-700">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h1 className="text-xl font-serif font-semibold text-slate-900">
          Workspace Settings, Pipeline Stages &amp; Infrastructure Diagnostics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Deevee Capital pipeline stages, scorecard weights, and inspect Firebase Cloud status.
        </p>
      </div>

      {/* Firebase Cloud & Infrastructure Diagnostics Card */}
      {firebaseStatus && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-slate-900">
              Firebase &amp; Database Persistence Status (Project:{" "}
              {firebaseStatus.projectId})
            </h3>
            <span className="px-2.5 py-1 rounded bg-[#101A24] text-[#C6AD7A] font-mono text-[11px]">
              Mode: {firebaseStatus.mode}
            </span>
          </div>
          <p className="text-slate-600">
            Security rules are authored in{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded">
              firestore.rules
            </code>{" "}
            and{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded">
              storage.rules
            </code>{" "}
            with composite indexes in{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded">
              firestore.indexes.json
            </code>
            .
          </p>
          {firebaseStatus.missingItems.length > 0 && (
            <div className="p-3.5 rounded bg-amber-50 border border-amber-200 space-y-1.5 text-amber-900">
              <strong className="block">
                To switch from Sovereign Local Store (data/workspace/db.json) to Remote Cloud Firestore on GCP:
              </strong>
              <ul className="list-disc pl-5 space-y-1">
                {firebaseStatus.missingItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Configurable Pipeline Stages */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
        <h3 className="font-serif text-base font-semibold text-slate-900">
          Pipeline Stages Configuration ({dbData.pipeline_stages.length} Stages)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {dbData.pipeline_stages.map((st) => (
            <div
              key={st.id}
              className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between"
            >
              <div>
                <span className="font-mono text-[10px] text-slate-400 mr-2">
                  #{st.order}
                </span>
                <strong className="text-slate-900">{st.name}</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {st.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isSuperAdmin && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newStageName.trim()) return;
              const nextOrder = dbData.pipeline_stages.length + 1;
              const updated = [
                ...dbData.pipeline_stages,
                {
                  id: `stage-${Date.now().toString(36)}`,
                  name: newStageName.trim(),
                  slug: newStageName.trim().toLowerCase().replace(/\s+/g, "-"),
                  order: nextOrder,
                  color: "#101A24",
                  description: "Custom configured pipeline stage",
                  isTerminal: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ];
              await fetch("/api/workspace/state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "settings.update",
                  pipelineStages: updated,
                }),
              });
              setNewStageName("");
              await onRefresh();
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-200"
          >
            <input
              type="text"
              placeholder="New Pipeline Stage Name..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#101A24] text-white font-semibold"
            >
              + Add Pipeline Stage
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
