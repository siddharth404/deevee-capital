"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Building2,
  UserCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Send,
  ShieldAlert,
  Award,
  MessageSquare,
  CheckSquare,
  History,
  Link2,
  Download,
  Lock,
  Upload,
  GitMerge,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  canApproveResearch,
  canDeleteStartup,
  canEditStartup,
  canReviewResearch,
  hasPermission,
} from "@/lib/workspace/permissions";
import {
  ConfidenceLevel,
  ConfidentialityLevel,
  DecisionOutcome,
  DocumentCategory,
  EvaluationDimensionScore,
  PriorityLevel,
  RiskEntry,
  SourceType,
  StartupRecord,
  TaskStatus,
  WorkspaceDatabaseSchema,
  WorkspaceUser,
} from "@/lib/workspace/types";

interface StartupDetailViewProps {
  startup: StartupRecord;
  dbData: WorkspaceDatabaseSchema;
  currentUser: Omit<WorkspaceUser, "passwordHash">;
  initialTab?: string;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onOpenAssignResearch: (startupId: string) => void;
  onSelectStartup: (startupId: string) => void;
}

const DETAIL_TABS = [
  { id: "overview", label: "1. Overview" },
  { id: "founders", label: "2. Founders" },
  { id: "business", label: "3. Business & Product" },
  { id: "market", label: "4. Market Research" },
  { id: "traction", label: "5. Traction & Financials" },
  { id: "competitors", label: "6. Competitors" },
  { id: "research", label: "7. Research & Citations" },
  { id: "evaluation", label: "8. Evaluation & Decision" },
  { id: "documents", label: "9. Documents" },
  { id: "tasks", label: "10. Tasks" },
  { id: "collaboration", label: "11. Collaboration" },
  { id: "activity", label: "12. Activity History" },
] as const;

const SOURCE_TYPES: SourceType[] = [
  "Official website",
  "Company announcement",
  "Government source",
  "Regulatory filing",
  "News article",
  "LinkedIn",
  "Founder interview",
  "Database",
  "Other",
];

const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  "Verified Fact",
  "High Confidence",
  "Medium Confidence",
  "Analyst Estimate",
  "Unverified Claim",
];

const RISK_CATEGORIES: RiskEntry["category"][] = [
  "Market risk",
  "Founder risk",
  "Product risk",
  "Financial risk",
  "Competitive risk",
  "Regulatory risk",
  "Execution risk",
  "Customer concentration",
  "Dependency risks",
  "Unverified claims",
];

const DECISION_OUTCOMES: DecisionOutcome[] = [
  "Proceed",
  "Request More Information",
  "Further Discussion",
  "Hold",
  "Pass",
  "Approved Subject to Conditions",
];

