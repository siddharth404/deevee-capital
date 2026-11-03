"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Search,
  AlertTriangle,
  Plus,
  Building2,
  ClipboardList,
  CheckSquare,
  BookOpen,
  ArrowRight,
  GitMerge,
  Sparkles,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { DuplicateMatch } from "@/lib/workspace/db";
import { hasPermission } from "@/lib/workspace/permissions";
import {
  PipelineStageConfig,
  PriorityLevel,
  ResearchTemplate,
  StartupRecord,
  StartupSource,
  WorkspaceDatabaseSchema,
  WorkspaceUser,
} from "@/lib/workspace/types";

const STARTUP_SOURCES: StartupSource[] = [
  "Website Submission",
  "Intern Research",
  "Founder Referral",
  "Investor Referral",
  "LinkedIn",
  "Startup Database",
  "Incubator / Accelerator",
  "Events",
  "Direct Outreach",
  "Other",
];

// ============================================================================
// 1. CREATE STARTUP MODAL WITH DUPLICATE DETECTION & MERGE
// ============================================================================
interface CreateStartupModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: Omit<WorkspaceUser, "passwordHash">;
  users: Array<Omit<WorkspaceUser, "passwordHash">>;
  sectors: string[];
  industries: string[];
  stages: PipelineStageConfig[];
  onCreated: (startup: StartupRecord) => void;
  onInspectExisting: (startupId: string) => void;
}

export function CreateStartupModal({
  open,
  onClose,
  currentUser,
  users,
  sectors,
  industries,
  stages,
  onCreated,
  onInspectExisting,
}: CreateStartupModalProps) {
  const isIntern = currentUser.role === "RESEARCH_ANALYST";

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [sector, setSector] = useState(sectors[0] || "Technology & Software");
  const [customSector, setCustomSector] = useState("");
  const [industry, setIndustry] = useState("");
  const [vertical, setVertical] = useState("");
  const [headquarters, setHeadquarters] = useState("Bengaluru, India");
  const [yearFounded, setYearFounded] = useState("2025");
  const [incorporationStatus, setIncorporationStatus] = useState("Private Limited");
  const [description, setDescription] = useState("");
  const [founderName, setFounderName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  const [founderPhone, setFounderPhone] = useState("");
  const [founderLinkedin, setFounderLinkedin] = useState("");
  const [founderBackground, setFounderBackground] = useState("");
  const [problemAddressed, setProblemAddressed] = useState("");
  const [productService, setProductService] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [targetCustomers, setTargetCustomers] = useState("");
  const [currentRevenue, setCurrentRevenue] = useState("");
  const [payingCustomers, setPayingCustomers] = useState("");
  const [fundingStage, setFundingStage] = useState("Pre-Seed");
  const [fundingSought, setFundingSought] = useState("₹50 Lakhs - ₹1 Crore");
  const [source, setSource] = useState<StartupSource>(
    isIntern ? "Intern Research" : "Direct Outreach"
  );
  const [priority, setPriority] = useState<PriorityLevel>("High");
  const [pipelineStage, setPipelineStage] = useState(
    isIntern ? "Research in Progress" : "Initial Screening"
  );
  const [assignedResearcherId, setAssignedResearcherId] = useState(
    isIntern ? currentUser.id : "user-ananya"
  );
  const [tagsText, setTagsText] = useState("");

  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [checkingDup, setCheckingDup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      if (name.trim().length < 2 && !website.trim() && !founderEmail.trim()) {
        setDuplicateMatches([]);
        return;
      }
      setCheckingDup(true);
      try {
        const res = await fetch("/api/workspace/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "startup.check_duplicates",
            name,
            website,
            founderEmail,
          }),
        });
        const data = await res.json();
        if (data.ok && Array.isArray(data.matches)) {
          setDuplicateMatches(data.matches);
        }
      } catch {
        // Ignore transient check errors
      } finally {
        setCheckingDup(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [name, website, founderEmail, open]);

  if (!open) return null;

  const handleSubmit = async (allowDuplicate = false) => {
    setError("");
    setSubmitting(true);
    try {
      const finalSector =
        sector === "__custom__" ? customSector.trim() : sector;
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "startup.create",
          allowDuplicate,
          name,
          website,
          sector: finalSector,
          industry: industry || finalSector,
          vertical,
          headquarters,
          yearFounded,
          incorporationStatus,
          description,
          founderName,
          founderEmail,
          founderPhone,
          founderLinkedin,
          founderBackground,
          problemAddressed,
          productService,
          businessModel,
          targetCustomers,
          currentRevenue,
          payingCustomers,
          fundingStage,
          fundingSought,
          source: isIntern ? "Intern Research" : source,
          priority,
          pipelineStage,
          assignedResearcherId,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.matches) {
        setDuplicateMatches(data.matches);
        setError(data.message);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.message || "Could not create startup.");
        return;
      }
      onCreated(data.startup);
      onClose();
    } catch {
      setError("Network error while creating startup.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-[#101A24] text-[#F7F5F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#C6AD7A]" />
            <div>
              <h2 className="font-serif text-lg font-semibold">
                Add Startup Opportunity
              </h2>
              <p className="text-[11px] text-slate-300">
                Sector-agnostic deal flow entry &bull; Automatic duplicate detection active
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}

          {/* Live Duplicate Warning Banner */}
          {duplicateMatches.length > 0 && (
            <div className="p-4 rounded-md bg-amber-50 border border-amber-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    Possible Duplicate Record Detected ({duplicateMatches.length})
                  </span>
                </div>
                {checkingDup && (
                  <span className="text-[11px] text-amber-700">Checking...</span>
                )}
              </div>
              <p className="text-xs text-amber-800">
                To prevent duplicate records or overwriting existing founder data, review the matching startup below:
              </p>
              <div className="space-y-2">
                {duplicateMatches.map((m) => (
                  <div
                    key={m.startupId}
                    className="p-2.5 rounded bg-white border border-amber-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {m.name}{" "}
                        <span className="font-mono text-[11px] text-slate-500">
                          ({m.startupCode})
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Stage: <strong>{m.pipelineStage}</strong> &bull; Source:{" "}
                        {m.source} &bull; {m.matchReasons.join(", ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onInspectExisting(m.startupId);
                        }}
                        className="px-2.5 py-1.5 rounded bg-[#101A24] text-white text-xs font-medium hover:bg-slate-800"
                      >
                        Inspect Existing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Basic Company Info */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              1. Company &amp; Classification (Sector-Agnostic)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Startup Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., KrishiCold Logistics"
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Website / Product Link
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.in"
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Headquarters
                </label>
                <input
                  type="text"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Sector * (Classification only)
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__custom__">+ Enter New Custom Sector...</option>
                </select>
                {sector === "__custom__" && (
                  <input
                    type="text"
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    placeholder="Type new sector name..."
                    className="w-full mt-2 px-3 py-1.5 rounded border border-amber-400 text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Industry / Sub-Sector (Flexible)
                </label>
                <input
                  type="text"
                  list="dvc-industries-list"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Type or select any industry"
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
                <datalist id="dvc-industries-list">
                  {industries.map((ind) => (
                    <option key={ind} value={ind} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specific Vertical / Year Founded
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value)}
                    placeholder="Vertical"
                    className="w-full px-2.5 py-2 rounded border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    value={yearFounded}
                    onChange={(e) => setYearFounded(e.target.value)}
                    placeholder="2025"
                    className="w-full px-2.5 py-2 rounded border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Founder Info */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              2. Primary Founder Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Founder Name *
                </label>
                <input
                  type="text"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Founder Email
                </label>
                <input
                  type="email"
                  value={founderEmail}
                  onChange={(e) => setFounderEmail(e.target.value)}
                  placeholder="founder@startup.in"
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={founderPhone}
                  onChange={(e) => setFounderPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={founderLinkedin}
                  onChange={(e) => setFounderLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/..."
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Business, Traction & Funding */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              3. Business Overview, Optional Traction &amp; Funding
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Company &amp; Problem Description *
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What customer problem is the startup solving and how does its product/service work?"
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Funding Stage
                  </label>
                  <select
                    value={fundingStage}
                    onChange={(e) => setFundingStage(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
                  >
                    <option value="Idea / Concept Stage">Idea / Concept Stage</option>
                    <option value="Prototype / MVP Built">Prototype / MVP Built</option>
                    <option value="Early Traction / Pilot Customers">Early Traction / Pilot</option>
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Funding Sought
                  </label>
                  <input
                    type="text"
                    value={fundingSought}
                    onChange={(e) => setFundingSought(e.target.value)}
                    placeholder="e.g., ₹75 Lakhs"
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current Revenue (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentRevenue}
                    onChange={(e) => setCurrentRevenue(e.target.value)}
                    placeholder="Pre-revenue or ₹X/mo"
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Customers / Pilots (Optional)
                  </label>
                  <input
                    type="text"
                    value={payingCustomers}
                    onChange={(e) => setPayingCustomers(e.target.value)}
                    placeholder="e.g., 4 enterprise pilots"
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Internal Pipeline & Source Tracking */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              4. Source &amp; Pipeline Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Opportunity Source *
                </label>
                <select
                  disabled={isIntern}
                  value={isIntern ? "Intern Research" : source}
                  onChange={(e) => setSource(e.target.value as StartupSource)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white disabled:bg-slate-100"
                >
                  {STARTUP_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pipeline Stage
                </label>
                <select
                  disabled={isIntern}
                  value={pipelineStage}
                  onChange={(e) => setPipelineStage(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white disabled:bg-slate-100"
                >
                  {stages.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Researcher
                </label>
                <select
                  disabled={isIntern}
                  value={assignedResearcherId}
                  onChange={(e) => setAssignedResearcherId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white disabled:bg-slate-100"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2.5">
            {duplicateMatches.length > 0 && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="px-4 py-2 rounded border border-amber-600 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100"
              >
                Create Separate Record Anyway
              </button>
            )}
            <button
              type="button"
              disabled={submitting || name.trim().length < 2}
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 rounded bg-[#101A24] text-[#F7F5F0] text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C6AD7A]" />
              <span>{submitting ? "Creating..." : "Create Startup Record"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. ASSIGN RESEARCH MODAL (Part 7.1 & Workflow C)
// ============================================================================
interface AssignResearchModalProps {
  open: boolean;
  onClose: () => void;
  startups: StartupRecord[];
  defaultStartupId?: string;
  users: Array<Omit<WorkspaceUser, "passwordHash">>;
  templates: ResearchTemplate[];
  onAssigned: () => void;
}

export function AssignResearchModal({
  open,
  onClose,
  startups,
  defaultStartupId,
  users,
  templates,
  onAssigned,
}: AssignResearchModalProps) {
  const [startupId, setStartupId] = useState(
    defaultStartupId || startups[0]?.id || ""
  );
  const [templateId, setTemplateId] = useState(
    templates[1]?.id || templates[0]?.id || ""
  );
  const [primaryResearcherId, setPrimaryResearcherId] = useState("user-ananya");
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>(["user-rohan"]);
  const [reviewerId, setReviewerId] = useState("user-ravi");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [priority, setPriority] = useState<PriorityLevel>("High");
  const [objectives, setObjectives] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultStartupId) setStartupId(defaultStartupId);
  }, [defaultStartupId]);

  useEffect(() => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setObjectives(tpl.defaultObjectives);
      setInstructions(tpl.defaultInstructions);
    }
  }, [templateId, templates]);

  if (!open) return null;

  const toggleCollaborator = (uid: string) => {
    setCollaboratorIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tpl = templates.find((t) => t.id === templateId);
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assignment.create",
          startupId,
          templateId,
          primaryResearcherId,
          collaboratorIds: collaboratorIds.filter((id) => id !== primaryResearcherId),
          reviewerId,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          objectives,
          instructions,
          checklist: tpl?.defaultChecklist,
        }),
      });
      if (res.ok) {
        onAssigned();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 bg-[#101A24] text-[#F7F5F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-[#C6AD7A]" />
            <div>
              <h2 className="font-serif text-lg font-semibold">
                Assign Startup Research
              </h2>
              <p className="text-[11px] text-slate-300">
                Delegate structured research to interns/analysts with reviewer sign-off
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Startup *
              </label>
              <select
                required
                value={startupId}
                onChange={(e) => setStartupId(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
              >
                {startups.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startupCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Research Template *
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Researcher *
              </label>
              <select
                value={primaryResearcherId}
                onChange={(e) => setPrimaryResearcherId(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assigned Reviewer *
              </label>
              <select
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
              >
                {users
                  .filter((u) => u.role !== "RESEARCH_ANALYST" && u.role !== "VIEWER")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-2 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-2 py-2 rounded border border-slate-300 text-xs bg-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Additional Research Collaborators (Co-Researchers)
            </label>
            <div className="flex flex-wrap gap-2">
              {users
                .filter((u) => u.id !== primaryResearcherId)
                .map((u) => {
                  const active = collaboratorIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleCollaborator(u.id)}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                        active
                          ? "bg-[#101A24] text-white border-[#101A24]"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {u.name}
                    </button>
                  );
                })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Research Objectives
            </label>
            <textarea
              rows={2}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Analyst Instructions &amp; Evidence Requirements
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-300 text-xs font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !startupId}
            className="px-5 py-2 rounded bg-[#101A24] text-[#F7F5F0] text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Assign Research & Notify Team"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// 3. COMMAND PALETTE MODAL (Cmd/Ctrl + K — Part 18)
// ============================================================================
interface CommandPaletteModalProps {
  open: boolean;
  onClose: () => void;
  dbData: WorkspaceDatabaseSchema;
  currentUser: Omit<WorkspaceUser, "passwordHash">;
  onNavigateTab: (tab: string) => void;
  onSelectStartup: (startupId: string) => void;
  onOpenCreateStartup: () => void;
  onOpenAssignResearch: () => void;
}

export function CommandPaletteModal({
  open,
  onClose,
  dbData,
  currentUser,
  onNavigateTab,
  onSelectStartup,
  onOpenCreateStartup,
  onOpenAssignResearch,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  if (!open) return null;

  const q = query.trim().toLowerCase();

  const matchingStartups = dbData.startups
    .filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.startupCode.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        (s.website && s.website.toLowerCase().includes(q)) ||
        s.founders.some((f) => f.name.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 6);

  const matchingLibrary = dbData.research_library
    .filter(
      (l) =>
        q &&
        (l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)))
    )
    .slice(0, 4);

  const matchingCompetitors = dbData.competitors
    .filter(
      (c) =>
        q &&
        (c.name.toLowerCase().includes(q) ||
          c.startupName.toLowerCase().includes(q) ||
          c.product.toLowerCase().includes(q))
    )
    .slice(0, 4);

  const matchingTasks = dbData.tasks
    .filter(
      (t) =>
        q &&
        (t.title.toLowerCase().includes(q) ||
          (t.startupName && t.startupName.toLowerCase().includes(q)))
    )
    .slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search startups, founders, websites, research titles, competitors, tasks, or tags..."
            className="w-full text-sm text-slate-900 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Quick Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
              {hasPermission(currentUser as WorkspaceUser, "startup.create") && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateStartup();
                  }}
                  className="px-3 py-2 rounded hover:bg-slate-100 text-left text-xs font-medium text-slate-800 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#101A24]" />
                  <span>Quick-Add Startup Opportunity</span>
                </button>
              )}
              {hasPermission(currentUser as WorkspaceUser, "task.assign") && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAssignResearch();
                  }}
                  className="px-3 py-2 rounded hover:bg-slate-100 text-left text-xs font-medium text-slate-800 flex items-center gap-2"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-[#101A24]" />
                  <span>Assign Startup Research to Intern</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab("dealflow");
                }}
                className="px-3 py-2 rounded hover:bg-slate-100 text-left text-xs font-medium text-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Deal Flow CRM</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab("research-queue");
                }}
                className="px-3 py-2 rounded hover:bg-slate-100 text-left text-xs font-medium text-slate-800 flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Research Queue</span>
              </button>
            </div>
          </div>

          {/* Matching Startups */}
          <div>
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Authorised Startups ({matchingStartups.length})
            </div>
            {matchingStartups.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400">
                No matching startup records found.
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {matchingStartups.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectStartup(st.id);
                    }}
                    className="w-full px-3 py-2 rounded hover:bg-slate-100 text-left flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {st.name}{" "}
                        <span className="font-mono text-[11px] text-slate-400">
                          {st.startupCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {st.sector} &bull; Founder: {st.founders[0]?.name || "N/A"}{" "}
                        {st.website ? `• ${st.website}` : ""}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {st.pipelineStage}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Matching Competitors */}
          {matchingCompetitors.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Competitors ({matchingCompetitors.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchingCompetitors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectStartup(c.startupId);
                    }}
                    className="w-full px-3 py-2 rounded hover:bg-slate-100 text-left flex items-center justify-between text-xs"
                  >
                    <span>
                      <strong>{c.name}</strong> (Competitor to {c.startupName})
                    </span>
                    <span className="text-slate-400">{c.geography}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Library Research */}
          {matchingLibrary.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Research Library ({matchingLibrary.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchingLibrary.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateTab("research-library");
                    }}
                    className="w-full px-3 py-2 rounded hover:bg-slate-100 text-left flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800">{l.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {l.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Tasks */}
          {matchingTasks.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tasks ({matchingTasks.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchingTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      if (t.startupId) onSelectStartup(t.startupId);
                      else onNavigateTab("tasks");
                    }}
                    className="w-full px-3 py-2 rounded hover:bg-slate-100 text-left flex items-center justify-between text-xs"
                  >
                    <span>{t.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