export function StartupDetailView({
  startup,
  dbData,
  currentUser,
  initialTab = "overview",
  onBack,
  onRefresh,
  onOpenAssignResearch,
  onSelectStartup,
}: StartupDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [saving, setSaving] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const canEdit = canEditStartup(currentUser as WorkspaceUser, startup);
  const canAssign = hasPermission(currentUser as WorkspaceUser, "task.assign");
  const canDecide = hasPermission(currentUser as WorkspaceUser, "evaluation.decision");
  const canEvaluate = hasPermission(currentUser as WorkspaceUser, "evaluation.create");

  const originalSubmission = dbData.submissions.find(
    (sub) =>
      sub.id === startup.originalSubmissionId ||
      sub.startupId === startup.id
  );
  const assignment = dbData.assignments.find((a) => a.startupId === startup.id);
  const research = dbData.research.find((r) => r.startupId === startup.id);
  const sources = dbData.research_sources.filter((s) => s.startupId === startup.id);
  const competitors = dbData.competitors.filter((c) => c.startupId === startup.id);
  const evaluations = dbData.evaluations.filter((e) => e.startupId === startup.id);
  const documents = dbData.documents.filter((d) => d.startupId === startup.id);
  const tasks = dbData.tasks.filter((t) => t.startupId === startup.id);
  const comments = dbData.comments.filter((c) => c.startupId === startup.id);
  const activityLogs = dbData.activity_logs.filter((l) => l.startupId === startup.id);

  // Editable state for Startup & Research sections
  const [overviewEdit, setOverviewEdit] = useState({
    description: startup.description || "",
    headquarters: startup.headquarters || "",
    sector: startup.sector || "",
    industry: startup.industry || "",
    vertical: startup.vertical || "",
    yearFounded: startup.yearFounded || "",
    incorporationStatus: startup.incorporationStatus || "",
    internalSummary: startup.internalSummary || "",
    nextFollowUpAt: startup.nextFollowUpAt?.slice(0, 10) || "",
  });

  const [newFounder, setNewFounder] = useState({
    name: "",
    role: "Co-Founder",
    email: "",
    phone: "",
    linkedinUrl: "",
    previousExperience: "",
    background: "",
    education: "",
  });

  const [founderResEdit, setFounderResEdit] = useState(
    research?.founderResearch || {
      profiles: "",
      previousCompanies: "",
      employmentHistory: "",
      relevantExperience: "",
      education: "",
      linkedinProfiles: "",
      previousOutcomes: "",
      cofounderRelationships: "",
      publicInterviews: "",
    }
  );

  const [businessEdit, setBusinessEdit] = useState({
    ...startup.business,
    functionality: research?.productResearch.functionality || "",
    technology: research?.productResearch.technology || "",
    differentiation: research?.productResearch.differentiation || "",
    productMaturity: research?.productResearch.productMaturity || "",
    competitiveAdvantage: research?.productResearch.competitiveAdvantage || "",
    barriersToEntry: research?.productResearch.barriersToEntry || "",
    pricing: research?.businessModel.pricing || "",
    unitEconomics: research?.businessModel.unitEconomics || "",
    grossMargins: research?.businessModel.grossMargins || "",
    scalability: research?.businessModel.scalability || "",
  });

  const [marketEdit, setMarketEdit] = useState(
    research?.marketResearch || {
      marketSizeSummary: "",
      tam: "",
      tamSource: "",
      tamMethodology: "",
      sam: "",
      samSource: "",
      som: "",
      somSource: "",
      industryTrends: "",
      customerSegments: "",
      demandDrivers: "",
      marketOpportunities: "",
      marketLimitations: "",
    }
  );

  const [tractionEdit, setTractionEdit] = useState({
    currentRevenue: startup.traction.currentRevenue || "",
    arrMrr: startup.traction.arrMrr || "",
    revenueGrowth: startup.traction.revenueGrowth || "",
    payingCustomers: startup.traction.payingCustomers || "",
    userCount: startup.traction.userCount || "",
    retention: startup.traction.retention || "",
    burnRate: research?.tractionFinancials.burnRate || "",
    cashRunway: research?.tractionFinancials.cashRunway || "",
    currentStage: startup.funding.currentStage || "",
    fundingSought: startup.funding.fundingSought || "",
    previouslyRaised: startup.funding.previouslyRaised || "",
    proposedValuation: startup.funding.proposedValuation || "",
    useOfFunds: startup.funding.useOfFunds || "",
    founderReportedData: research?.tractionFinancials.founderReportedData || "",
    publiclyVerifiedData: research?.tractionFinancials.publiclyVerifiedData || "",
    analystEstimates: research?.tractionFinancials.analystEstimates || "",
    unverifiedAssumptions: research?.tractionFinancials.unverifiedAssumptions || "",
  });

  const [conclusionEdit, setConclusionEdit] = useState(
    research?.conclusion || {
      executiveSummary: "",
      whyInteresting: "",
      whatMakesPromising: "",
      mainConcerns: "",
      missingInformation: "",
      questionsForFounders: "",
      recommendationNextStep: "",
    }
  );

  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    website: "",
    geography: "India",
    product: "",
    pricing: "",
    targetMarket: "",
    fundingHistory: "",
    strengths: "",
    weaknesses: "",
    differentiation: "",
  });

  const [newSource, setNewSource] = useState({
    section: "Market Research",
    claimSummary: "",
    sourceTitle: "",
    sourceUrl: "",
    publicationDate: "",
    sourceType: "Official website" as SourceType,
    confidenceLevel: "Verified Fact" as ConfidenceLevel,
    analystNotes: "",
  });

  const [newRisk, setNewRisk] = useState({
    category: "Market risk" as RiskEntry["category"],
    description: "",
    severity: "Medium" as RiskEntry["severity"],
    evidence: "",
    mitigation: "",
  });

  const [submissionNote, setSubmissionNote] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [missingEvidence, setMissingEvidence] = useState("");
  const [additionalAnalysis, setAdditionalAnalysis] = useState("");

  // Scorecard state
  const defaultScorecard = dbData.scorecards[0]!;
  const myExistingEval = evaluations.find((e) => e.evaluatorId === currentUser.id);
  const [evalScores, setEvalScores] = useState<EvaluationDimensionScore[]>(
    myExistingEval?.scores ||
      defaultScorecard.dimensions.map((d) => ({
        dimensionId: d.id,
        dimensionName: d.name,
        weight: d.weight,
        score: 3,
        justification: "",
        evidence: "",
      }))
  );
  const [evalStrengths, setEvalStrengths] = useState(myExistingEval?.strengths || "");
  const [evalWeaknesses, setEvalWeaknesses] = useState(myExistingEval?.weaknesses || "");
  const [evalRisks, setEvalRisks] = useState(myExistingEval?.majorRisks || "");
  const [evalMissing, setEvalMissing] = useState(myExistingEval?.missingInformation || "");
  const [evalComments, setEvalComments] = useState(myExistingEval?.reviewerComments || "");
  const [evalRec, setEvalRec] = useState<DecisionOutcome>(
    myExistingEval?.recommendation || "Further Discussion"
  );

  // Decision state
  const [decisionOutcome, setDecisionOutcome] = useState<DecisionOutcome>("Proceed");
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionConditions, setDecisionConditions] = useState("");

  // Document upload state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<DocumentCategory>("Market Research");
  const [docConfidentiality, setDocConfidentiality] =
    useState<ConfidentialityLevel>("standard");

  // Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState(
    startup.assignedResearcherId || currentUser.id
  );
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>("High");
  const [taskDueDate, setTaskDueDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);

  // Merge duplicate modal state
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [showMergeBox, setShowMergeBox] = useState(false);

  const showNotice = (type: "success" | "error", text: string) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg(null), 5000);
  };

  const handleUpdateStartupField = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "startup.update",
          startupId: startup.id,
          updates,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Update failed.");
      } else {
        await onRefresh();
        showNotice("success", "Startup record updated.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResearch = async (
    submitForReview = false,
    overrideRisks?: RiskEntry[]
  ) => {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: submitForReview ? "research.submit" : "research.save",
          startupId: startup.id,
          submissionNote,
          researchData: {
            founderResearch: founderResEdit,
            marketResearch: marketEdit,
            productResearch: {
              functionality: businessEdit.functionality,
              technology: businessEdit.technology,
              differentiation: businessEdit.differentiation,
              customerProblem: businessEdit.problemAddressed,
              productMaturity: businessEdit.productMaturity,
              competitiveAdvantage: businessEdit.competitiveAdvantage,
              barriersToEntry: businessEdit.barriersToEntry,
            },
            businessModel: {
              revenueModel: businessEdit.revenueModel,
              pricing: businessEdit.pricing,
              customerAcquisition: "",
              distribution: businessEdit.distributionChannels,
              unitEconomics: businessEdit.unitEconomics,
              grossMargins: businessEdit.grossMargins,
              scalability: businessEdit.scalability,
              recurringRevenue: tractionEdit.arrMrr,
            },
            tractionFinancials: {
              revenue: tractionEdit.currentRevenue,
              growth: tractionEdit.revenueGrowth,
              customers: tractionEdit.payingCustomers,
              retention: tractionEdit.retention,
              burnRate: tractionEdit.burnRate,
              cashRunway: tractionEdit.cashRunway,
              fundingHistory: tractionEdit.previouslyRaised,
              revenueProjections: "",
              founderReportedData: tractionEdit.founderReportedData,
              publiclyVerifiedData: tractionEdit.publiclyVerifiedData,
              analystEstimates: tractionEdit.analystEstimates,
              unverifiedAssumptions: tractionEdit.unverifiedAssumptions,
            },
            risksRedFlags: overrideRisks ?? research?.risksRedFlags ?? [],
            conclusion: conclusionEdit,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Could not save research.");
      } else {
        await onRefresh();
        showNotice(
          "success",
          submitForReview
            ? "Research submitted for review and Reviewer notified."
            : "Research workspace saved."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReviewAction = async (
    reviewAction: "approved" | "revision_requested"
  ) => {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "research.review",
          startupId: startup.id,
          reviewAction,
          feedback: reviewFeedback,
          missingEvidence,
          additionalAnalysisRequested: additionalAnalysis,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Review action failed.");
      } else {
        setReviewFeedback("");
        setMissingEvidence("");
        setAdditionalAnalysis("");
        await onRefresh();
        showNotice(
          "success",
          reviewAction === "approved"
            ? "Research formally approved!"
            : "Revision request sent to researchers."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "research.add_source",
          startupId: startup.id,
          researchId: research?.id,
          ...newSource,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Could not add citation.");
      } else {
        setNewSource({
          ...newSource,
          claimSummary: "",
          sourceTitle: "",
          sourceUrl: "",
          analystNotes: "",
        });
        await onRefresh();
        showNotice("success", "Verified citation source attached.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "competitor.create",
          startupId: startup.id,
          ...newCompetitor,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Could not add competitor.");
      } else {
        setNewCompetitor({
          name: "",
          website: "",
          geography: "India",
          product: "",
          pricing: "",
          targetMarket: "",
          fundingHistory: "",
          strengths: "",
          weaknesses: "",
          differentiation: "",
        });
        await onRefresh();
        showNotice("success", "Competitor added to database.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRisk.description.trim()) return;
    const entry: RiskEntry = {
      id: `risk-${Date.now().toString(36)}`,
      category: newRisk.category,
      description: newRisk.description.trim(),
      severity: newRisk.severity,
      evidence: newRisk.evidence.trim(),
      mitigation: newRisk.mitigation.trim(),
      researcherId: currentUser.id,
      researcherName: currentUser.name,
      dateIdentified: new Date().toISOString().slice(0, 10),
      reviewStatus: "Open",
    };
    const updatedRisks = [entry, ...(research?.risksRedFlags || [])];
    setNewRisk({
      category: "Market risk",
      description: "",
      severity: "Medium",
      evidence: "",
      mitigation: "",
    });
    await handleSaveResearch(false, updatedRisks);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluation.submit",
          startupId: startup.id,
          scores: evalScores,
          strengths: evalStrengths,
          weaknesses: evalWeaknesses,
          majorRisks: evalRisks,
          missingInformation: evalMissing,
          reviewerComments: evalComments,
          recommendation: evalRec,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Could not submit scorecard.");
      } else {
        await onRefresh();
        showNotice("success", "Evaluation scorecard recorded.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decision.record",
          startupId: startup.id,
          outcome: decisionOutcome,
          reason: decisionReason,
          conditions: decisionConditions,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Could not record decision.");
      } else {
        setDecisionReason("");
        setDecisionConditions("");
        await onRefresh();
        showNotice("success", `Official decision '${decisionOutcome}' recorded.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", docFile);
      fd.append("title", docTitle || docFile.name);
      fd.append("startupId", startup.id);
      fd.append("category", docCategory);
      fd.append("confidentiality", docConfidentiality);

      const res = await fetch("/api/workspace/export", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Upload failed.");
      } else {
        setDocFile(null);
        setDocTitle("");
        await onRefresh();
        showNotice("success", "Document uploaded to secure repository.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "task.create",
          startupId: startup.id,
          title: taskTitle,
          description: taskDesc,
          assignedToId: taskAssigneeId,
          priority: taskPriority,
          dueDate: new Date(taskDueDate).toISOString(),
        }),
      });
      if (res.ok) {
        setTaskTitle("");
        setTaskDesc("");
        await onRefresh();
        showNotice("success", "Task created.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment.create",
          startupId: startup.id,
          content: commentText,
          mentions: selectedMentions,
        }),
      });
      if (res.ok) {
        setCommentText("");
        setSelectedMentions([]);
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleMergeIntoThis = async () => {
    if (!mergeTargetId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "startup.merge_duplicate",
          sourceStartupId: mergeTargetId,
          targetStartupId: startup.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showNotice("error", data.message || "Merge failed.");
      } else {
        setShowMergeBox(false);
        await onRefresh();
        showNotice("success", "Duplicate startup merged into this profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Compute live weighted evaluation score
  const liveWeightedScore = (() => {
    let wSum = 0;
    let totalW = 0;
    for (const s of evalScores) {
      wSum += s.score * s.weight;
      totalW += s.weight;
    }
    return totalW > 0 ? (wSum / totalW).toFixed(2) : "3.00";
  })();

  return (
    <div className="space-y-5">
      {/* Top Action & Status Banner */}
      {bannerMsg && (
        <div
          className={`p-3.5 rounded-md border text-xs font-medium flex items-center justify-between ${
            bannerMsg.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <span>{bannerMsg.text}</span>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#101A24]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Deal Flow</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {canAssign && (
              <button
                type="button"
                onClick={() => onOpenAssignResearch(startup.id)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#101A24]" />
                <span>Assign / Delegate Research</span>
              </button>
            )}
            <a
              href={`/api/workspace/export?type=pdf_profile&startupId=${encodeURIComponent(startup.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#101A24]" />
              <span>Export PDF Dossier</span>
            </a>
            {(currentUser.role === "SUPER_ADMIN" ||
              currentUser.role === "INVESTMENT_LEAD") && (
              <button
                type="button"
                onClick={() => setShowMergeBox(!showMergeBox)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
              >
                <GitMerge className="w-3.5 h-3.5 text-slate-600" />
                <span>Merge Duplicate</span>
              </button>
            )}
            {canDeleteStartup(currentUser as WorkspaceUser) && (
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/workspace/state", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "startup.delete",
                      startupId: startup.id,
                    }),
                  });
                  if (res.ok) {
                    await onRefresh();
                    onBack();
                  }
                }}
                className="px-2.5 py-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-medium text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {showMergeBox && (
          <div className="my-3 p-3.5 rounded bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-slate-900 block">
                Merge Another Duplicate Startup Record into {startup.name}
              </strong>
              <span className="text-slate-500">
                Preserves all founder submissions, documents, citations, comments, and history.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs"
              >
                <option value="">Select duplicate startup to merge in...</option>
                {dbData.startups
                  .filter((s) => s.id !== startup.id && !s.archived)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startupCode})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                disabled={!mergeTargetId || saving}
                onClick={handleMergeIntoThis}
                className="px-3 py-1.5 rounded bg-[#101A24] text-white font-semibold disabled:opacity-40"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#101A24] text-[#C6AD7A] flex items-center justify-center font-serif font-bold text-xl shrink-0">
              {startup.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-serif font-semibold text-slate-900">
                  {startup.name}
                </h1>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs text-slate-700">
                  {startup.startupCode}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  Source: {startup.source}
                </span>
                {startup.originalSubmissionRef && (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 font-mono text-[11px] text-indigo-800">
                    Ref: {startup.originalSubmissionRef}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span>
                  Sector: <strong className="text-slate-800">{startup.sector}</strong>
                </span>
                <span>&bull;</span>
                <span>HQ: {startup.headquarters}</span>
                {startup.website && (
                  <>
                    <span>&bull;</span>
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{startup.website}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </>
                )}
                <span>&bull;</span>
                <span>
                  Updated {new Date(startup.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stage & Priority Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Pipeline Stage
              </label>
              <select
                disabled={!canEdit}
                value={startup.pipelineStage}
                onChange={(e) =>
                  handleUpdateStartupField({ pipelineStage: e.target.value })
                }
                className="px-3 py-1.5 rounded border border-slate-300 bg-[#101A24] text-white text-xs font-medium disabled:opacity-60"
              >
                {dbData.pipeline_stages.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </label>
              <select
                disabled={!canEdit}
                value={startup.priority}
                onChange={(e) =>
                  handleUpdateStartupField({ priority: e.target.value })
                }
                className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs font-medium"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 12-Tab Navigation Bar */}
        <div className="mt-5 pt-2 border-t border-slate-200 flex items-center gap-1 overflow-x-auto">
          {DETAIL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded-t text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-[#101A24] text-[#101A24] bg-slate-100/80 font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t.label}
              {t.id === "competitors" && competitors.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px]">
                  {competitors.length}
                </span>
              )}
              {t.id === "research" && sources.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  {sources.length} src
                </span>
              )}
              {t.id === "collaboration" && comments.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px]">
                  {comments.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Grid: Active Tab Content (Left 8 cols) + Contextual Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* ============================================================== */}
          {/* TAB 1: OVERVIEW & ORIGINAL FOUNDER SUBMISSION TRACEABILITY     */}
          {/* ============================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {originalSubmission && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-amber-950 font-semibold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>
                        Original Founder Website Submission (Immutable Record:{" "}
                        {originalSubmission.referenceId})
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-800">
                      Submitted:{" "}
                      {new Date(originalSubmission.submittedAt).toUTCString()}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900">
                    Preserved verbatim from <strong>deeveecapital.com</strong>. Analyst edits to internal research never overwrite this founder record.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded border border-amber-200 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Founder Name &amp; Email
                      </span>
                      <strong className="text-slate-900">
                        {originalSubmission.founderName}
                      </strong>
                      <span className="block text-slate-600">
                        {originalSubmission.founderEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Submitted Sector &amp; Stage
                      </span>
                      <strong className="text-slate-900">
                        {originalSubmission.sector}
                      </strong>
                      <span className="block text-slate-600">
                        {originalSubmission.stage} &bull; Sought:{" "}
                        {originalSubmission.fundingSought || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Consent &amp; Pitch Deck
                      </span>
                      <span className="text-emerald-700 font-medium block">
                        ✓ Privacy Consent Verified
                      </span>
                      {(originalSubmission.pitchDeckUrl ||
                        originalSubmission.pitchDeckStorageUrl) && (
                        <a
                          href={
                            originalSubmission.pitchDeckStorageUrl ||
                            originalSubmission.pitchDeckUrl ||
                            "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline font-medium inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>Open Submitted Pitch Deck</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="sm:col-span-3 pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase mb-1">
                        Founder&apos;s Original Description
                      </span>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {originalSubmission.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-semibold text-slate-900">
                    Internal Company Intelligence Profile
                  </h2>
                  {canEdit && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        handleUpdateStartupField({
                          ...overviewEdit,
                          nextFollowUpAt: overviewEdit.nextFollowUpAt
                            ? new Date(overviewEdit.nextFollowUpAt).toISOString()
                            : null,
                        })
                      }
                      className="px-4 py-1.5 rounded bg-[#101A24] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Profile Changes"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Sector (Classification Only)
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={overviewEdit.sector}
                      onChange={(e) =>
                        setOverviewEdit({ ...overviewEdit, sector: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={overviewEdit.industry}
                      onChange={(e) =>
                        setOverviewEdit({
                          ...overviewEdit,
                          industry: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Specific Vertical
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={overviewEdit.vertical}
                      onChange={(e) =>
                        setOverviewEdit({
                          ...overviewEdit,
                          vertical: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Headquarters
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={overviewEdit.headquarters}
                      onChange={(e) =>
                        setOverviewEdit({
                          ...overviewEdit,
                          headquarters: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Year Founded &amp; Incorporation
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={overviewEdit.incorporationStatus}
                      onChange={(e) =>
                        setOverviewEdit({
                          ...overviewEdit,
                          incorporationStatus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Next Follow-Up Date
                    </label>
                    <input
                      type="date"
                      disabled={!canEdit}
                      value={overviewEdit.nextFollowUpAt}
                      onChange={(e) =>
                        setOverviewEdit({
                          ...overviewEdit,
                          nextFollowUpAt: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Company Description
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canEdit}
                    value={overviewEdit.description}
                    onChange={(e) =>
                      setOverviewEdit({
                        ...overviewEdit,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Internal Analyst Summary &amp; Triage Notes
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canEdit}
                    value={overviewEdit.internalSummary}
                    onChange={(e) =>
                      setOverviewEdit({
                        ...overviewEdit,
                        internalSummary: e.target.value,
                      })
                    }
                    placeholder="Key takeaway for the investment team..."
                    className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: FOUNDERS & FOUNDER RESEARCH                             */}
          {/* ============================================================== */}
          {activeTab === "founders" && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <h2 className="font-serif text-lg font-semibold text-slate-900">
                  Founding Team Directory
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {startup.founders.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-slate-900">{f.name}</strong>
                        <span className="px-2 py-0.5 rounded bg-[#101A24] text-white font-mono text-[10px]">
                          {f.role}
                        </span>
                      </div>
                      <div className="text-slate-600 space-y-1">
                        {f.email && <div>Email: {f.email}</div>}
                        {f.phone && <div>Phone: {f.phone}</div>}
                        {f.linkedinUrl && (
                          <div>
                            LinkedIn:{" "}
                            <a
                              href={f.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 underline"
                            >
                              {f.linkedinUrl}
                            </a>
                          </div>
                        )}
                        {f.previousExperience && (
                          <div>
                            <strong>Prior Experience:</strong> {f.previousExperience}
                          </div>
                        )}
                        {f.education && (
                          <div>
                            <strong>Education:</strong> {f.education}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {canEdit && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                      + Add Co-Founder Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Co-founder Name"
                        value={newFounder.name}
                        onChange={(e) =>
                          setNewFounder({ ...newFounder, name: e.target.value })
                        }
                        className="px-3 py-2 rounded border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g., CTO & Co-Founder)"
                        value={newFounder.role}
                        onChange={(e) =>
                          setNewFounder({ ...newFounder, role: e.target.value })
                        }
                        className="px-3 py-2 rounded border border-slate-300 text-xs"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newFounder.email}
                        onChange={(e) =>
                          setNewFounder({ ...newFounder, email: e.target.value })
                        }
                        className="px-3 py-2 rounded border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="LinkedIn URL"
                        value={newFounder.linkedinUrl}
                        onChange={(e) =>
                          setNewFounder({
                            ...newFounder,
                            linkedinUrl: e.target.value,
                          })
                        }
                        className="px-3 py-2 rounded border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Prior Companies / Experience"
                        value={newFounder.previousExperience}
                        onChange={(e) =>
                          setNewFounder({
                            ...newFounder,
                            previousExperience: e.target.value,
                          })
                        }
                        className="px-3 py-2 rounded border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        disabled={!newFounder.name.trim()}
                        onClick={() => {
                          const updated = [
                            ...startup.founders,
                            {
                              ...newFounder,
                              id: `f-${Date.now().toString(36)}`,
                              isPrimary: false,
                            },
                          ];
                          handleUpdateStartupField({ founders: updated });
                          setNewFounder({
                            name: "",
                            role: "Co-Founder",
                            email: "",
                            phone: "",
                            linkedinUrl: "",
                            previousExperience: "",
                            background: "",
                            education: "",
                          });
                        }}
                        className="px-4 py-2 rounded bg-[#101A24] text-white text-xs font-semibold disabled:opacity-40"
                      >
                        Add Co-Founder
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Section B: Founder Background Research */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-semibold text-slate-900">
                    Section B: Structured Founder Diligence Notes
                  </h3>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveResearch(false)}
                    className="px-3.5 py-1.5 rounded bg-[#101A24] text-white text-xs font-semibold"
                  >
                    Save Founder Research
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Previous Companies &amp; Startup Outcomes
                    </label>
                    <textarea
                      rows={3}
                      value={founderResEdit.previousOutcomes}
                      onChange={(e) =>
                        setFounderResEdit({
                          ...founderResEdit,
                          previousOutcomes: e.target.value,
                        })
                      }
                      placeholder="Document previous entrepreneurial ventures, exits, or closures..."
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Employment History &amp; Domain Depth
                    </label>
                    <textarea
                      rows={3}
                      value={founderResEdit.employmentHistory}
                      onChange={(e) =>
                        setFounderResEdit({
                          ...founderResEdit,
                          employmentHistory: e.target.value,
                        })
                      }
                      placeholder="Relevant corporate/operational roles and domain expertise..."
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Co-Founder Relationships &amp; Working History
                    </label>
                    <textarea
                      rows={3}
                      value={founderResEdit.cofounderRelationships}
                      onChange={(e) =>
                        setFounderResEdit({
                          ...founderResEdit,
                          cofounderRelationships: e.target.value,
                        })
                      }
                      placeholder="How long have the founders known each other and worked together?"
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Public Interviews, Podcasts &amp; Reference Notes
                    </label>
                    <textarea
                      rows={3}
                      value={founderResEdit.publicInterviews}
                      onChange={(e) =>
                        setFounderResEdit({
                          ...founderResEdit,
                          publicInterviews: e.target.value,
                        })
                      }
                      placeholder="Links and takeaways from public talks, articles, or interviews..."
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: BUSINESS & PRODUCT RESEARCH (Sections D & E)            */}
          {/* ============================================================== */}
          {activeTab === "business" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-slate-900">
                  Product, Value Proposition &amp; Business Model Analysis
                </h2>
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    await handleUpdateStartupField({
                      business: {
                        problemAddressed: businessEdit.problemAddressed,
                        productService: businessEdit.productService,
                        valueProposition: businessEdit.valueProposition,
                        businessModel: businessEdit.businessModel,
                        targetCustomers: businessEdit.targetCustomers,
                        customerSegments: businessEdit.customerSegments,
                        distributionChannels: businessEdit.distributionChannels,
                        revenueModel: businessEdit.revenueModel,
                      },
                    });
                    await handleSaveResearch(false);
                  }}
                  className="px-4 py-1.5 rounded bg-[#101A24] text-white text-xs font-semibold"
                >
                  Save Business &amp; Product Research
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Problem Being Addressed
                  </label>
                  <textarea
                    rows={3}
                    value={businessEdit.problemAddressed}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        problemAddressed: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Product / Service &amp; Functionality
                  </label>
                  <textarea
                    rows={3}
                    value={businessEdit.productService}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        productService: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Differentiation &amp; Competitive Advantage
                  </label>
                  <textarea
                    rows={3}
                    value={businessEdit.differentiation}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        differentiation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Barriers to Entry &amp; Moat
                  </label>
                  <textarea
                    rows={3}
                    value={businessEdit.barriersToEntry}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        barriersToEntry: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Revenue Model &amp; Pricing Architecture
                  </label>
                  <textarea
                    rows={2}
                    value={businessEdit.pricing}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        pricing: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Target Customers &amp; Distribution Channels
                  </label>
                  <textarea
                    rows={2}
                    value={businessEdit.distributionChannels}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        distributionChannels: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Unit Economics &amp; Gross Margins
                  </label>
                  <textarea
                    rows={2}
                    value={businessEdit.unitEconomics}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        unitEconomics: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Operational Scalability
                  </label>
                  <textarea
                    rows={2}
                    value={businessEdit.scalability}
                    onChange={(e) =>
                      setBusinessEdit({
                        ...businessEdit,
                        scalability: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: MARKET RESEARCH (Section C — Mandatory TAM Methodology) */}
          {/* ============================================================== */}
          {activeTab === "market" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-slate-900">
                    Section C: Market Sizing (TAM / SAM / SOM) &amp; Demand Drivers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mandatory Policy: Entering a TAM figure requires both a verified Source and explicit Calculation Methodology.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveResearch(false)}
                  className="px-4 py-1.5 rounded bg-[#101A24] text-white text-xs font-semibold"
                >
                  Save Market Research
                </button>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Total Addressable Market (TAM)
                    </label>
                    <input
                      type="text"
                      value={marketEdit.tam}
                      onChange={(e) =>
                        setMarketEdit({ ...marketEdit, tam: e.target.value })
                      }
                      placeholder="e.g., ₹18,500 Cr ($2.2B)"
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      TAM Verified Source (Required if TAM set) *
                    </label>
                    <input
                      type="text"
                      value={marketEdit.tamSource}
                      onChange={(e) =>
                        setMarketEdit({
                          ...marketEdit,
                          tamSource: e.target.value,
                        })
                      }
                      placeholder="Report title & URL"
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      SAM &amp; SOM Estimates
                    </label>
                    <input
                      type="text"
                      value={marketEdit.sam}
                      onChange={(e) =>
                        setMarketEdit({ ...marketEdit, sam: e.target.value })
                      }
                      placeholder="SAM: ₹3,200 Cr | SOM: ₹180 Cr"
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    TAM / SAM / SOM Calculation Methodology &amp; Assumptions (Required if TAM set) *
                  </label>
                  <textarea
                    rows={2}
                    value={marketEdit.tamMethodology}
                    onChange={(e) =>
                      setMarketEdit({
                        ...marketEdit,
                        tamMethodology: e.target.value,
                      })
                    }
                    placeholder="Show bottom-up formula: e.g., 45,000 target industrial plants in India × ₹4.1L average annual subscription = ₹1,845 Cr SAM..."
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Industry Trends &amp; Demand Drivers
                  </label>
                  <textarea
                    rows={3}
                    value={marketEdit.demandDrivers}
                    onChange={(e) =>
                      setMarketEdit({
                        ...marketEdit,
                        demandDrivers: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Customer Segments
                  </label>
                  <textarea
                    rows={3}
                    value={marketEdit.customerSegments}
                    onChange={(e) =>
                      setMarketEdit({
                        ...marketEdit,
                        customerSegments: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Market Opportunities
                  </label>
                  <textarea
                    rows={3}
                    value={marketEdit.marketOpportunities}
                    onChange={(e) =>
                      setMarketEdit({
                        ...marketEdit,
                        marketOpportunities: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Market Limitations &amp; Structural Friction
                  </label>
                  <textarea
                    rows={3}
                    value={marketEdit.marketLimitations}
                    onChange={(e) =>
                      setMarketEdit({
                        ...marketEdit,
                        marketLimitations: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: TRACTION & FINANCIALS (4-Tier Data Classification)      */}
          {/* ============================================================== */}
          {activeTab === "traction" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-slate-900">
                    Section F: Traction, Financials &amp; Evidence Classification
                  </h2>
                  <p className="text-xs text-slate-500">
                    Financial fields are optional for pre-revenue startups. Strictly separate founder claims from verified facts and analyst estimates.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    await handleUpdateStartupField({
                      traction: {
                        ...startup.traction,
                        currentRevenue: tractionEdit.currentRevenue,
                        arrMrr: tractionEdit.arrMrr,
                        revenueGrowth: tractionEdit.revenueGrowth,
                        payingCustomers: tractionEdit.payingCustomers,
                        userCount: tractionEdit.userCount,
                        retention: tractionEdit.retention,
                      },
                      funding: {
                        ...startup.funding,
                        currentStage: tractionEdit.currentStage,
                        fundingSought: tractionEdit.fundingSought,
                        previouslyRaised: tractionEdit.previouslyRaised,
                        proposedValuation: tractionEdit.proposedValuation,
                        useOfFunds: tractionEdit.useOfFunds,
                      },
                    });
                    await handleSaveResearch(false);
                  }}
                  className="px-4 py-1.5 rounded bg-[#101A24] text-white text-xs font-semibold"
                >
                  Save Traction &amp; Financials
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Current Revenue
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.currentRevenue}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        currentRevenue: e.target.value,
                      })
                    }
                    placeholder="Optional"
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    ARR / MRR
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.arrMrr}
                    onChange={(e) =>
                      setTractionEdit({ ...tractionEdit, arrMrr: e.target.value })
                    }
                    placeholder="Optional"
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Paying Customers
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.payingCustomers}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        payingCustomers: e.target.value,
                      })
                    }
                    placeholder="Optional"
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Retention / Burn / Runway
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.cashRunway}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        cashRunway: e.target.value,
                      })
                    }
                    placeholder="e.g., 14 months runway"
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Funding Stage
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.currentStage}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        currentStage: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Funding Sought
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.fundingSought}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        fundingSought: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Previously Raised
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.previouslyRaised}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        previouslyRaised: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Proposed Valuation
                  </label>
                  <input
                    type="text"
                    value={tractionEdit.proposedValuation}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        proposedValuation: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
              </div>

              {/* 4-Tier Classification Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                <div className="p-3.5 rounded border border-amber-200 bg-amber-50/40">
                  <label className="block font-semibold text-amber-950 mb-1">
                    1. Founder-Reported Data (Unverified Claims)
                  </label>
                  <textarea
                    rows={3}
                    value={tractionEdit.founderReportedData}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        founderReportedData: e.target.value,
                      })
                    }
                    placeholder="Figures stated in founder pitch deck or conversation..."
                    className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white"
                  />
                </div>
                <div className="p-3.5 rounded border border-emerald-200 bg-emerald-50/40">
                  <label className="block font-semibold text-emerald-950 mb-1">
                    2. Publicly Verified / Audited Data
                  </label>
                  <textarea
                    rows={3}
                    value={tractionEdit.publiclyVerifiedData}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        publiclyVerifiedData: e.target.value,
                      })
                    }
                    placeholder="MCA filings, GST/invoice verification, public customer releases..."
                    className="w-full px-2.5 py-1.5 rounded border border-emerald-300 bg-white"
                  />
                </div>
                <div className="p-3.5 rounded border border-sky-200 bg-sky-50/40">
                  <label className="block font-semibold text-sky-950 mb-1">
                    3. Analyst Estimates
                  </label>
                  <textarea
                    rows={3}
                    value={tractionEdit.analystEstimates}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        analystEstimates: e.target.value,
                      })
                    }
                    placeholder="Intern/analyst modeled unit economics or revenue estimates..."
                    className="w-full px-2.5 py-1.5 rounded border border-sky-300 bg-white"
                  />
                </div>
                <div className="p-3.5 rounded border border-slate-200 bg-slate-50">
                  <label className="block font-semibold text-slate-800 mb-1">
                    4. Unverified Assumptions Requiring Diligence
                  </label>
                  <textarea
                    rows={3}
                    value={tractionEdit.unverifiedAssumptions}
                    onChange={(e) =>
                      setTractionEdit({
                        ...tractionEdit,
                        unverifiedAssumptions: e.target.value,
                      })
                    }
                    placeholder="Assumptions that must be tested with founders before Investment Decision..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: COMPETITOR ANALYSIS (Section G)                         */}
          {/* ============================================================== */}
          {activeTab === "competitors" && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <h2 className="font-serif text-lg font-semibold text-slate-900">
                  Section G: Structured Competitor Landscape ({competitors.length})
                </h2>

                {competitors.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">
                    No competitors logged yet for {startup.name}. Add direct and adjacent competitors below.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {competitors.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-slate-900">
                              {c.name}
                            </strong>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                              {c.geography}
                            </span>
                            {c.website && (
                              <a
                                href={
                                  c.website.startsWith("http")
                                    ? c.website
                                    : `https://${c.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline inline-flex items-center gap-1"
                              >
                                <span>Website</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              await fetch("/api/workspace/state", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "competitor.delete",
                                  competitorId: c.id,
                                }),
                              });
                              await onRefresh();
                            }}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                          <div>
                            <strong>Product:</strong> {c.product || "N/A"}
                          </div>
                          <div>
                            <strong>Pricing:</strong> {c.pricing || "N/A"}
                          </div>
                          <div>
                            <strong>Funding:</strong> {c.fundingHistory || "N/A"}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/80">
                          <div>
                            <strong className="text-emerald-800">Strengths:</strong>{" "}
                            {c.strengths || "N/A"}
                          </div>
                          <div>
                            <strong className="text-red-800">Weaknesses:</strong>{" "}
                            {c.weaknesses || "N/A"}
                          </div>
                          <div>
                            <strong className="text-[#101A24]">
                              How {startup.name} Differentiates:
                            </strong>{" "}
                            {c.differentiation || "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleAddCompetitor}
                  className="pt-4 border-t border-slate-200 space-y-3 text-xs"
                >
                  <h3 className="font-mono uppercase tracking-wider text-slate-500">
                    + Add Competitor to {startup.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Competitor Name *"
                      value={newCompetitor.name}
                      onChange={(e) =>
                        setNewCompetitor({ ...newCompetitor, name: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Website URL"
                      value={newCompetitor.website}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          website: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Geography (e.g., India / Global)"
                      value={newCompetitor.geography}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          geography: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Funding History & Backers"
                      value={newCompetitor.fundingHistory}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          fundingHistory: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Product Offering"
                      value={newCompetitor.product}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          product: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Pricing Model"
                      value={newCompetitor.pricing}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          pricing: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Competitor Strengths"
                      value={newCompetitor.strengths}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          strengths: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Competitor Weaknesses"
                      value={newCompetitor.weaknesses}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          weaknesses: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={`How ${startup.name} differentiates from this competitor...`}
                      value={newCompetitor.differentiation}
                      onChange={(e) =>
                        setNewCompetitor({
                          ...newCompetitor,
                          differentiation: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded border border-slate-300"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 rounded bg-[#101A24] text-white font-semibold"
                    >
                      Add Competitor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: RESEARCH WORKSPACE, CITATIONS, RISKS & REVIEW WORKFLOW  */}
          {/* ============================================================== */}
          {activeTab === "research" && (
            <div className="space-y-5">
              {/* Assignment & Review Status Banner */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg font-semibold text-slate-900">
                        Structured Research &amp; Evidence Workspace
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded font-mono text-xs uppercase ${
                          research?.status === "approved"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : research?.status === "submitted"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : research?.status === "revision_requested"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {research?.status || "draft"} (v{research?.version || 1})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Primary Researcher:{" "}
                      <strong>{research?.primaryResearcherName || "Unassigned"}</strong>{" "}
                      &bull; Reviewer:{" "}
                      <strong>{research?.reviewerName || "Ravi Kaushik"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveResearch(false)}
                      className="px-3.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800"
                    >
                      Save Research Draft
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveResearch(true)}
                      className="px-4 py-1.5 rounded bg-[#101A24] text-[#F7F5F0] hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C6AD7A]" />
                      <span>Submit Research for Review</span>
                    </button>
                  </div>
                </div>

                {/* Assignment Checklist */}
                {assignment && assignment.checklist.length > 0 && (
                  <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-800">
                      <span>
                        Assignment Checklist: {assignment.title} (Due{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()})
                      </span>
                      <span className="font-mono text-[11px]">
                        {assignment.checklist.filter((c) => c.completed).length}/
                        {assignment.checklist.length} completed
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {assignment.checklist.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded bg-white border border-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={async () => {
                              await fetch("/api/workspace/state", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "assignment.toggle_checklist",
                                  assignmentId: assignment.id,
                                  itemId: item.id,
                                }),
                              });
                              await onRefresh();
                            }}
                          />
                          <span
                            className={
                              item.completed
                                ? "line-through text-slate-400"
                                : "text-slate-800"
                            }
                          >
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviewer Sign-Off & Revision Request Box */}
                {research &&
                  canReviewResearch(currentUser as WorkspaceUser, research) && (
                    <div className="p-4 rounded-md bg-indigo-50/60 border border-indigo-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-indigo-950 uppercase tracking-wider font-mono">
                          Reviewer Sign-Off &amp; Quality Control Panel
                        </strong>
                        <span className="text-[11px] text-indigo-800">
                          Reviewing as {currentUser.name} ({currentUser.role})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Review Feedback / Comments *"
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          className="px-3 py-2 rounded border border-indigo-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Highlight Missing Evidence (Optional)"
                          value={missingEvidence}
                          onChange={(e) => setMissingEvidence(e.target.value)}
                          className="px-3 py-2 rounded border border-indigo-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Request Additional Analysis (Optional)"
                          value={additionalAnalysis}
                          onChange={(e) => setAdditionalAnalysis(e.target.value)}
                          className="px-3 py-2 rounded border border-indigo-200 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={saving || !reviewFeedback.trim()}
                          onClick={() => handleReviewAction("revision_requested")}
                          className="px-3.5 py-1.5 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-40"
                        >
                          Request Revisions
                        </button>
                        {canApproveResearch(
                          currentUser as WorkspaceUser,
                          research
                        ) && (
                          <button
                            type="button"
                            disabled={saving || !reviewFeedback.trim()}
                            onClick={() => handleReviewAction("approved")}
                            className="px-4 py-1.5 rounded bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-40"
                          >
                            ✓ Approve Completed Research
                          </button>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Section I: Overall Research Conclusion */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Section I: Overall Research Conclusion &amp; Founder Questions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Executive Summary (Required to submit for review) *
                    </label>
                    <textarea
                      rows={3}
                      value={conclusionEdit.executiveSummary}
                      onChange={(e) =>
                        setConclusionEdit({
                          ...conclusionEdit,
                          executiveSummary: e.target.value,
                        })
                      }
                      placeholder="Concise synthesis of the opportunity, market, and thesis..."
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Why This Company is Interesting &amp; Promising
                    </label>
                    <textarea
                      rows={3}
                      value={conclusionEdit.whyInteresting}
                      onChange={(e) =>
                        setConclusionEdit({
                          ...conclusionEdit,
                          whyInteresting: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Main Concerns &amp; Missing Information
                    </label>
                    <textarea
                      rows={3}
                      value={conclusionEdit.mainConcerns}
                      onChange={(e) =>
                        setConclusionEdit({
                          ...conclusionEdit,
                          mainConcerns: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Key Questions for Founders
                    </label>
                    <textarea
                      rows={3}
                      value={conclusionEdit.questionsForFounders}
                      onChange={(e) =>
                        setConclusionEdit({
                          ...conclusionEdit,
                          questionsForFounders: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Analyst Recommendation for Next Step
                    </label>
                    <textarea
                      rows={3}
                      value={conclusionEdit.recommendationNextStep}
                      onChange={(e) =>
                        setConclusionEdit({
                          ...conclusionEdit,
                          recommendationNextStep: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section H: Risks & Red Flags Register */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Section H: Risks &amp; Red Flags Register (
                  {research?.risksRedFlags.length || 0})
                </h3>

                {(research?.risksRedFlags || []).length > 0 && (
                  <div className="space-y-2">
                    {research!.risksRedFlags.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                                r.severity === "Critical" || r.severity === "High"
                                  ? "bg-red-100 text-red-900"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {r.severity}
                            </span>
                            <strong className="text-slate-900">{r.category}</strong>
                            <span className="text-slate-400">
                              &bull; Identified by {r.researcherName} ({r.dateIdentified})
                            </span>
                          </div>
                          <p className="text-slate-800 mt-1">{r.description}</p>
                          <div className="text-slate-600 mt-1">
                            <strong>Evidence:</strong> {r.evidence || "N/A"} &bull;{" "}
                            <strong>Mitigation:</strong> {r.mitigation || "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleAddRisk}
                  className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2.5"
                >
                  <select
                    value={newRisk.category}
                    onChange={(e) =>
                      setNewRisk({
                        ...newRisk,
                        category: e.target.value as RiskEntry["category"],
                      })
                    }
                    className="px-2.5 py-2 rounded border border-slate-300 bg-white"
                  >
                    {RISK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newRisk.severity}
                    onChange={(e) =>
                      setNewRisk({
                        ...newRisk,
                        severity: e.target.value as RiskEntry["severity"],
                      })
                    }
                    className="px-2.5 py-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="Low">Low Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="High">High Severity</option>
                    <option value="Critical">Critical Red Flag</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Risk description *"
                    value={newRisk.description}
                    onChange={(e) =>
                      setNewRisk({ ...newRisk, description: e.target.value })
                    }
                    className="px-2.5 py-2 rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Evidence & Mitigation"
                    value={newRisk.mitigation}
                    onChange={(e) =>
                      setNewRisk({ ...newRisk, mitigation: e.target.value })
                    }
                    className="px-2.5 py-2 rounded border border-slate-300"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded bg-[#101A24] text-white font-semibold"
                  >
                    + Log Risk
                  </button>
                </form>
              </div>

              {/* Section 7.3: Research Evidence & Citations */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Verified Research Evidence &amp; Clickable Citations ({sources.length})
                </h3>
                <p className="text-slate-500">
                  Every important research claim must be backed by a source URL, publication date, source type, and confidence classification.
                </p>

                {sources.length > 0 && (
                  <div className="space-y-2">
                    {sources.map((src) => (
                      <div
                        key={src.id}
                        className="p-3 rounded border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-semibold">
                              {src.confidenceLevel}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                              {src.sourceType}
                            </span>
                            <a
                              href={src.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{src.sourceTitle}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          {src.claimSummary && (
                            <p className="text-slate-800">
                              <strong>Claim supported:</strong> {src.claimSummary}
                            </p>
                          )}
                          <div className="text-[11px] text-slate-500">
                            Added by {src.createdByName} &bull; Accessed {src.dateAccessed}
                            {src.analystNotes ? ` • Note: ${src.analystNotes}` : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleAddSource}
                  className="pt-3 border-t border-slate-200 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Source Title *"
                      value={newSource.sourceTitle}
                      onChange={(e) =>
                        setNewSource({ ...newSource, sourceTitle: e.target.value })
                      }
                      className="px-2.5 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Source URL (https://...) *"
                      value={newSource.sourceUrl}
                      onChange={(e) =>
                        setNewSource({ ...newSource, sourceUrl: e.target.value })
                      }
                      className="px-2.5 py-2 rounded border border-slate-300"
                    />
                    <select
                      value={newSource.sourceType}
                      onChange={(e) =>
                        setNewSource({
                          ...newSource,
                          sourceType: e.target.value as SourceType,
                        })
                      }
                      className="px-2.5 py-2 rounded border border-slate-300 bg-white"
                    >
                      {SOURCE_TYPES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newSource.confidenceLevel}
                      onChange={(e) =>
                        setNewSource({
                          ...newSource,
                          confidenceLevel: e.target.value as ConfidenceLevel,
                        })
                      }
                      className="px-2.5 py-2 rounded border border-slate-300 bg-white"
                    >
                      {CONFIDENCE_LEVELS.map((cl) => (
                        <option key={cl} value={cl}>
                          {cl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      placeholder="Claim supported / Analyst notes"
                      value={newSource.claimSummary}
                      onChange={(e) =>
                        setNewSource({
                          ...newSource,
                          claimSummary: e.target.value,
                        })
                      }
                      className="flex-1 px-2.5 py-2 rounded border border-slate-300"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 rounded bg-[#101A24] text-white font-semibold"
                    >
                      + Attach Citation Source
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: INVESTMENT EVALUATION & SCORECARDS (Part 10)            */}
          {/* ============================================================== */}
          {activeTab === "evaluation" && (
            <div className="space-y-5">
              {/* Official Human Decision Panel */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-slate-900">
                      Official Investment Decision Register
                    </h2>
                    <p className="text-xs text-slate-500">
                      Startups are never automatically rejected by a score. Final decisions are always made by an authorised human.
                    </p>
                  </div>
                  {startup.latestDecision && (
                    <span className="px-3 py-1 rounded bg-[#101A24] text-[#C6AD7A] font-mono text-xs font-semibold">
                      Latest: {startup.latestDecision.outcome}
                    </span>
                  )}
                </div>

                {canDecide && (
                  <form
                    onSubmit={handleRecordDecision}
                    className="p-4 rounded bg-slate-50 border border-slate-200 space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Decision Outcome *
                        </label>
                        <select
                          value={decisionOutcome}
                          onChange={(e) =>
                            setDecisionOutcome(e.target.value as DecisionOutcome)
                          }
                          className="w-full px-3 py-2 rounded border border-slate-300 bg-white font-medium"
                        >
                          {DECISION_OUTCOMES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-slate-700 mb-1">
                          Conditions (if Approved Subject to Conditions)
                        </label>
                        <input
                          type="text"
                          value={decisionConditions}
                          onChange={(e) => setDecisionConditions(e.target.value)}
                          placeholder="e.g., Subject to legal DD and customer reference calls"
                          className="w-full px-3 py-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        placeholder="Mandatory written rationale for this investment decision *"
                        className="flex-1 px-3 py-2 rounded border border-slate-300 bg-white"
                      />
                      <button
                        type="submit"
                        disabled={saving || !decisionReason.trim()}
                        className="px-4 py-2 rounded bg-[#101A24] text-[#F7F5F0] font-semibold disabled:opacity-40"
                      >
                        Record Official Decision
                      </button>
                    </div>
                  </form>
                )}

                {startup.decisionHistory.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <h3 className="font-mono uppercase tracking-wider text-slate-400 text-[10px]">
                      Decision History ({startup.decisionHistory.length})
                    </h3>
                    {startup.decisionHistory.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 rounded border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">
                            {d.outcome}
                          </span>{" "}
                          <span className="text-slate-500">
                            ({d.previousStage} &rarr; {d.newStage})
                          </span>
                          <p className="text-slate-700 mt-0.5">{d.reason}</p>
                        </div>
                        <div className="text-right text-[11px] text-slate-500 shrink-0">
                          <div>{d.decidedByName}</div>
                          <div>{new Date(d.decidedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 10-Dimension Evaluation Scorecard */}
              {canEvaluate && (
                <form
                  onSubmit={handleSubmitEvaluation}
                  className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-slate-900">
                        10-Dimension Sector-Agnostic Evaluation Scorecard
                      </h3>
                      <p className="text-slate-500">
                        Rate 1 to 5 per dimension with written justification and supporting evidence.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Weighted Score
                      </span>
                      <strong className="font-serif text-2xl text-[#101A24]">
                        {liveWeightedScore} / 5.00
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {evalScores.map((dim, idx) => (
                      <div
                        key={dim.dimensionId}
                        className="p-3 rounded border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-3">
                          <strong className="text-slate-900 block">
                            {idx + 1}. {dim.dimensionName}
                          </strong>
                          <span className="text-[10px] font-mono text-slate-500">
                            Weight: {dim.weight}%
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <select
                            value={dim.score}
                            onChange={(e) => {
                              const next = [...evalScores];
                              next[idx] = {
                                ...dim,
                                score: Number(e.target.value),
                              };
                              setEvalScores(next);
                            }}
                            className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-semibold"
                          >
                            <option value={1}>1 — Weak</option>
                            <option value={2}>2 — Below Avg</option>
                            <option value={3}>3 — Solid</option>
                            <option value={4}>4 — Strong</option>
                            <option value={5}>5 — Exceptional</option>
                          </select>
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Written justification..."
                            value={dim.justification}
                            onChange={(e) => {
                              const next = [...evalScores];
                              next[idx] = {
                                ...dim,
                                justification: e.target.value,
                              };
                              setEvalScores(next);
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Supporting evidence..."
                            value={dim.evidence}
                            onChange={(e) => {
                              const next = [...evalScores];
                              next[idx] = {
                                ...dim,
                                evidence: e.target.value,
                              };
                              setEvalScores(next);
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Key Strengths"
                      value={evalStrengths}
                      onChange={(e) => setEvalStrengths(e.target.value)}
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Key Weaknesses & Risks"
                      value={evalWeaknesses}
                      onChange={(e) => setEvalWeaknesses(e.target.value)}
                      className="px-3 py-2 rounded border border-slate-300"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">
                        Reviewer Recommendation:
                      </span>
                      <select
                        value={evalRec}
                        onChange={(e) =>
                          setEvalRec(e.target.value as DecisionOutcome)
                        }
                        className="px-3 py-1.5 rounded border border-slate-300 bg-white font-semibold"
                      >
                        {DECISION_OUTCOMES.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded bg-[#101A24] text-white font-semibold"
                    >
                      Submit Evaluation Scorecard
                    </button>
                  </div>
                </form>
              )}

              {/* Submitted Reviewer Evaluations */}
              {evaluations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
                  <h3 className="font-serif text-base font-semibold text-slate-900">
                    Submitted Reviewer Scorecards ({evaluations.length})
                  </h3>
                  {evaluations.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-slate-900">
                          {ev.evaluatorName}
                        </strong>{" "}
                        <span className="text-slate-500">({ev.evaluatorRole})</span>
                        <div className="text-slate-600 mt-1">
                          Strengths: {ev.strengths || "N/A"} &bull; Weaknesses:{" "}
                          {ev.weaknesses || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-lg font-bold text-[#101A24]">
                          {ev.weightedScore} / 5.00
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px]">
                          {ev.recommendation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 9: SECURE DOCUMENT REPOSITORY (Part 14)                    */}
          {/* ============================================================== */}
          {activeTab === "documents" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
              <h2 className="font-serif text-lg font-semibold text-slate-900">
                Secure Document Repository ({documents.length})
              </h2>
              <p className="text-slate-500">
                Private Firebase/GCS Vault with role-based and confidentiality-tiered download controls.
              </p>

              {documents.length === 0 ? (
                <p className="text-slate-400 py-4">
                  No documents uploaded for {startup.name} yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#101A24]" />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {doc.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {doc.category} &bull; Uploaded by {doc.uploadedByName}{" "}
                            &bull; {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                            doc.confidentiality === "confidential"
                              ? "bg-red-100 text-red-900"
                              : doc.confidentiality === "restricted"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {doc.confidentiality}
                        </span>
                        {doc.downloadUrl && doc.downloadUrl !== "#" && (
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded bg-[#101A24] text-white font-medium inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleUploadDocument}
                className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
              >
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g., Q3 Financial Model"
                    className="w-full px-2.5 py-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) =>
                      setDocCategory(e.target.value as DocumentCategory)
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="Pitch Deck">Pitch Deck</option>
                    <option value="Financial Statement">Financial Statement</option>
                    <option value="Business Plan">Business Plan</option>
                    <option value="Market Research">Market Research</option>
                    <option value="Founder Profile">Founder Profile</option>
                    <option value="Due Diligence">Due Diligence</option>
                    <option value="Internal Investment Note">
                      Internal Investment Note
                    </option>
                    <option value="Legal Document">Legal Document</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Confidentiality Tier
                  </label>
                  <select
                    value={docConfidentiality}
                    onChange={(e) =>
                      setDocConfidentiality(
                        e.target.value as ConfidentialityLevel
                      )
                    }
                    className="w-full px-2.5 py-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="standard">Standard (Team)</option>
                    <option value="restricted">Restricted (Assigned)</option>
                    {currentUser.role !== "RESEARCH_ANALYST" && (
                      <option value="confidential">
                        Confidential (Leads &amp; Admins Only)
                      </option>
                    )}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="text-[11px] w-full"
                  />
                  <button
                    type="submit"
                    disabled={!docFile || saving}
                    className="px-3.5 py-2 rounded bg-[#101A24] text-white font-semibold shrink-0 disabled:opacity-40"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 10: STARTUP TASKS                                          */}
          {/* ============================================================== */}
          {activeTab === "tasks" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
              <h2 className="font-serif text-lg font-semibold text-slate-900">
                Startup Tasks &amp; Action Items ({tasks.length})
              </h2>

              <div className="space-y-2">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500">
                        Assigned to: <strong>{t.assignedToName}</strong> &bull; Due:{" "}
                        {new Date(t.dueDate).toLocaleDateString()} &bull; Priority:{" "}
                        {t.priority}
                      </div>
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
                      className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-medium"
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

              <form
                onSubmit={handleCreateTask}
                className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5"
              >
                <input
                  type="text"
                  required
                  placeholder="Task title *"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="px-2.5 py-2 rounded border border-slate-300"
                />
                <select
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
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
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="px-2.5 py-2 rounded border border-slate-300"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-2 rounded bg-[#101A24] text-white font-semibold"
                >
                  + Add Task
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 11: COLLABORATION & @MENTIONS (Part 8)                     */}
          {/* ============================================================== */}
          {activeTab === "collaboration" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
              <h2 className="font-serif text-lg font-semibold text-slate-900">
                Team Discussion &amp; @Mentions ({comments.length})
              </h2>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-slate-400 py-3">
                    No comments yet. Mention team members below to collaborate on {startup.name}.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded border ${
                        c.resolved
                          ? "bg-slate-50 border-slate-200 opacity-75"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{c.authorName}</strong>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                            {c.authorRole}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch("/api/workspace/state", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "comment.resolve",
                                commentId: c.id,
                              }),
                            });
                            await onRefresh();
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            c.resolved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {c.resolved ? "✓ Resolved" : "Mark Resolved"}
                        </button>
                      </div>
                      <p className="text-slate-800 mt-1.5 whitespace-pre-wrap">
                        {c.content}
                      </p>
                      {c.mentionNames.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {c.mentionNames.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-[10px]"
                            >
                              @{m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handlePostComment} className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500">
                    Click to @mention:
                  </span>
                  {dbData.users.map((u) => {
                    const active = selectedMentions.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedMentions((prev) =>
                            prev.includes(u.id)
                              ? prev.filter((id) => id !== u.id)
                              : [...prev, u.id]
                          );
                          if (!commentText.includes(`@${u.name.split(" ")[0]}`)) {
                            setCommentText(
                              (prev) => `${prev} @${u.name.split(" ")[0]} `.trimStart()
                            );
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] border ${
                          active
                            ? "bg-[#101A24] text-white border-[#101A24]"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        @{u.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add internal comment, question, or @mention..."
                    className="flex-1 px-3 py-2 rounded border border-slate-300"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-[#101A24] text-white font-semibold"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 12: ACTIVITY HISTORY                                       */}
          {/* ============================================================== */}
          {activeTab === "activity" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
              <h2 className="font-serif text-lg font-semibold text-slate-900">
                Complete Opportunity Activity Trail ({activityLogs.length})
              </h2>
              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 mr-2">
                        {log.action}
                      </span>
                      <span className="text-slate-800">{log.summary}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* RIGHT-HAND CONTEXTUAL PANEL (Part 12)                            */}
        {/* ================================================================ */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Assigned Team Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
            <h3 className="font-mono uppercase tracking-wider text-slate-400 text-[10px]">
              Assigned Team &amp; Ownership
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Investment Lead:</span>
                <strong className="text-slate-900">
                  {startup.assignedLeadName || "Unassigned"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Primary Researcher:</span>
                <strong className="text-slate-900">
                  {startup.assignedResearcherName || "Unassigned"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reviewer:</span>
                <strong className="text-slate-900">
                  {startup.reviewerName || "Ravi Kaushik"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Next Follow-Up:</span>
                <span className="font-mono text-slate-800">
                  {startup.nextFollowUpAt
                    ? new Date(startup.nextFollowUpAt).toLocaleDateString()
                    : "Not scheduled"}
                </span>
              </div>
            </div>
          </div>

          {/* Contextual Alerts */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
            <h3 className="font-mono uppercase tracking-wider text-slate-400 text-[10px]">
              Opportunity Health &amp; Alerts
            </h3>
            {!research?.marketResearch.tamSource && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Market sizing (TAM) source &amp; methodology not yet verified.
                </span>
              </div>
            )}
            {sources.length === 0 && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>No external citation URLs attached to research yet.</span>
              </div>
            )}
            {research?.status === "submitted" && (
              <div className="p-2.5 rounded bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Research v{research.version} is awaiting reviewer sign-off.
                </span>
              </div>
            )}
            {research?.status === "approved" && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Research approved by {research.approvedByName}. Ready for evaluation.
                </span>
              </div>
            )}
          </div>

          {/* Upcoming Tasks Preview */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-mono uppercase tracking-wider text-slate-400 text-[10px]">
                Open Tasks ({tasks.filter((t) => t.status !== "Completed").length})
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab("tasks")}
                className="text-[11px] text-blue-700 hover:underline"
              >
                View all
              </button>
            </div>
            {tasks.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <span className="truncate font-medium text-slate-800">
                  {t.title}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200">
                  {t.status}
                </span>
              </div>
            ))}
          </div>

          {/* Latest Comments Preview */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-mono uppercase tracking-wider text-slate-400 text-[10px]">
                Latest Team Comments ({comments.length})
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab("collaboration")}
                className="text-[11px] text-blue-700 hover:underline"
              >
                Discuss
              </button>
            </div>
            {comments.slice(-3).map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded bg-slate-50 border border-slate-200"
              >
                <div className="font-semibold text-slate-800">
                  {c.authorName}
                </div>
                <p className="text-slate-600 line-clamp-2 mt-0.5">{c.content}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
