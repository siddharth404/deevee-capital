"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Lock,
  Mail,
  Mic,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Video,
  Trash2,
} from "lucide-react";
import {
  AIInterviewSessionRecord,
  AssessmentQuestion,
  CandidateApplicationStage,
  CandidateRecord,
  CandidateSelectionStatus,
  CompetencyScores,
  RecruitmentModuleState,
  StartupCaseSet,
} from "@/lib/workspace/recruitmentTypes";
import {
  generatePersonalizedInterviewTurns,
  selectCaseSetForCandidate,
} from "@/lib/workspace/aiInterviewEngine";

export type RecruitmentSubTab =
  | "rec-dashboard"
  | "rec-applicants"
  | "rec-profiles"
  | "rec-assessment-centre"
  | "rec-question-bank"
  | "rec-case-studies"
  | "rec-submissions"
  | "rec-evaluation"
  | "rec-interviews"
  | "rec-shortlisting"
  | "rec-emails"
  | "rec-analytics"
  | "rec-settings";

interface RecruitmentModuleViewsProps {
  activeSubTab: RecruitmentSubTab;
  onChangeSubTab: (tab: RecruitmentSubTab) => void;
  currentUserEmail: string;
  currentUserName: string;
}

export const RECRUITMENT_SUBMODULE_NAV: Array<{
  id: RecruitmentSubTab;
  label: string;
  shortLabel: string;
}> = [
  { id: "rec-dashboard", label: "Recruitment Dashboard", shortLabel: "Dashboard" },
  { id: "rec-applicants", label: "Applicants Database (79)", shortLabel: "Applicants (79)" },
  { id: "rec-profiles", label: "Candidate Profiles", shortLabel: "Profiles" },
  { id: "rec-assessment-centre", label: "AI Interview & Proctoring", shortLabel: "AI Interview" },
  { id: "rec-case-studies", label: "Startup Data Room Tasks", shortLabel: "Startup Tasks" },
  { id: "rec-submissions", label: "Transcripts & Submissions", shortLabel: "Submissions" },
  { id: "rec-evaluation", label: "Evaluation & Scoring", shortLabel: "Scoring" },
  { id: "rec-shortlisting", label: "Shortlisting & Leaderboard", shortLabel: "Shortlisting" },
  { id: "rec-interviews", label: "Final Partner Interviews", shortLabel: "Partner Calls" },
  { id: "rec-emails", label: "Email & Invitations", shortLabel: "Invitations" },
  { id: "rec-question-bank", label: "Question Bank", shortLabel: "Question Bank" },
  { id: "rec-analytics", label: "Recruitment Analytics", shortLabel: "Analytics" },
  { id: "rec-settings", label: "Settings & Weights", shortLabel: "Settings" },
];

export default function RecruitmentModuleViews({
  activeSubTab,
  onChangeSubTab,
  currentUserEmail,
  currentUserName,
}: RecruitmentModuleViewsProps) {
  const [recruitment, setRecruitment] = useState<RecruitmentModuleState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyAction, setBusyAction] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Selected candidate for Profile / Evaluation / Email / Simulation
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedCaseSetId, setSelectedCaseSetId] = useState<string>("SET_1_AGRI_SAAS_D2C");

  // Search & Filters for Applicants Database
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [degreeFilter, setDegreeFilter] = useState<string>("ALL");
  const [workExFilter, setWorkExFilter] = useState<string>("ALL");
  const [researchFilter, setResearchFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Workbook Preview Modal State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workbookPreview, setWorkbookPreview] = useState< any | null >(null);

  // Candidate Profile Edit & Comment State
  const [newReviewerComment, setNewReviewerComment] = useState<string>("");
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [editTechSkills, setEditTechSkills] = useState<string>("");
  const [editCertifications, setEditCertifications] = useState<string>("");
  const [editResearchExp, setEditResearchExp] = useState<string>("");

  // Evaluation & Override State
  const [compScores, setCompScores] = useState<CompetencyScores>({
    researchAptitude: 78,
    startupDiscoverySourcing: 80,
    marketBusinessAnalysis: 76,
    financialCommercialUnderstanding: 75,
    criticalThinkingRisk: 82,
    communicationDocumentation: 78,
    interviewOwnership: 80,
  });
  const [evalStrengths, setEvalStrengths] = useState<string>("");
  const [evalConcerns, setEvalConcerns] = useState<string>("");
  const [evalRecommendation, setEvalRecommendation] = useState<
    "Strong Proceed" | "Proceed" | "Hold / Borderline" | "Reject"
  >("Proceed");
  const [overrideScoreInput, setOverrideScoreInput] = useState<string>("");
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>("");

  // Email & Invitation State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-invite-assessment");
  const [emailPreviewData, setEmailPreviewData] = useState<{
    subject: string;
    bodyText: string;
    setupLink: string;
    directLink?: string;
    sampleTestLink?: string;
    password?: string;
    recipientEmail: string;
    candidateName: string;
    candidateCode?: string;
  } | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>(
    currentUserEmail || "siddharth@deeveecapital.com"
  );
  const [adminConfirmedBulkSend, setAdminConfirmedBulkSend] = useState<boolean>(false);
  const [skipAlreadyDelivered, setSkipAlreadyDelivered] = useState<boolean>(true);
  const [singleSendingId, setSingleSendingId] = useState<string | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [isSendingBatch, setIsSendingBatch] = useState<boolean>(false);
  const [rosterFilter, setRosterFilter] = useState<"all" | "uninvited" | "invited" | "shortlisted">("all");
  const [rosterSearch, setRosterSearch] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [customDeadlineInput, setCustomDeadlineInput] = useState<string>("");
  const [isUpdatingDeadline, setIsUpdatingDeadline] = useState<boolean>(false);
  const [individualDeadlineModalCand, setIndividualDeadlineModalCand] = useState<CandidateRecord | null>(null);
  const [individualDeadlineInput, setIndividualDeadlineInput] = useState<string>("");

  const cleanCandidateUrl = (url?: string) => {
    if (!url) return "https://deeveecapital.com/candidate";
    return url
      .replace(/https?:\/\/0\.0\.0\.0(?::\d+)?/gi, "https://deeveecapital.com")
      .replace(/https?:\/\/127\.0\.0\.1(?::\d+)?/gi, "https://deeveecapital.com")
      .replace(/https?:\/\/localhost(?::\d+)?/gi, "https://deeveecapital.com");
  };

  // Stage 5 Interview State
  const [intMeetingLink, setIntMeetingLink] = useState<string>(
    "https://meet.google.com/dvc-iima-defence"
  );
  const [intScore, setIntScore] = useState<number>(82);
  const [intNotes, setIntNotes] = useState<string>("");
  const [intDecision, setIntDecision] = useState<
    "Strong Hire" | "Hire" | "Waitlist" | "No Hire"
  >("Hire");

  // Pre-Generated Candidate Interview Prompts Inspector State
  const [promptInspectorCandidateId, setPromptInspectorCandidateId] = useState<string>("");
  const [copiedPromptId, setCopiedPromptId] = useState<string>("");

  // Submissions & Test Sessions Filter State
  const [submissionFilter, setSubmissionFilter] = useState<"ALL" | "REAL" | "SAMPLE">("ALL");
  const [submissionSearch, setSubmissionSearch] = useState<string>("");

  // Shortlisting Leaderboard Filter State
  const [shortlistingFilter, setShortlistingFilter] = useState<
    "SUBMITTED" | "PENDING" | "FINALISTS" | "ALL"
  >("SUBMITTED");
  const [includeSampleInLeaderboard, setIncludeSampleInLeaderboard] = useState<boolean>(true);
  const [shortlistingSearch, setShortlistingSearch] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const fetchRecruitmentData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/recruitment");
      const data = await res.json();
      if (data.recruitment) {
        setRecruitment(data.recruitment);
        const firstCand = data.recruitment.candidates?.[0];
        if (firstCand) {
          setSelectedCandidateId((prev) => prev || firstCand.id);
        }
        const firstSess = data.recruitment.aiInterviewSessions?.[0];
        if (firstSess) {
          setSelectedSessionId((prev) => prev || firstSess.id);
        }
      }
    } catch (err) {
      setErrorMsg((err as Error).message || "Failed to load recruitment state.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecruitmentData();
  }, [fetchRecruitmentData]);

  const postAction = async (payload: Record<string, unknown>, successToast?: string) => {
    setBusyAction(String(payload.action || "working"));
    setErrorMsg("");
    try {
      const res = await fetch("/api/workspace/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Operation failed.");
        return null;
      }
      if (data.recruitment) {
        setRecruitment(data.recruitment);
      }
      if (successToast) showToast(successToast);
      return data;
    } catch (err) {
      setErrorMsg((err as Error).message);
      return null;
    } finally {
      setBusyAction("");
    }
  };

  const candidates = useMemo(() => recruitment?.candidates || [], [recruitment]);
  const aiSessions = useMemo(
    () => recruitment?.aiInterviewSessions || [],
    [recruitment]
  );
  const startupCaseSets = useMemo(
    () => recruitment?.startupCaseSets || [],
    [recruitment]
  );

  const selectedCandidate = useMemo(
    () =>
      candidates.find((c) => c.id === selectedCandidateId) || candidates[0] || null,
    [candidates, selectedCandidateId]
  );

  const promptInspectorCandidate = useMemo(() => {
    if (promptInspectorCandidateId) {
      return candidates.find((c) => c.id === promptInspectorCandidateId) || null;
    }
    return selectedCandidate || candidates[0] || null;
  }, [candidates, promptInspectorCandidateId, selectedCandidate]);

  const inspectorGeneratedTurns = useMemo(() => {
    if (!promptInspectorCandidate) return [];
    return generatePersonalizedInterviewTurns(promptInspectorCandidate);
  }, [promptInspectorCandidate]);

  const inspectorAssignedCaseSet = useMemo(() => {
    if (!promptInspectorCandidate) return null;
    return selectCaseSetForCandidate(promptInspectorCandidate);
  }, [promptInspectorCandidate]);

  const filteredSessions = useMemo(() => {
    return aiSessions.filter((s) => {
      const isSample =
        s.candidateCode === "DVC-SAMPLE-001" ||
        s.id.includes("sample") ||
        s.candidateEmail.includes("sample");
      if (submissionFilter === "SAMPLE" && !isSample) return false;
      if (submissionFilter === "REAL" && isSample) return false;
      if (submissionSearch.trim()) {
        const q = submissionSearch.trim().toLowerCase();
        const hay = `${s.candidateCode} ${s.candidateName} ${s.candidateEmail} ${s.assignedCaseSetId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [aiSessions, submissionFilter, submissionSearch]);

  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const handleDeleteSession = async (sess: AIInterviewSessionRecord) => {
    const isSample =
      sess.candidateCode === "DVC-SAMPLE-001" ||
      sess.id.includes("sample") ||
      sess.candidateEmail.includes("sample");
    const confirmPrompt = isSample
      ? "Are you sure you want to delete the Sample Sandbox assessment submission? This will clear all recorded responses and reset the sample candidate status."
      : `Are you sure you want to delete the assessment submission for ${sess.candidateName} (${sess.candidateCode})? This will permanently remove their AI interview transcript, virtual data room submissions, and proctoring telemetry, and reset their candidate status to 'In Assessment Funnel'.`;

    if (!window.confirm(confirmPrompt)) {
      return;
    }

    setDeletingSessionId(sess.id);
    try {
      const res = await postAction(
        {
          action: "ai_interview.delete_session",
          sessionId: sess.id,
          candidateId: sess.candidateId,
        },
        `Deleted assessment submission for ${sess.candidateName} (${sess.candidateCode})`
      );
      if (res?.ok || res?.recruitment) {
        if (selectedSessionId === sess.id) {
          const remaining = (res?.recruitment?.aiInterviewSessions || aiSessions).filter(
            (s: AIInterviewSessionRecord) => s.id !== sess.id && s.candidateId !== sess.candidateId
          );
          setSelectedSessionId(remaining[0]?.id || "");
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const submittedCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (c.candidateCode === "DVC-SAMPLE-001" && !includeSampleInLeaderboard) return false;
      return (
        c.assessmentStatus === "Submitted" ||
        c.assessmentStatus === "Evaluated" ||
        c.applicationStatus === "Assessment Submitted" ||
        c.applicationStatus === "Shortlisted for Final Interview" ||
        (c.aiInterviewScore !== null && c.aiInterviewScore !== undefined) ||
        aiSessions.some((s) => s.candidateId === c.id && s.status === "Completed")
      );
    });
  }, [candidates, aiSessions, includeSampleInLeaderboard]);

  const pendingCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (c.candidateCode === "DVC-SAMPLE-001") return false;
      return !(
        c.assessmentStatus === "Submitted" ||
        c.assessmentStatus === "Evaluated" ||
        c.applicationStatus === "Assessment Submitted" ||
        c.applicationStatus === "Shortlisted for Final Interview" ||
        (c.aiInterviewScore !== null && c.aiInterviewScore !== undefined) ||
        aiSessions.some((s) => s.candidateId === c.id && s.status === "Completed")
      );
    });
  }, [candidates, aiSessions]);

  const shortlistedFinalCandidates = useMemo(() => {
    return candidates.filter(
      (c) =>
        c.applicationStatus === "Shortlisted for Final Interview" ||
        c.applicationStatus === "Selected"
    );
  }, [candidates]);

  // Sync edit inputs when selectedCandidate changes
  useEffect(() => {
    if (selectedCandidate) {
      setEditTechSkills(selectedCandidate.technicalSkills || "");
      setEditCertifications(selectedCandidate.certifications || "");
      setEditResearchExp(selectedCandidate.startupResearchExperience || "");
      setCompScores(selectedCandidate.competencyScores);
    }
  }, [selectedCandidate]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return candidates.filter((c) => {
      if (q) {
        const hay = `${c.candidateCode} ${c.fullName} ${c.email} ${c.ugDegree} ${c.ugSpecialisation} ${c.internshipSummary} ${c.certifications} ${c.technicalSkills} ${c.startupResearchExperience}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (degreeFilter !== "ALL") {
        const deg = c.ugDegree.toLowerCase();
        if (degreeFilter === "BTECH" && !/(b\.tech|b\.e)/i.test(deg)) return false;
        if (degreeFilter === "BCOM" && !/b\.com/i.test(deg)) return false;
        if (degreeFilter === "BBA" && !/(b\.b\.a|bba|bms)/i.test(deg)) return false;
        if (degreeFilter === "BSC" && !/b\.sc/i.test(deg)) return false;
      }
      if (workExFilter === "HAS_WORK_EX" && c.totalWorkExMonths <= 0) return false;
      if (workExFilter === "FRESHER" && c.totalWorkExMonths > 0) return false;
      if (researchFilter === "HAS_RESEARCH" && !c.hasSubstantiveResearchExperience)
        return false;
      if (researchFilter === "NO_RESEARCH" && c.hasSubstantiveResearchExperience)
        return false;
      if (statusFilter !== "ALL" && c.applicationStatus !== statusFilter) return false;

      const effectiveScore =
        c.manualScoreOverride ?? c.aiInterviewScore ?? c.finalWeightedScore ?? c.profileScore;
      if (effectiveScore < minScoreFilter) return false;
      return true;
    });
  }, [
    candidates,
    degreeFilter,
    minScoreFilter,
    researchFilter,
    searchQuery,
    statusFilter,
    workExFilter,
  ]);

  const filteredRosterCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (rosterFilter === "uninvited" && (c.inviteStatus === "Sent" || c.inviteStatus === "Accepted")) return false;
      if (rosterFilter === "invited" && c.inviteStatus !== "Sent" && c.inviteStatus !== "Accepted") return false;
      if (rosterFilter === "shortlisted" && c.applicationStatus !== "Shortlisted for Assessment") return false;

      if (rosterSearch.trim()) {
        const q = rosterSearch.toLowerCase();
        const matchName = c.fullName.toLowerCase().includes(q);
        const matchCode = c.candidateCode.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchEmail) return false;
      }
      return true;
    });
  }, [candidates, rosterFilter, rosterSearch]);

  // Upload .xlsx file handler
  const handleFileUploadPreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result || "");
      const res = await postAction({
        action: "workbook.preview",
        fileName: file.name,
        fileBase64: base64,
      });
      if (res?.preview) {
        setWorkbookPreview(res.preview);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading && !recruitment) {
    return (
      <div className="p-10 flex items-center justify-center text-slate-400 text-sm gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
        <span>Loading Investment Recruitment & AI Interview System...</span>
      </div>
    );
  }

  if (!recruitment) return null;

  const totalApplicants = candidates.length;
  const withSubstantiveResearch = candidates.filter(
    (c) => c.hasSubstantiveResearchExperience
  ).length;
  const withWorkEx = candidates.filter((c) => c.totalWorkExMonths > 0).length;
  const shortlistedCount = candidates.filter(
    (c) =>
      c.applicationStatus === "Shortlisted for Assessment" ||
      c.applicationStatus === "In Assessment Funnel" ||
      c.applicationStatus === "Interview Stage" ||
      c.applicationStatus === "Recommended" ||
      c.applicationStatus === "Selected"
  ).length;
  const completedAiInterviews = aiSessions.filter((s) => s.status === "Completed").length;
  const recommendedCount = candidates.filter(
    (c) => c.applicationStatus === "Recommended" || c.applicationStatus === "Selected"
  ).length;

  return (
    <div className="space-y-5">
      {/* SUBMODULE HORIZONTAL PILL BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center gap-1.5 overflow-x-auto">
        {RECRUITMENT_SUBMODULE_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeSubTab(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeSubTab === item.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.shortLabel}
          </button>
        ))}
      </div>

      {/* TOAST & ERROR BANNERS */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
          <button type="button" onClick={() => setToastMsg("")} className="text-emerald-300">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg("")} className="text-rose-300">
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          1. RECRUITMENT DASHBOARD
         ===================================================================== */}
      {activeSubTab === "rec-dashboard" && (
        <div className="space-y-6">
          {/* CAMPAIGN HEADER BANNER */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0E1932] via-[#0F172A] to-[#0B1120] border border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{recruitment.settings.institution} • {recruitment.settings.eligibility}</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {recruitment.settings.roleTitle} — Talent & AI Interview Command Centre
              </h2>
              <p className="text-xs text-slate-300">
                {recruitment.settings.workArrangement} • Stipend: {recruitment.settings.stipend} •{" "}
                {recruitment.settings.workingHours} Hours • Workbook:{" "}
                <span className="font-mono text-blue-300">
                  {recruitment.settings.workbookFileName}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                title="Open candidate portal in sandbox sample mode (isolated from real applicants)"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Open Sample AI Interview Portal (/candidate)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="/api/workspace/export?type=placement_credentials"
                download="Deevee_Capital_Candidate_Credentials_Placement_List.csv"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                title="Download complete Excel / CSV spreadsheet with all 79 candidate IDs, passwords, and links for Placement Committee"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Placement Credentials (.CSV)</span>
              </a>

              <button
                type="button"
                disabled={busyAction !== ""}
                onClick={async () => {
                  const targetCand =
                    candidates.find((c) => c.candidateCode === "DVC-SAMPLE-001") ||
                    candidates.find((c) => c.id === "cand-sample-demo");
                  const res = await postAction(
                    {
                      action: "ai_interview.simulate_demo_candidate",
                      candidateId: targetCand?.id || "cand-sample-demo",
                    },
                    `Simulated full Proctored AI Interview + Startup Data Room Task for ${targetCand?.fullName || "Sample Candidate"} (${targetCand?.candidateCode || "DVC-SAMPLE-001"})`
                  );
                  if (res?.session) {
                    setSelectedSessionId(res.session.id);
                    onChangeSubTab("rec-submissions");
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Completed AI Interview + Task</span>
              </button>

              <a
                href="/api/workspace/recruitment?export=excel"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Excel (.xls)</span>
              </a>

              <a
                href="/api/workspace/recruitment?export=pdf_analytics"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>PDF Report</span>
              </a>
            </div>
          </div>

          {/* 6 KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase">
                Total Applicants
              </div>
              <div className="text-2xl font-bold text-white mt-1">{totalApplicants}</div>
              <div className="text-[11px] text-emerald-400 mt-1">
                100% Verified @iimamritsar.ac.in
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase">
                Prior Research Exp
              </div>
              <div className="text-2xl font-bold text-blue-400 mt-1">
                {withSubstantiveResearch}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {Math.round((withSubstantiveResearch / Math.max(1, totalApplicants)) * 100)}% of cohort
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase">
                Full-Time Work Ex
              </div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{withWorkEx}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                6 to 34 months experience
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase">
                Shortlisted (Stage 1B)
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{shortlistedCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Eligible for 45-Min AI Interview
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase">
                AI Interviews Done
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {completedAiInterviews}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                With Startup Data Room Audit
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase">
                Top Recommended
              </div>
              <div className="text-2xl font-bold text-teal-400 mt-1">{recommendedCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Fast-Track for Final Call
              </div>
            </div>
          </div>

          {/* ===================================================================
              PRE-GENERATED INTERVIEW QUESTIONS INSPECTOR (CANDIDATE PROFILE-BASED)
             =================================================================== */}
          <div className="p-6 rounded-2xl bg-[#0D1527] border border-blue-500/30 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Pre-Generated Interview Prompts Inspector</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Verify AI Questions beforehand for any applicant
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Preview Candidate Interview Questions & Case Assignments
                </h3>
                <p className="text-xs text-slate-300">
                  Inspect the exact questions each candidate will receive before their test. Phase 1 is dynamically personalized to their CV/work experience, Phase 2 tests standardized startup sourcing & VC judgment, and Phase 3 assigns their 3-company virtual data room.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Select Applicant:</span>
                  <select
                    value={promptInspectorCandidate?.id || ""}
                    onChange={(e) => setPromptInspectorCandidateId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-blue-500"
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.candidateCode} — {c.fullName} ({c.ugDegree} • {c.totalWorkExMonths > 0 ? `${c.totalWorkExMonths}m Work-Ex` : "Fresher"})
                      </option>
                    ))}
                  </select>
                </div>

                {promptInspectorCandidate && (
                  <button
                    type="button"
                    onClick={() => {
                      const allText = inspectorGeneratedTurns
                        .map(
                          (t) =>
                            `### Q${t.questionIndex} [${t.phaseLabel}]\nContext: ${t.resumeContextCited}\nQuestion: "${t.questionPrompt}"\nSignals to evaluate:\n${t.expectedSignals.map((s) => `- ${s}`).join("\n")}`
                        )
                        .join("\n\n");
                      navigator.clipboard.writeText(
                        `# Deevee Capital Interview Prompts for ${promptInspectorCandidate.fullName} (${promptInspectorCandidate.candidateCode})\n\n${allText}`
                      );
                      setCopiedPromptId("ALL");
                      setTimeout(() => setCopiedPromptId(""), 3000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedPromptId === "ALL" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied All Questions!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All 6 Questions</span>
                      </>
                    )}
                  </button>
                )}

                {promptInspectorCandidate && (
                  <a
                    href={
                      promptInspectorCandidate.candidateCode === "DVC-SAMPLE-001"
                        ? `/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`
                        : `/candidate?code=${encodeURIComponent(promptInspectorCandidate.candidateCode)}&email=${encodeURIComponent(promptInspectorCandidate.email)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {promptInspectorCandidate.candidateCode === "DVC-SAMPLE-001"
                        ? "Test Sample Candidate Portal"
                        : "Open Candidate Assessment Portal"}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {promptInspectorCandidate && (
              <div className="space-y-4">
                {/* CANDIDATE CONTEXT SNAPSHOT */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Candidate Code & Name</span>
                    <span className="text-white font-bold text-sm">{promptInspectorCandidate.fullName}</span>
                    <div className="font-mono text-blue-400 text-[11px]">{promptInspectorCandidate.candidateCode}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Academic Background</span>
                    <span className="text-slate-200 font-medium">{promptInspectorCandidate.ugDegree} ({promptInspectorCandidate.ugSpecialisation || "General"})</span>
                    <div className="text-slate-400 text-[11px]">Class X: {promptInspectorCandidate.classXPercentage ?? "N/A"}% • XII: {promptInspectorCandidate.classXIIPercentage ?? "N/A"}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Work & Internship Experience</span>
                    <span className="text-slate-200 font-medium">
                      {promptInspectorCandidate.totalWorkExMonths > 0
                        ? `${promptInspectorCandidate.totalWorkExMonths} mos full-time`
                        : "Fresher"}{" "}
                      • {promptInspectorCandidate.internshipSummary}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Assigned Startup Case Set</span>
                    <span className="text-emerald-300 font-semibold">{inspectorAssignedCaseSet?.title || "Indian Tech & Commerce"}</span>
                    <div className="text-slate-400 text-[11px]">{inspectorAssignedCaseSet?.startups?.map((s) => s.name).join(" • ")}</div>
                  </div>
                </div>

                {/* GENERATED QUESTIONS LIST */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* PHASE 1 (PROFILE PERSONALIZED) */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-blue-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <span>Phase 1 • Profile-Personalized Questions (CV Deep-Dive)</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-medium">
                        Tailored to Resume
                      </span>
                    </div>

                    <div className="space-y-3">
                      {inspectorGeneratedTurns.slice(0, 3).map((turn) => (
                        <div key={turn.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-blue-400">Q{turn.questionIndex} • {turn.phaseLabel.replace("Phase 1 • ", "")}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(turn.questionPrompt);
                                setCopiedPromptId(turn.id);
                                setTimeout(() => setCopiedPromptId(""), 2500);
                              }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                            >
                              {copiedPromptId === turn.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                            <strong className="text-slate-300">Cited Context:</strong> {turn.resumeContextCited}
                          </div>
                          <p className="text-slate-100 font-medium leading-relaxed">&ldquo;{turn.questionPrompt}&rdquo;</p>
                          <div className="text-[10px] text-slate-400 pt-1">
                            <strong className="text-slate-300">Signals to Check:</strong> {turn.expectedSignals.join(" • ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PHASE 2 (STANDARDIZED VC THINKING) */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <span>Phase 2 • Standardized Startup Sourcing & VC Judgement</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-medium">
                        Uniform Across All Candidates
                      </span>
                    </div>

                    <div className="space-y-3">
                      {inspectorGeneratedTurns.slice(3, 6).map((turn) => (
                        <div key={turn.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-400">Q{turn.questionIndex} • {turn.phaseLabel.replace("Phase 2 • ", "")}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(turn.questionPrompt);
                                setCopiedPromptId(turn.id);
                                setTimeout(() => setCopiedPromptId(""), 2500);
                              }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                            >
                              {copiedPromptId === turn.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                            <strong className="text-slate-300">Mandate:</strong> {turn.resumeContextCited}
                          </div>
                          <p className="text-slate-100 font-medium leading-relaxed">&ldquo;{turn.questionPrompt}&rdquo;</p>
                          <div className="text-[10px] text-slate-400 pt-1">
                            <strong className="text-slate-300">Signals to Check:</strong> {turn.expectedSignals.join(" • ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WORKBOOK SYNC & PREVIEW CARD + TOP APPLICANTS TABLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Excel Workbook Ingestion & Sync</span>
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                  79 Records Active
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                All 79 rows and 25 columns from{" "}
                <strong className="text-slate-200">
                  DeeVee Capital_IIM Amritsar_Profile Sheet .xlsx
                </strong>{" "}
                are parsed and stored. You can preview the workbook validation report or upload an updated `.xlsx` sheet anytime.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await postAction({ action: "workbook.preview" });
                    if (res?.preview) setWorkbookPreview(res.preview);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Preview Uploaded Workbook</span>
                </button>

                <label className="px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-medium text-blue-300 flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New .xlsx Sheet</span>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileUploadPreview}
                    className="hidden"
                  />
                </label>
              </div>

              {workbookPreview && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/40 space-y-2.5 text-xs">
                  <div className="font-semibold text-blue-300">
                    Workbook Preview: {workbookPreview.fileName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Total Rows Parsed: {workbookPreview.totalRows}</div>
                    <div>Valid Emails: {workbookPreview.validEmailCount}</div>
                    <div>With Research Exp: {workbookPreview.withResearchCount}</div>
                    <div>Duplicates Found: {workbookPreview.duplicateEmails?.length || 0}</div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        await postAction(
                          {
                            action: "workbook.confirm_import",
                            fileName: workbookPreview.fileName,
                            rows: workbookPreview.allRows,
                          },
                          `Confirmed import of ${workbookPreview.totalRows} applicant records.`
                        );
                        setWorkbookPreview(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Confirm & Merge Records
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkbookPreview(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <div className="font-semibold text-slate-300">
                  3-Phase Proctored AI Interview Architecture
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div>
                    • <strong className="text-slate-200">Phase 1 (12m):</strong> 3 personalized questions probing the candidate&apos;s exact internships, work-ex & research claim.
                  </div>
                  <div>
                    • <strong className="text-slate-200">Phase 2 (13m):</strong> 3 VC questions on non-obvious Indian startup sourcing, bottom-up TAM, and cash traps.
                  </div>
                  <div>
                    • <strong className="text-slate-200">Phase 3 (20m):</strong> Interactive 3-Startup Virtual Data Room Deal Triage (₹1 Crore allocation + red-flag audit).
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Top Research & Startup-Ready Candidates (IIM Amritsar Cohort)
                </h3>
                <button
                  type="button"
                  onClick={() => onChangeSubTab("rec-applicants")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All 79 Applicants →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 pr-3">ID & Name</th>
                      <th className="py-2 px-2">UG & Work-Ex</th>
                      <th className="py-2 px-2">Prior Research</th>
                      <th className="py-2 px-2">Score</th>
                      <th className="py-2 pl-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[...candidates]
                      .sort(
                        (a, b) =>
                          (b.manualScoreOverride ??
                            b.aiInterviewScore ??
                            b.finalWeightedScore ??
                            b.profileScore) -
                          (a.manualScoreOverride ??
                            a.aiInterviewScore ??
                            a.finalWeightedScore ??
                            a.profileScore)
                      )
                      .slice(0, 8)
                      .map((c) => {
                        const score =
                          c.manualScoreOverride ??
                          c.aiInterviewScore ??
                          c.finalWeightedScore ??
                          c.profileScore;
                        return (
                          <tr key={c.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 pr-3">
                              <div className="font-mono text-[11px] text-blue-400">
                                {c.candidateCode}
                              </div>
                              <div className="font-semibold text-white">{c.fullName}</div>
                            </td>
                            <td className="py-2.5 px-2 text-slate-300">
                              <div>{c.ugDegree}</div>
                              <div className="text-[11px] text-slate-400">
                                {c.totalWorkExMonths > 0
                                  ? `${c.totalWorkExMonths}m Work-Ex`
                                  : c.internshipSummary.slice(0, 32)}
                              </div>
                            </td>
                            <td className="py-2.5 px-2">
                              {c.hasSubstantiveResearchExperience ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[11px]">
                                  Substantive
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                                  Academic/None
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="font-bold text-white">{score}</span>
                              <span className="text-slate-500">/100</span>
                            </td>
                            <td className="py-2.5 pl-2 text-right space-x-2">
                              {recruitment.aiInterviewSessions?.some(
                                (s) => s.candidateId === c.id || s.candidateCode === c.candidateCode
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const sess = recruitment.aiInterviewSessions?.find(
                                      (s) => s.candidateId === c.id || s.candidateCode === c.candidateCode
                                    );
                                    if (sess) setSelectedSessionId(sess.id);
                                    setSelectedCandidateId(c.id);
                                    onChangeSubTab("rec-submissions");
                                  }}
                                  className="text-emerald-400 hover:underline font-semibold"
                                  title="View submitted interview responses & audit"
                                >
                                  Responses 📝
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCandidateId(c.id);
                                  onChangeSubTab("rec-profiles");
                                }}
                                className="text-blue-400 hover:underline font-medium"
                              >
                                Profile
                              </button>
                              <a
                                href={
                                  c.candidateCode === "DVC-SAMPLE-001"
                                    ? `/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`
                                    : `/candidate?code=${encodeURIComponent(c.candidateCode)}&email=${encodeURIComponent(c.email)}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline font-medium"
                                title={c.candidateCode === "DVC-SAMPLE-001" ? "Open in Sample Sandbox Mode" : "Open Candidate Portal"}
                              >
                                {c.candidateCode === "DVC-SAMPLE-001" ? "Sample Test ↗" : "AI Interview ↗"}
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. APPLICANTS DATABASE (SEARCHABLE & FILTERABLE 79 CANDIDATES)
         ===================================================================== */}
      {activeSubTab === "rec-applicants" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 79 applicants by name, email, UG branch, internship org, NISM/CFA, SQL/PowerBI, or research keywords..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={degreeFilter}
                  onChange={(e) => setDegreeFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="ALL">All UG Degrees</option>
                  <option value="BTECH">B.Tech / B.E.</option>
                  <option value="BCOM">B.Com / B.Com Hons</option>
                  <option value="BBA">BBA / BMS</option>
                  <option value="BSC">B.Sc</option>
                </select>

                <select
                  value={workExFilter}
                  onChange={(e) => setWorkExFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="ALL">All Work Experience</option>
                  <option value="HAS_WORK_EX">Has Full-Time Work-Ex (12)</option>
                  <option value="FRESHER">Fresher (0 Months)</option>
                </select>

                <select
                  value={researchFilter}
                  onChange={(e) => setResearchFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="ALL">All Research Backgrounds</option>
                  <option value="HAS_RESEARCH">Has Startup/Market Research</option>
                  <option value="NO_RESEARCH">No Prior Research Claim</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="ALL">All Selection Statuses</option>
                  <option value="Shortlisted for Assessment">Shortlisted for Assessment</option>
                  <option value="Pending Screening">Pending Screening</option>
                  <option value="In Assessment Funnel">In Assessment Funnel</option>
                  <option value="Recommended">Recommended</option>
                  <option value="Selected">Selected</option>
                  <option value="Waitlisted">Waitlisted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* BULK ACTION BAR */}
            {selectedIds.length > 0 && (
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-blue-200">
                  {selectedIds.length} Candidates Selected
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await postAction(
                        {
                          action: "candidate.bulk_action",
                          candidateIds: selectedIds,
                          bulkType: "provision_ai_interview",
                        },
                        `Provisioned AI Interview access for ${selectedIds.length} candidates.`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                  >
                    Shortlist & Provision AI Interview
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await postAction(
                        {
                          action: "candidate.bulk_action",
                          candidateIds: selectedIds,
                          bulkType: "set_selection_status",
                          applicationStatus: "Recommended",
                        },
                        `Marked ${selectedIds.length} candidates as Recommended.`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold"
                  >
                    Mark Recommended
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span>
                Showing <strong className="text-white">{filteredCandidates.length}</strong> of{" "}
                {candidates.length} IIM Amritsar applicants (Academic % shown as context only; Gender stored strictly for admin reference)
              </span>
              <button
                type="button"
                onClick={() =>
                  setSelectedIds(
                    selectedIds.length === filteredCandidates.length
                      ? []
                      : filteredCandidates.map((c) => c.id)
                  )
                }
                className="text-blue-400 hover:underline"
              >
                {selectedIds.length === filteredCandidates.length
                  ? "Deselect All"
                  : "Select All Shown"}
              </button>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 pr-2">
                    <input
                      type="checkbox"
                      checked={
                        filteredCandidates.length > 0 &&
                        selectedIds.length === filteredCandidates.length
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked ? filteredCandidates.map((c) => c.id) : []
                        )
                      }
                    />
                  </th>
                  <th className="py-2.5 px-2">ID & Candidate</th>
                  <th className="py-2.5 px-2">UG & Specialization</th>
                  <th className="py-2.5 px-2">Internships & Work-Ex</th>
                  <th className="py-2.5 px-2">Skills & Certs</th>
                  <th className="py-2.5 px-2">Startup/Market Research</th>
                  <th className="py-2.5 px-2">Profile / AI Score</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCandidates.map((c) => {
                  const checked = selectedIds.includes(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 pr-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setSelectedIds((prev) =>
                              e.target.checked
                                ? [...prev, c.id]
                                : prev.filter((id) => id !== c.id)
                            )
                          }
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-mono text-[11px] text-blue-400">
                          {c.candidateCode}
                        </div>
                        <div className="font-semibold text-white">{c.fullName}</div>
                        <div className="text-[11px] text-slate-400">{c.email}</div>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-medium text-slate-200">{c.ugDegree}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {c.ugSpecialisation}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Context: X:{c.classXPercentage ?? "-"}% | XII:{c.classXIIPercentage ?? "-"}% | UG:{c.ugPercentage ? Math.round(c.ugPercentage * 10) / 10 : "-"}%
                        </div>
                      </td>
                      <td className="py-2.5 px-2 max-w-[190px]">
                        <div className="text-slate-200 truncate">{c.internshipSummary}</div>
                        <div className="text-[11px] text-indigo-300">
                          {c.totalWorkExMonths > 0
                            ? `${c.totalWorkExMonths} mos (${c.previousOrganisations.slice(0, 2).join(", ")})`
                            : "Fresher"}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 max-w-[170px]">
                        <div className="text-slate-300 truncate" title={c.technicalSkills}>
                          {c.technicalSkills || "—"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate" title={c.certifications}>
                          {c.certifications || "—"}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 max-w-[200px]">
                        {c.hasSubstantiveResearchExperience ? (
                          <div>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold">
                              Yes • Research Exp
                            </span>
                            <div
                              className="text-[11px] text-slate-300 truncate mt-0.5"
                              title={c.startupResearchExperience}
                            >
                              {c.startupResearchExperience}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">No prior claim</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="text-slate-200">
                          Stage 1: <strong className="text-white">{c.profileScore}</strong>/100
                        </div>
                        {c.aiInterviewScore !== null && c.aiInterviewScore !== undefined && (
                          <div className="text-emerald-400 font-semibold text-[11px]">
                            AI Interview: {c.aiInterviewScore}/100
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            c.applicationStatus === "Selected" ||
                            c.applicationStatus === "Recommended"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : c.applicationStatus === "Shortlisted for Assessment"
                              ? "bg-blue-500/20 text-blue-300"
                              : c.applicationStatus === "Rejected"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {c.applicationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right whitespace-nowrap space-x-2">
                        {recruitment.aiInterviewSessions?.some(
                          (s) => s.candidateId === c.id || s.candidateCode === c.candidateCode
                        ) && (
                          <button
                            type="button"
                            onClick={() => {
                              const sess = recruitment.aiInterviewSessions?.find(
                                (s) => s.candidateId === c.id || s.candidateCode === c.candidateCode
                              );
                              if (sess) setSelectedSessionId(sess.id);
                              setSelectedCandidateId(c.id);
                              onChangeSubTab("rec-submissions");
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] inline-flex items-center gap-1 border border-emerald-500/30"
                            title="View submitted interview responses & audit"
                          >
                            <span>Responses 📝</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidateId(c.id);
                            onChangeSubTab("rec-profiles");
                          }}
                          className="text-blue-400 hover:underline font-medium"
                        >
                          View Profile
                        </button>
                        <a
                          href={
                            c.candidateCode === "DVC-SAMPLE-001"
                              ? `/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`
                              : `/candidate?code=${encodeURIComponent(c.candidateCode)}&email=${encodeURIComponent(c.email)}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline font-medium"
                          title={c.candidateCode === "DVC-SAMPLE-001" ? "Open in Sample Sandbox Mode" : "Open Candidate Portal"}
                        >
                          {c.candidateCode === "DVC-SAMPLE-001" ? "Sandbox Portal ↗" : "Portal ↗"}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. CANDIDATE PROFILES (COMPLETE 25-COL RECORD + RESUME AI QUESTIONS)
         ===================================================================== */}
      {activeSubTab === "rec-profiles" && selectedCandidate && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 4 COLS: CANDIDATE PICKER LIST */}
          <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 max-h-[780px] overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Applicant ({candidates.length})
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter candidate list..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
            />
            <div className="space-y-1.5">
              {filteredCandidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition text-xs flex items-center justify-between ${
                    c.id === selectedCandidate.id
                      ? "bg-blue-950/60 border-blue-500/50 text-white"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-mono text-[10px] text-blue-400">
                      {c.candidateCode} • {c.ugDegree}
                    </div>
                    <div className="font-semibold truncate">{c.fullName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-white">
                      {c.aiInterviewScore ?? c.profileScore}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {c.hasSubstantiveResearchExperience ? "Research ✓" : "Context"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT 8 COLS: FULL CANDIDATE DOSSIER & PERSONALIZED AI INTERVIEW QUESTIONS */}
          <div className="lg:col-span-8 space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                      {selectedCandidate.candidateCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedCandidate.institution} • {selectedCandidate.cohortProgram}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {selectedCandidate.fullName}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedCandidate.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedCandidate.applicationStatus}
                    onChange={async (e) => {
                      await postAction(
                        {
                          action: "candidate.update",
                          candidateId: selectedCandidate.id,
                          updates: { applicationStatus: e.target.value },
                        },
                        `Updated status for ${selectedCandidate.fullName}`
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white"
                  >
                    <option value="In Assessment Funnel">In Assessment Funnel</option>
                    <option value="Assessment Submitted">Assessment Submitted</option>
                    <option value="Shortlisted for Final Interview">Shortlisted for Final Interview</option>
                    <option value="Pending Screening">Pending Screening</option>
                    <option value="Interview Stage">Interview Stage</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Selected">Selected</option>
                    <option value="Waitlisted">Waitlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  {recruitment.aiInterviewSessions?.some(
                    (s) =>
                      s.candidateId === selectedCandidate.id ||
                      s.candidateCode === selectedCandidate.candidateCode
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        const sess = recruitment.aiInterviewSessions?.find(
                          (s) =>
                            s.candidateId === selectedCandidate.id ||
                            s.candidateCode === selectedCandidate.candidateCode
                        );
                        if (sess) setSelectedSessionId(sess.id);
                        onChangeSubTab("rec-submissions");
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Submitted Responses 📝</span>
                    </button>
                  )}

                  {recruitment.aiInterviewSessions?.some(
                    (s) =>
                      s.candidateId === selectedCandidate.id ||
                      s.candidateCode === selectedCandidate.candidateCode
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        const sess = recruitment.aiInterviewSessions?.find(
                          (s) =>
                            s.candidateId === selectedCandidate.id ||
                            s.candidateCode === selectedCandidate.candidateCode
                        );
                        if (sess) void handleDeleteSession(sess);
                      }}
                      disabled={deletingSessionId !== null}
                      className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      title="Delete assessment submission and reset candidate status"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete Response 🗑️</span>
                    </button>
                  )}

                  <a
                    href={
                      selectedCandidate.candidateCode === "DVC-SAMPLE-001"
                        ? `/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com`
                        : `/candidate?code=${encodeURIComponent(selectedCandidate.candidateCode)}&email=${encodeURIComponent(selectedCandidate.email)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    title={
                      selectedCandidate.candidateCode === "DVC-SAMPLE-001"
                        ? "Launch candidate portal in always-ready sample sandbox mode"
                        : "Open official candidate assessment portal"
                    }
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {selectedCandidate.candidateCode === "DVC-SAMPLE-001"
                        ? "Launch AI Interview (Sample Mode)"
                        : "Open Candidate Portal"}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{editingProfile ? "Cancel Edit" : "Edit Record"}</span>
                  </button>
                </div>
              </div>

              {/* STAGE 1 PROFILE BREAKDOWN */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Stage 1 Non-Academic Profile Evaluation ({selectedCandidate.profileScore}/100)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Academics Capped at 5/100 • Gender Excluded from Scoring
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Research Signal</div>
                    <div className="text-sm font-bold text-white">
                      {selectedCandidate.stage1ProfileBreakdown.researchExperienceScore}/30
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Startup Exposure</div>
                    <div className="text-sm font-bold text-white">
                      {selectedCandidate.stage1ProfileBreakdown.startupCommercialExposureScore}/20
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Analytical Toolkit</div>
                    <div className="text-sm font-bold text-white">
                      {selectedCandidate.stage1ProfileBreakdown.analyticalTechnicalToolkitScore}/20
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Ownership & Work</div>
                    <div className="text-sm font-bold text-white">
                      {selectedCandidate.stage1ProfileBreakdown.ownershipInitiativeScore}/20
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Comm & Context</div>
                    <div className="text-sm font-bold text-white">
                      {selectedCandidate.stage1ProfileBreakdown.communicationAcademicContextScore}/10
                    </div>
                  </div>
                </div>
              </div>

              {/* EDITABLE OR VIEW MODE FOR PROFILE FIELDS */}
              {editingProfile ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-3 text-xs">
                  <div className="font-semibold text-blue-300">
                    Administrator Profile Editor
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Technical Skills</label>
                    <textarea
                      rows={2}
                      value={editTechSkills}
                      onChange={(e) => setEditTechSkills(e.target.value)}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Certifications</label>
                    <textarea
                      rows={2}
                      value={editCertifications}
                      onChange={(e) => setEditCertifications(e.target.value)}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Startup / Market Research Experience
                    </label>
                    <textarea
                      rows={3}
                      value={editResearchExp}
                      onChange={(e) => setEditResearchExp(e.target.value)}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await postAction(
                        {
                          action: "candidate.update",
                          candidateId: selectedCandidate.id,
                          recalculateProfileScore: true,
                          updates: {
                            technicalSkills: editTechSkills,
                            certifications: editCertifications,
                            startupResearchExperience: editResearchExp,
                          },
                        },
                        "Saved candidate profile updates and recalculated Stage 1 score."
                      );
                      setEditingProfile(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
                  >
                    Save Profile Changes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-slate-400 uppercase text-[11px]">
                      Academic & Administrative Context
                    </div>
                    <div>
                      <span className="text-slate-400">UG Degree & Branch: </span>
                      <span className="text-white font-medium">
                        {selectedCandidate.ugDegree} — {selectedCandidate.ugSpecialisation}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Contextual Percentages: </span>
                      <span className="text-slate-200">
                        Class X: {selectedCandidate.classXPercentage ?? "N/A"}% | Class XII:{" "}
                        {selectedCandidate.classXIIPercentage ?? "N/A"}% | UG:{" "}
                        {selectedCandidate.ugPercentage
                          ? Math.round(selectedCandidate.ugPercentage * 100) / 100
                          : "N/A"}
                        %
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Gender (Admin Ref Only): </span>
                      <span className="text-slate-300">{selectedCandidate.gender}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-slate-400 uppercase text-[11px]">
                      Internships & Full-Time Experience
                    </div>
                    <div>
                      <span className="text-slate-400">Internships: </span>
                      <span className="text-white font-medium">
                        {selectedCandidate.internshipSummary}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Full-Time Work Ex: </span>
                      <span className="text-slate-200">
                        {selectedCandidate.totalWorkExMonths} months{" "}
                        {selectedCandidate.workExperiences.length > 0
                          ? `(${selectedCandidate.workExperiences
                              .map((w) => `${w.designation} @ ${w.organization}`)
                              .join("; ")})`
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-slate-400 uppercase text-[11px]">
                      Certifications, Achievements & Other Qualifications
                    </div>
                    <div>
                      <span className="text-slate-400">Certifications: </span>
                      <span className="text-slate-200">
                        {selectedCandidate.certifications || "None listed"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Achievements: </span>
                      <span className="text-slate-200">
                        {selectedCandidate.achievements || "None listed"}
                      </span>
                    </div>
                    {selectedCandidate.otherQualifications && (
                      <div>
                        <span className="text-slate-400">Other Qualifications: </span>
                        <span className="text-amber-300">
                          {selectedCandidate.otherQualifications}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-slate-400 uppercase text-[11px]">
                      Technical Skills & Tools (Google Form Response 1)
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {selectedCandidate.technicalSkills || "None listed"}
                    </p>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1.5">
                    <div className="font-semibold text-blue-300 uppercase text-[11px]">
                      Verbatim Startup & Market Research Experience (Google Form Response 2)
                    </div>
                    <p className="text-slate-100 leading-relaxed whitespace-pre-line">
                      {selectedCandidate.startupResearchExperience || "No"}
                    </p>
                  </div>
                </div>
              )}

              {/* DYNAMICALLY GENERATED AI RESUME INTERVIEW QUESTIONS FOR THIS CANDIDATE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>
                      Personalized AI Interview Questions Auto-Generated from{" "}
                      {selectedCandidate.fullName}&apos;s Resume
                    </span>
                  </span>
                </div>
                <div className="space-y-2">
                  {generatePersonalizedInterviewTurns(selectedCandidate).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-blue-400">
                          Q{t.questionIndex} • {t.phaseLabel}
                        </span>
                        <span className="text-slate-400 truncate max-w-[320px]">
                          {t.resumeContextCited}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">&ldquo;{t.questionPrompt}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVIEWER COMMENTS */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Reviewer Notes & Comments
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReviewerComment}
                    onChange={(e) => setNewReviewerComment(e.target.value)}
                    placeholder="Add an internal evaluation note for this candidate..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newReviewerComment.trim()) return;
                      await postAction(
                        {
                          action: "candidate.update",
                          candidateId: selectedCandidate.id,
                          newComment: newReviewerComment,
                        },
                        "Added reviewer note."
                      );
                      setNewReviewerComment("");
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                  >
                    Add Note
                  </button>
                </div>
                {selectedCandidate.reviewerComments.map((rc) => (
                  <div
                    key={rc.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-blue-300">{rc.authorName}</span>
                      <span>{new Date(rc.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-slate-200">{rc.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. AI INTERVIEW & PROCTORING CONTROL CENTRE
         ===================================================================== */}
      {activeSubTab === "rec-assessment-centre" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Stage 1B • Interview-First Architecture
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Proctored AI Interview & Startup Simulation Control Room
                </h2>
                <p className="text-xs text-slate-400">
                  Every candidate completes a 45-minute proctored session combining personalized CV verification, VC thinking, and a live 3-startup Data Room deal triage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  title="Open candidate portal in sandbox sample mode (isolated from real applicants)"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Preview Candidate Experience (Sample Mode)</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-blue-400 uppercase">
                  Phase 1 • 7 Minutes (20% Weight)
                </div>
                <div className="text-sm font-semibold text-white">
                  Personalized Resume & Research Probe
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reads each applicant&apos;s exact internships, work experience, and profile claim to generate 3 bespoke verification questions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-400 uppercase">
                  Phase 2 • 8 Minutes (20% Weight)
                </div>
                <div className="text-sm font-semibold text-white">
                  Startup Discovery & VC Mindset
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tests non-obvious Indian startup sourcing channels, bottom-up TAM calculation, independent traction verification, and commercial scepticism.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase">
                  Phase 3 • 10 Minutes (60% Weight)
                </div>
                <div className="text-sm font-semibold text-white">
                  Interactive 3-Startup Virtual Data Room
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Presents 3 dummy Indian startups seeking ₹1 Cr with financial tables & footnotes. Candidate must expose ARR/RTO traps and allocate ₹1 Crore.
                </p>
              </div>
            </div>

            {/* QUICK SIMULATOR BAR */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-indigo-200">
                  Test the Automated Grading & Proctoring Engine on Any Applicant
                </div>
                <div className="text-slate-400">
                  Select any applicant profile to preview their personalized Phase 1 questions and Phase 2 startup evaluation prompts.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.candidateCode} — {c.fullName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await postAction(
                      {
                        action: "ai_interview.simulate_demo_candidate",
                        candidateId: selectedCandidateId,
                      },
                      "Generated completed AI Interview + Startup Simulation session!"
                    );
                    if (res?.session) {
                      setSelectedSessionId(res.session.id);
                      onChangeSubTab("rec-submissions");
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Simulate & Grade Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. STARTUP DATA ROOM TASKS (3 ROTATING DUMMY INDIAN STARTUP CASE SETS)
         ===================================================================== */}
      {activeSubTab === "rec-case-studies" && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Phase 3 • Interactive Virtual Data Room Case Sets
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Rotating Indian Startup Deal Triage Datasets (With Ground-Truth Trap Keys)
              </h2>
              <p className="text-xs text-slate-400">
                Candidates automatically receive one of these 3 case sets based on their candidate serial number so hostel peers cannot share answers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {startupCaseSets.map((cs) => (
                <button
                  key={cs.id}
                  type="button"
                  onClick={() => setSelectedCaseSetId(cs.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCaseSetId === cs.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-950 text-slate-300 border border-slate-800"
                  }`}
                >
                  {cs.title.split("—")[0]}
                </button>
              ))}
            </div>
          </div>

          {startupCaseSets
            .filter((cs) => cs.id === selectedCaseSetId)
            .map((cs) => (
              <div key={cs.id} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {cs.startups.map((st) => (
                    <div
                      key={st.id}
                      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                            {st.code.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.groundTruthClassification === "BEST_INVESTMENT_CANDIDATE"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {st.groundTruthClassification.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white">{st.name}</h3>
                          <p className="text-xs text-slate-400">
                            {st.sector} • {st.cityAndStage}
                          </p>
                          <p className="text-xs font-semibold text-emerald-400 mt-1">
                            Ask: {st.askAmountINR} @ {st.proposedValuationINR}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 italic">
                          {st.founderHeadlineClaim}
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[11px] font-semibold uppercase text-slate-400">
                            Data Room Ledger vs Deck
                          </div>
                          {st.financialMetricsTable.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]"
                            >
                              <div className="font-semibold text-white">{m.metric}</div>
                              <div className="text-slate-400">Deck: {m.founderDeckValue}</div>
                              <div className="text-blue-300 font-medium">
                                Verified: {m.dataRoomVerifiedValue}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-1 mt-3">
                        <div className="font-semibold text-rose-300 text-[11px] uppercase">
                          Server-Side Ground Truth Key (Hidden from Candidate)
                        </div>
                        <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                          {st.hiddenRedFlags.map((rf, i) => (
                            <li key={i}>{rf}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* =====================================================================
          6. CANDIDATE SUBMISSIONS (AI INTERVIEW TRANSCRIPTS, PROCTORING & TASK AUDITS)
         ===================================================================== */}
      {activeSubTab === "rec-submissions" && (
        <div className="space-y-5">
          {/* SUBMISSIONS TOP BAR & SAMPLE TEST INSPECTION */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Dossier & Response Audits
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  AI Interview Transcripts & Virtual Data Room Submissions
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect completed candidate responses across Phase 1 (Resume Probe), Phase 2 (Startup Judgement), Phase 3 (₹1 Cr Deal Triage), and proctoring integrity snapshots.
                </p>
              </div>

              {/* QUICK ACTIONS: SEND RESUME EMAIL TO IN-PROGRESS & INSPECT SAMPLE */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await postAction(
                      {
                        action: "email.auto_nudge_in_progress",
                        force: true,
                      },
                      "Dispatched continuation & resume emails to all in-progress candidates!"
                    );
                    if (res?.sentCount !== undefined) {
                      showToast(
                        `Sent ${res.sentCount} continuation resume email(s) via siddharth@deeveecapital.com!`
                      );
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-950/40 transition"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Send Resume Email to In-Progress (
                    {
                      aiSessions.filter(
                        (s) =>
                          s.status !== "Completed" &&
                          s.candidateCode !== "DVC-SAMPLE-001" &&
                          !s.id.includes("sample")
                      ).length
                    }
                    )
                  </span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const sampleSess = aiSessions.find(
                      (s) =>
                        s.candidateCode === "DVC-SAMPLE-001" ||
                        s.id.includes("sample") ||
                        s.candidateEmail.includes("sample")
                    );
                    if (sampleSess) {
                      setSelectedSessionId(sampleSess.id);
                      setSubmissionFilter("ALL");
                      showToast("Inspecting Sample Candidate (DVC-SAMPLE-001) test responses!");
                    } else {
                      const sampleCand = candidates.find(
                        (c) => c.candidateCode === "DVC-SAMPLE-001"
                      );
                      const res = await postAction(
                        {
                          action: "ai_interview.simulate_demo_candidate",
                          candidateId: sampleCand?.id || "cand-sample-demo",
                        },
                        "Loaded complete Sample Test submission for DVC-SAMPLE-001!"
                      );
                      if (res?.session) {
                        setSelectedSessionId(res.session.id);
                      }
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Inspect Sample Test Submission (DVC-SAMPLE-001)</span>
                </button>
              </div>
            </div>

            {/* FILTER PILLS & SEARCH */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "ALL", label: `All Submissions (${aiSessions.length})` },
                  {
                    key: "REAL",
                    label: `Real Candidates (${aiSessions.filter((s) => s.candidateCode !== "DVC-SAMPLE-001" && !s.id.includes("sample")).length})`,
                  },
                  {
                    key: "SAMPLE",
                    label: `Sample & Test Sessions (${aiSessions.filter((s) => s.candidateCode === "DVC-SAMPLE-001" || s.id.includes("sample")).length})`,
                  },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSubmissionFilter(f.key as "ALL" | "REAL" | "SAMPLE")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      submissionFilter === f.key
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  placeholder="Search name, code, case set..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
              <Video className="w-8 h-8 text-blue-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                No Submissions Match Current Filter
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No completed interview sessions match your search or filter. You can switch to All Submissions or inspect the Sample Test Submission.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmissionFilter("ALL");
                  setSubmissionSearch("");
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 4 COLS: SESSION LIST */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span>Submissions ({filteredSessions.length})</span>
                  <span className="text-[11px] text-slate-500 font-normal">Select to inspect</span>
                </div>
                {filteredSessions.map((s) => {
                  const isSample =
                    s.candidateCode === "DVC-SAMPLE-001" ||
                    s.id.includes("sample") ||
                    s.candidateEmail.includes("sample");
                  const isSelected = s.id === (selectedSessionId || filteredSessions[0]?.id);
                  const answeredCount = (s.turns || []).filter(
                    (t) => t.candidateAnswer && t.candidateAnswer.trim().length > 0
                  ).length;
                  const liveScore = s.scoringBreakdown?.overallAiInterviewScore;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition space-y-1.5 ${
                        isSelected
                          ? isSample
                            ? "bg-cyan-950/40 border-cyan-500/60 text-white"
                            : "bg-blue-950/60 border-blue-500/60 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-blue-400 font-bold">
                            {s.candidateCode}
                          </span>
                          {isSample && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-sans font-semibold border border-cyan-500/30">
                              Sandbox
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : liveScore !== undefined
                              ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {s.status === "Completed"
                            ? `Score: ${liveScore ?? "—"}/100`
                            : liveScore !== undefined
                            ? `Score: ${liveScore}/100 (${answeredCount}/6 Qs)`
                            : `Started (${answeredCount}/6 Qs)`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-white truncate">{s.candidateName}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteSession(s);
                          }}
                          disabled={deletingSessionId === s.id}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0 ml-1"
                          title={`Delete submission for ${s.candidateName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span className="truncate max-w-[130px]">{s.assignedCaseSetId}</span>
                        <span className="font-mono text-emerald-400">
                          🛡️ {s.proctoring.integrityScore}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* RIGHT 8 COLS: FULL TRANSCRIPT, STARTUP TASK SCORECARD & PROCTORING LOG */}
              {(() => {
                const sess =
                  aiSessions.find((s) => s.id === selectedSessionId) || filteredSessions[0] || aiSessions[0];
                if (!sess) return null;
                const sb = sess.scoringBreakdown;
                const isSampleSess =
                  sess.candidateCode === "DVC-SAMPLE-001" ||
                  sess.id.includes("sample") ||
                  sess.candidateEmail.includes("sample");
                const targetCand = candidates.find(
                  (c) => c.id === sess.candidateId || c.candidateCode === sess.candidateCode
                );

                return (
                  <div className="lg:col-span-8 space-y-5">
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-blue-400 font-bold">
                              {sess.candidateCode}
                            </span>
                            {isSampleSess ? (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-sans font-semibold border border-cyan-500/30">
                                Sandbox Test Mode
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-sans font-semibold border border-blue-500/30">
                                Real Candidate Submission
                              </span>
                            )}
                            {sess.status !== "Completed" && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-sans font-semibold border border-amber-500/30">
                                In Progress ({sess.status})
                              </span>
                            )}
                            {sess.continuationEmailSentAt && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-sans font-semibold border border-emerald-500/30">
                                Resume Email Sent ✓
                              </span>
                            )}
                            <span className="text-xs text-slate-500">• {sess.assignedCaseSetId}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">{sess.candidateName}</h3>
                          <p className="text-xs text-slate-400">{sess.candidateEmail}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          {sb && (
                            <div className="text-right">
                              <div className="text-[11px] text-slate-400">
                                {sess.status === "Completed"
                                  ? "Overall AI Interview + Task Score"
                                  : "Live / Provisional Score (Answered Turns)"}
                              </div>
                              <div className="text-2xl font-bold text-emerald-400">
                                {sess.reviewerOverrideScore ?? sb.overallAiInterviewScore}/100
                              </div>
                              <div className="text-[11px] text-blue-300 font-medium">
                                {targetCand?.applicationStatus || sb.recommendedNextStep}
                              </div>
                            </div>
                          )}
                          {sess.status !== "Completed" && !isSampleSess && (
                            <button
                              type="button"
                              onClick={async () => {
                                await postAction(
                                  {
                                    action: "email.send_continuation_reminder",
                                    candidateId: sess.candidateId,
                                    force: true,
                                  },
                                  `Sent continuation resume email to ${sess.candidateName} (${sess.candidateEmail})!`
                                );
                              }}
                              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-sm"
                              title="Send 1-click resume link & credentials to help student continue from where they left off"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-400" />
                              <span>Send Resume Email</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleDeleteSession(sess)}
                            disabled={deletingSessionId === sess.id}
                            className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-sm"
                            title="Delete this assessment submission and reset candidate status"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>{deletingSessionId === sess.id ? "Deleting..." : "Delete Response"}</span>
                          </button>
                        </div>
                      </div>

                      {/* SAMPLE SANDBOX BANNER */}
                      {isSampleSess && (
                        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-200">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>
                              <strong>Sample Sandbox Assessment Dossier:</strong> Complete responses, Deal Triage audits, and proctoring telemetry for DVC-SAMPLE-001. Use this to verify evaluation rubrics before shortlisting live applicants.
                            </span>
                          </div>
                          <a
                            href="/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-xs font-semibold whitespace-nowrap border border-cyan-500/30"
                          >
                            Retake in Sandbox ↗
                          </a>
                        </div>
                      )}

                      {/* 5-PART RUBRIC SCORE BREAKDOWN */}
                      {sb && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Phase 1: Resume</div>
                              <div className="text-sm font-bold text-white">
                                {sb.phase1ResumeProbeScore}/100
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Phase 2: Startup</div>
                              <div className="text-sm font-bold text-white">
                                {sb.phase2StartupThinkingScore}/100
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Task 1: Red Flags</div>
                              <div className="text-sm font-bold text-emerald-400">
                                {sb.phase3Task1RedFlagAuditScore}/100
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Task 2: ₹1Cr Pick</div>
                              <div className="text-sm font-bold text-emerald-400">
                                {sb.phase3Task2CapitalAllocationScore}/100
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Task 3: Diligence</div>
                              <div className="text-sm font-bold text-blue-400">
                                {sb.phase3Task3RiskAndFounderQuestionsScore}/100
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                              Picked Correct Winner:{" "}
                              <strong
                                className={
                                  sb.pickedCorrectWinningStartup
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }
                              >
                                {sb.pickedCorrectWinningStartup ? "YES ✓" : "NO ✗"}
                              </strong>
                            </div>
                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                              Caught ARR Inflation Trap:{" "}
                              <strong
                                className={
                                  sb.caughtFreeTrialArrTrap
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }
                              >
                                {sb.caughtFreeTrialArrTrap ? "YES ✓" : "NO ✗"}
                              </strong>
                            </div>
                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                              Caught RTO/CAC Trap:{" "}
                              <strong
                                className={
                                  sb.caughtUnitEconomicsRtoTrap
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }
                              >
                                {sb.caughtUnitEconomicsRtoTrap ? "YES ✓" : "NO ✗"}
                              </strong>
                            </div>
                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                              Spotted Debtor/Conc Risk:{" "}
                              <strong
                                className={
                                  sb.identifiedWorkingCapitalRisk
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }
                              >
                                {sb.identifiedWorkingCapitalRisk ? "YES ✓" : "NO ✗"}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PROCTORING TELEMETRY SUMMARY */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              Proctoring Integrity Score: {sess.proctoring.integrityScore}% (
                              {sess.proctoring.integrityStatus})
                            </span>
                          </span>
                          <span className="text-slate-400">
                            Tab Switches: {sess.proctoring.tabSwitchCount} | Fullscreen Exits:{" "}
                            {sess.proctoring.fullscreenExitCount} | Paste Blocked:{" "}
                            {sess.proctoring.copyPasteBlockedCount} | Snapshots:{" "}
                            {(sess.proctoring.snapshots || []).length}
                          </span>
                        </div>

                        {sess.proctoring.snapshots && sess.proctoring.snapshots.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                              Recorded Proctoring Snapshots ({sess.proctoring.snapshots.length})
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                              {sess.proctoring.snapshots.map((snap, sIdx) => (
                                <div
                                  key={snap.id || sIdx}
                                  className="shrink-0 rounded-lg border border-slate-800 overflow-hidden bg-black text-[10px]"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={snap.dataUrl}
                                    alt={`Snapshot ${sIdx + 1}`}
                                    className="w-28 h-16 object-cover"
                                  />
                                  <div className="p-1 text-slate-400 truncate w-28 text-[9px]">
                                    {snap.type === "screen" ? "🖥️ Screen" : "📷 Camera"} •{" "}
                                    {new Date(snap.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PHASE 3 STARTUP DATA ROOM SUBMISSION */}
                      {sess.startupTaskSubmission && (
                        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2.5 text-xs">
                          <div className="font-bold text-blue-300 uppercase tracking-wider">
                            Phase 3: Startup Virtual Data Room Deal Triage Submission
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold">
                              Startup B Discrepancy Audit:{" "}
                            </span>
                            <span className="text-slate-200">
                              {sess.startupTaskSubmission.startupBTrueMetricAnalysis}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold">
                              Startup C Unit Economics Audit:{" "}
                            </span>
                            <span className="text-slate-200">
                              {sess.startupTaskSubmission.startupCTrueMetricAnalysis}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-semibold">
                              ₹1 Crore Allocation Thesis:{" "}
                            </span>
                            <span className="text-slate-100">
                              {sess.startupTaskSubmission.investmentThesisAndNumbers}
                            </span>
                          </div>
                          <div>
                            <span className="text-amber-300 font-semibold">
                              Winning Startup #1 Risk:{" "}
                            </span>
                            <span className="text-slate-200">
                              {sess.startupTaskSubmission.winningStartupPrimaryRisk}
                            </span>
                          </div>
                          <div>
                            <span className="text-indigo-300 font-semibold block">
                              3 Founder Diligence Questions:
                            </span>
                            <p className="text-slate-200 whitespace-pre-line mt-0.5">
                              {sess.startupTaskSubmission.threeFounderDiligenceQuestions}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* PHASE 1 & 2 TRANSCRIPT */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Phase 1 (Resume Probe) & Phase 2 (Startup Thinking) Verbatim Transcript
                        </div>
                        {sess.turns.map((t) => (
                          <div
                            key={t.id}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-blue-400">
                                Q{t.questionIndex} ({t.phaseLabel})
                              </span>
                              <span className="text-emerald-400 font-bold">
                                Turn Score: {t.turnScore ?? "—"}/100
                              </span>
                            </div>
                            <div className="text-slate-300 font-medium">
                              &ldquo;{t.questionPrompt}&rdquo;
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 leading-relaxed">
                              {t.candidateAnswer || "No answer recorded."}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* QUICK SHORTLISTING ACTIONS FOR REVIEWER */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Assessment Decision For {sess.candidateName}
                          </span>
                          <div className="text-xs text-white font-medium mt-0.5">
                            Current Status:{" "}
                            <span className="font-semibold text-blue-300">
                              {targetCand?.applicationStatus || "Assessment Submitted"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await postAction(
                                {
                                  action: "candidate.update",
                                  candidateId: sess.candidateId,
                                  updates: { applicationStatus: "Shortlisted for Final Interview" },
                                },
                                `Shortlisted ${sess.candidateName} for Final Partner Interview!`
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Shortlist for Final Interview</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await postAction(
                                {
                                  action: "candidate.update",
                                  candidateId: sess.candidateId,
                                  updates: { applicationStatus: "Waitlisted" },
                                },
                                `Moved ${sess.candidateName} to Waitlist`
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold text-xs"
                          >
                            Waitlist
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await postAction(
                                {
                                  action: "candidate.update",
                                  candidateId: sess.candidateId,
                                  updates: { applicationStatus: "Rejected" },
                                },
                                `Marked ${sess.candidateName} as Rejected`
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCandidateId(sess.candidateId);
                              onChangeSubTab("rec-interviews");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1"
                          >
                            <span>Schedule Call</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeleteSession(sess)}
                            disabled={deletingSessionId === sess.id}
                            className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 font-semibold text-xs flex items-center gap-1.5 transition ml-auto"
                            title="Delete this assessment submission and reset candidate status"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>{deletingSessionId === sess.id ? "Deleting..." : "Delete Response"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          7. EVALUATION & SCORING (7-COMPETENCY SCORECARD + MANUAL OVERRIDE)
         ===================================================================== */}
      {activeSubTab === "rec-evaluation" && selectedCandidate && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  7-Competency Reviewer Scorecard
                </span>
                <h3 className="text-lg font-bold text-white">
                  Evaluate {selectedCandidate.fullName} ({selectedCandidate.candidateCode})
                </h3>
              </div>
              <select
                value={selectedCandidate.id}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.candidateCode} — {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 text-xs">
              {(
                [
                  ["researchAptitude", "Research Aptitude (Weight 15%)"],
                  ["startupDiscoverySourcing", "Startup Discovery & Sourcing (Weight 20%)"],
                  ["marketBusinessAnalysis", "Market & Business Analysis (Weight 20%)"],
                  [
                    "financialCommercialUnderstanding",
                    "Financial & Commercial Understanding (Weight 10%)",
                  ],
                  ["criticalThinkingRisk", "Critical Thinking & Risk Identification (Weight 15%)"],
                  ["communicationDocumentation", "Communication & Documentation (Weight 10%)"],
                  ["interviewOwnership", "Interview Defence & Ownership (Weight 10%)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className="font-mono font-bold text-blue-300">
                      {compScores[key]}/100
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={compScores[key]}
                    onChange={(e) =>
                      setCompScores((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Key Strengths</label>
                <textarea
                  rows={2}
                  value={evalStrengths}
                  onChange={(e) => setEvalStrengths(e.target.value)}
                  placeholder="Analytical strengths, source verification..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Concerns / Blind Spots</label>
                <textarea
                  rows={2}
                  value={evalConcerns}
                  onChange={(e) => setEvalConcerns(e.target.value)}
                  placeholder="Any unverified assumptions or gaps..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <select
                value={evalRecommendation}
                onChange={(e) =>
                  setEvalRecommendation(
                    e.target.value as
                      | "Strong Proceed"
                      | "Proceed"
                      | "Hold / Borderline"
                      | "Reject"
                  )
                }
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="Strong Proceed">Strong Proceed</option>
                <option value="Proceed">Proceed</option>
                <option value="Hold / Borderline">Hold / Borderline</option>
                <option value="Reject">Reject</option>
              </select>

              <button
                type="button"
                onClick={async () => {
                  await postAction(
                    {
                      action: "evaluation.submit",
                      candidateId: selectedCandidate.id,
                      competencies: compScores,
                      strengths: evalStrengths,
                      concerns: evalConcerns,
                      recommendation: evalRecommendation,
                    },
                    `Submitted 7-competency evaluation for ${selectedCandidate.fullName}`
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Submit Reviewer Evaluation
              </button>
            </div>
          </div>

          {/* RIGHT 5 COLS: MANUAL SCORE OVERRIDE & AUDIT LOG */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
              <div className="font-bold text-white text-sm">
                Manual Score Adjustment (Requires Audit Reason)
              </div>
              <p className="text-slate-400">
                Current Weighted Score:{" "}
                <strong className="text-white">{selectedCandidate.finalWeightedScore}/100</strong>{" "}
                | Override:{" "}
                <strong className="text-amber-300">
                  {selectedCandidate.manualScoreOverride ?? "None"}
                </strong>
              </p>

              <input
                type="number"
                min={0}
                max={100}
                value={overrideScoreInput}
                onChange={(e) => setOverrideScoreInput(e.target.value)}
                placeholder="New Score (0–100)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
              <textarea
                rows={2}
                value={overrideReasonInput}
                onChange={(e) => setOverrideReasonInput(e.target.value)}
                placeholder="Mandatory reason for score adjustment (logged to immutable audit trail)..."
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
              <button
                type="button"
                onClick={async () => {
                  await postAction(
                    {
                      action: "score.override",
                      candidateId: selectedCandidate.id,
                      newScore: Number(overrideScoreInput),
                      reason: overrideReasonInput,
                    },
                    "Applied manual score override and logged audit entry."
                  );
                  setOverrideScoreInput("");
                  setOverrideReasonInput("");
                }}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              >
                Apply Override & Log Audit Entry
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-white">Score Adjustment Audit Trail</div>
              {recruitment.scoreAuditLogs.length === 0 ? (
                <p className="text-slate-500">No manual score overrides recorded yet.</p>
              ) : (
                recruitment.scoreAuditLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5"
                  >
                    <div className="font-semibold text-amber-300">
                      {log.candidateName}: {log.previousScore} → {log.newScore}/100
                    </div>
                    <div className="text-slate-300">Reason: {log.reason}</div>
                    <div className="text-[10px] text-slate-500">
                      By {log.actorName} • {new Date(log.timestamp).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. SHORTLISTING & LEADERBOARD
         ===================================================================== */}
      {activeSubTab === "rec-shortlisting" && (() => {
        // Build map for candidate sessions lookup
        const sessionByCand = new Map<string, AIInterviewSessionRecord>();
        (recruitment.aiInterviewSessions || []).forEach((s) => {
          if (s.candidateId) sessionByCand.set(s.candidateId, s);
          if (s.candidateCode) sessionByCand.set(s.candidateCode, s);
        });

        const realCandidates = candidates.filter((c) => c.id !== "DVC-SAMPLE-001");
        const sampleCand = candidates.find((c) => c.id === "DVC-SAMPLE-001");

        const isCandidateSubmitted = (c: CandidateRecord) => {
          const sess = sessionByCand.get(c.id) || sessionByCand.get(c.candidateCode);
          return Boolean(
            sess?.status === "Completed" ||
            (c.aiInterviewScore !== null && c.aiInterviewScore !== undefined) ||
            c.applicationStatus === "Assessment Submitted" ||
            c.assessmentStatus === "Submitted" ||
            c.assessmentStatus === "Evaluated"
          );
        };

        const submittedReal = realCandidates.filter(isCandidateSubmitted);
        const pendingReal = realCandidates.filter((c) => !isCandidateSubmitted(c));
        const finalistsReal = realCandidates.filter(
          (c) =>
            c.applicationStatus === "Shortlisted for Final Interview" ||
            c.applicationStatus === "Selected"
        );

        const poolCandidates = includeSampleInLeaderboard ? candidates : realCandidates;

        let filteredList: CandidateRecord[] = [];
        if (shortlistingFilter === "SUBMITTED") {
          filteredList = poolCandidates
            .filter(isCandidateSubmitted)
            .sort((a, b) => {
              const scoreB = b.manualScoreOverride ?? b.aiInterviewScore ?? b.finalWeightedScore ?? 0;
              const scoreA = a.manualScoreOverride ?? a.aiInterviewScore ?? a.finalWeightedScore ?? 0;
              return scoreB - scoreA;
            });
        } else if (shortlistingFilter === "PENDING") {
          filteredList = poolCandidates
            .filter((c) => !isCandidateSubmitted(c))
            .sort((a, b) => {
              const dateA = a.assessmentDeadlineAt ? new Date(a.assessmentDeadlineAt).getTime() : Infinity;
              const dateB = b.assessmentDeadlineAt ? new Date(b.assessmentDeadlineAt).getTime() : Infinity;
              return dateA - dateB;
            });
        } else if (shortlistingFilter === "FINALISTS") {
          filteredList = poolCandidates
            .filter(
              (c) =>
                c.applicationStatus === "Shortlisted for Final Interview" ||
                c.applicationStatus === "Selected"
            )
            .sort((a, b) => {
              const scoreB = b.manualScoreOverride ?? b.aiInterviewScore ?? b.finalWeightedScore ?? 0;
              const scoreA = a.manualScoreOverride ?? a.aiInterviewScore ?? a.finalWeightedScore ?? 0;
              return scoreB - scoreA;
            });
        } else {
          // "ALL"
          filteredList = [...poolCandidates].sort((a, b) => {
            const scoreB = b.manualScoreOverride ?? b.aiInterviewScore ?? b.finalWeightedScore ?? b.profileScore;
            const scoreA = a.manualScoreOverride ?? a.aiInterviewScore ?? a.finalWeightedScore ?? a.profileScore;
            return scoreB - scoreA;
          });
        }

        if (shortlistingSearch.trim()) {
          const q = shortlistingSearch.toLowerCase().trim();
          filteredList = filteredList.filter(
            (c) =>
              c.fullName.toLowerCase().includes(q) ||
              c.candidateCode.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q) ||
              c.ugDegree.toLowerCase().includes(q)
          );
        }

        const totalSubmittedCount =
          submittedReal.length +
          (includeSampleInLeaderboard && sampleCand && isCandidateSubmitted(sampleCand) ? 1 : 0);

        return (
          <div className="space-y-6">
            {/* OVERVIEW & SHORTLISTING WORKFLOW BANNER */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Post-Assessment Merit Selection</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      All 79 Students Invited • Shortlisting Post-Assessment
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Candidate Shortlisting & Evaluation Leaderboard
                  </h3>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
                    All 79 candidates have been invited to complete the proctored AI Interview & Virtual Data Room Deal Triage before the cohort deadline. In accordance with recruitment criteria, <strong>no candidate is pre-selected</strong>: shortlisting for Final Partner Interviews is evaluated strictly among candidates who have submitted their assessments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleSess = recruitment.aiInterviewSessions?.find(
                        (s) => s.candidateId === "DVC-SAMPLE-001" || s.candidateCode === "DVC-SAMPLE-001"
                      );
                      if (sampleSess) {
                        setSelectedSessionId(sampleSess.id);
                      }
                      setSelectedCandidateId("DVC-SAMPLE-001");
                      onChangeSubTab("rec-submissions");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600/25 hover:bg-cyan-600/35 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Inspect Sample Test Responses 📝</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeSubTab("rec-emails")}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Manage Cohort Deadline 📅</span>
                  </button>
                </div>
              </div>

              {/* COHORT STATS METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 uppercase">
                    Invited Cohort
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {realCandidates.length}
                  </div>
                  <div className="text-[11px] text-slate-400">100% Invited to Test</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30">
                  <div className="text-[11px] font-medium text-emerald-400 uppercase">
                    Submitted Assessments
                  </div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1">
                    {submittedReal.length}
                  </div>
                  <div className="text-[11px] text-emerald-400/80">Ready for Shortlist Review</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 uppercase">
                    Awaiting Submissions
                  </div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">
                    {pendingReal.length}
                  </div>
                  <div className="text-[11px] text-slate-400">Window Open Until Deadline</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-blue-500/30">
                  <div className="text-[11px] font-medium text-blue-400 uppercase">
                    Shortlisted for Final
                  </div>
                  <div className="text-2xl font-bold text-blue-300 mt-1">
                    {finalistsReal.length}
                  </div>
                  <div className="text-[11px] text-blue-400/80">Partner Interview Call</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30">
                  <div className="text-[11px] font-medium text-indigo-400 uppercase">
                    Active Deadline
                  </div>
                  <div className="text-xs font-mono font-bold text-indigo-300 mt-2 truncate">
                    {recruitment.settings?.defaultAssessmentDeadlineAt
                      ? new Date(recruitment.settings.defaultAssessmentDeadlineAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Rolling 48h"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Cohort Cutoff Window</div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD & SHORTLISTING CONTROLS */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                {/* FILTER TABS */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShortlistingFilter("SUBMITTED")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      shortlistingFilter === "SUBMITTED"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submitted Assessments ({totalSubmittedCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShortlistingFilter("PENDING")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      shortlistingFilter === "PENDING"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Submissions ({pendingReal.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShortlistingFilter("FINALISTS")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      shortlistingFilter === "FINALISTS"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Shortlisted for Final Interview ({finalistsReal.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShortlistingFilter("ALL")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      shortlistingFilter === "ALL"
                        ? "bg-slate-700 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Cohort ({realCandidates.length})</span>
                  </button>
                </div>

                {/* SEARCH & SAMPLE TOGGLE */}
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeSampleInLeaderboard}
                      onChange={(e) => setIncludeSampleInLeaderboard(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-cyan-300 font-medium">Include Sample Sandbox (DVC-SAMPLE-001)</span>
                  </label>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={shortlistingSearch}
                      onChange={(e) => setShortlistingSearch(e.target.value)}
                      placeholder="Search name, roll no, degree..."
                      className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-blue-500 outline-none w-56"
                    />
                  </div>
                </div>
              </div>

              {/* TABLE RENDER: SUBMITTED ASSESSMENTS */}
              {shortlistingFilter === "SUBMITTED" && (
                <div>
                  {filteredList.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div className="text-white font-bold">No Completed Submissions Yet in Filter</div>
                      <p className="text-slate-400 text-xs max-w-md mx-auto">
                        Candidates are actively taking their assessments. To preview how completed submissions look on the leaderboard, check &ldquo;Include Sample Sandbox (DVC-SAMPLE-001)&rdquo; above or click below.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIncludeSampleInLeaderboard(true);
                          const sampleSess = recruitment.aiInterviewSessions?.find(
                            (s) => s.candidateId === "DVC-SAMPLE-001" || s.candidateCode === "DVC-SAMPLE-001"
                          );
                          if (sampleSess) {
                            setSelectedSessionId(sampleSess.id);
                          }
                          setSelectedCandidateId("DVC-SAMPLE-001");
                          onChangeSubTab("rec-submissions");
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect Sample Test Responses 📝</span>
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 pr-2">Rank</th>
                            <th className="py-2.5 px-2">Candidate</th>
                            <th className="py-2.5 px-2">Stage 1 Profile</th>
                            <th className="py-2.5 px-2">AI Interview + Task</th>
                            <th className="py-2.5 px-2">Proctoring</th>
                            <th className="py-2.5 px-2">Composite Score</th>
                            <th className="py-2.5 px-2">Submitted Responses</th>
                            <th className="py-2.5 px-2">Status</th>
                            <th className="py-2.5 pl-2 text-right">Shortlist Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredList.map((c, idx) => {
                            const comp =
                              c.manualScoreOverride ??
                              c.aiInterviewScore ??
                              c.finalWeightedScore ??
                              c.profileScore;
                            const isSample = c.candidateCode === "DVC-SAMPLE-001";
                            const sess = sessionByCand.get(c.id) || sessionByCand.get(c.candidateCode);

                            return (
                              <tr
                                key={c.id}
                                className={`hover:bg-slate-800/40 transition ${
                                  isSample ? "bg-cyan-950/10" : ""
                                }`}
                              >
                                <td className="py-3 pr-2 font-mono font-bold text-slate-400">
                                  #{idx + 1}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="font-semibold text-white flex items-center gap-1.5">
                                    <span>{c.fullName}</span>
                                    {isSample && (
                                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-sans font-medium">
                                        Sandbox Test
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {c.candidateCode} • {c.ugDegree} ({c.totalWorkExMonths > 0 ? `${c.totalWorkExMonths}m Work-Ex` : "Fresher"})
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <span className="text-slate-300">{c.profileScore}/100</span>
                                </td>
                                <td className="py-3 px-2">
                                  <span className="font-bold text-emerald-400 text-sm">
                                    {c.aiInterviewScore !== null && c.aiInterviewScore !== undefined
                                      ? `${c.aiInterviewScore}/100`
                                      : "—"}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  {c.proctoringIntegrityScore !== null &&
                                  c.proctoringIntegrityScore !== undefined ? (
                                    <span className="inline-flex items-center gap-1 text-slate-300">
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>{c.proctoringIntegrityScore}% ({c.proctoringIntegrityStatus})</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-2 font-bold text-white text-sm">
                                  {comp}/100
                                  {c.manualScoreOverride && (
                                    <span className="ml-1 text-[10px] text-amber-300 font-normal">
                                      (Override)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (sess) {
                                        setSelectedSessionId(sess.id);
                                      }
                                      setSelectedCandidateId(c.id);
                                      onChangeSubTab("rec-submissions");
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>View Responses 📝</span>
                                  </button>
                                </td>
                                <td className="py-3 px-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                      c.applicationStatus === "Shortlisted for Final Interview" ||
                                      c.applicationStatus === "Selected"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : c.applicationStatus === "Assessment Submitted"
                                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        : c.applicationStatus === "Waitlisted"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                        : c.applicationStatus === "Rejected"
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                        : "bg-slate-800 text-slate-300"
                                    }`}
                                  >
                                    {c.applicationStatus}
                                  </span>
                                </td>
                                <td className="py-3 pl-2 text-right space-x-1.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await postAction(
                                        {
                                          action: "candidate.update",
                                          candidateId: c.id,
                                          updates: { applicationStatus: "Shortlisted for Final Interview" },
                                        },
                                        `Shortlisted ${c.fullName} for Final Partner Interview!`
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-sm"
                                    title="Shortlist candidate for final interview round"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Shortlist for Final</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCandidateId(c.id);
                                      onChangeSubTab("rec-interviews");
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                                    title="Schedule Partner Defence Interview"
                                  >
                                    <span>Schedule Call</span>
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await postAction(
                                        {
                                          action: "candidate.update",
                                          candidateId: c.id,
                                          updates: { applicationStatus: "Waitlisted" },
                                        },
                                        `Moved ${c.fullName} to Waitlist`
                                      );
                                    }}
                                    className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-medium"
                                  >
                                    Waitlist
                                  </button>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await postAction(
                                        {
                                          action: "candidate.update",
                                          candidateId: c.id,
                                          updates: { applicationStatus: "Rejected" },
                                        },
                                        `Marked ${c.fullName} as Rejected`
                                      );
                                    }}
                                    className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium"
                                  >
                                    Reject
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLE RENDER: AWAITING SUBMISSIONS */}
              {shortlistingFilter === "PENDING" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Showing candidates who have not yet submitted their proctored assessment. Each candidate can access their test via their personal 1-click link until their individual deadline.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChangeSubTab("rec-emails")}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold whitespace-nowrap"
                    >
                      Open Email Dispatcher →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 pr-2">#</th>
                          <th className="py-2.5 px-2">Candidate</th>
                          <th className="py-2.5 px-2">Registered Email</th>
                          <th className="py-2.5 px-2">Profile Score</th>
                          <th className="py-2.5 px-2">Direct Assessment Link</th>
                          <th className="py-2.5 px-2">Assessment Deadline</th>
                          <th className="py-2.5 px-2">Invitation Status</th>
                          <th className="py-2.5 pl-2 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredList.map((c, idx) => {
                          const directUrl = `https://deeveecapital.com/candidate?code=${encodeURIComponent(c.candidateCode)}&email=${encodeURIComponent(c.email)}`;
                          const isExpired = c.assessmentDeadlineAt && new Date(c.assessmentDeadlineAt).getTime() < Date.now();
                          const isInvited = c.inviteStatus === "Sent" || c.inviteStatus === "Accepted";

                          return (
                            <tr key={c.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-3 pr-2 font-mono text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-semibold text-white">{c.fullName}</div>
                                <div className="text-[11px] text-slate-400">
                                  {c.candidateCode} • {c.ugDegree} ({c.totalWorkExMonths > 0 ? `${c.totalWorkExMonths}m Work-Ex` : "Fresher"})
                                </div>
                              </td>
                              <td className="py-3 px-2 font-mono text-slate-300">
                                {c.email}
                              </td>
                              <td className="py-3 px-2 font-medium text-slate-200">
                                {c.profileScore}/100
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={directUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-blue-400 hover:underline text-[11px] truncate max-w-[150px] block"
                                  >
                                    /candidate?code={c.candidateCode}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(directUrl);
                                      showToast(`Copied assessment link for ${c.fullName}!`);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                    title="Copy direct link"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[11px] text-slate-200">
                                    {c.assessmentDeadlineAt
                                      ? new Date(c.assessmentDeadlineAt).toLocaleString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "Rolling 48h"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIndividualDeadlineModalCand(c);
                                      const baseDate = c.assessmentDeadlineAt
                                        ? new Date(c.assessmentDeadlineAt)
                                        : new Date(Date.now() + 48 * 3600 * 1000);
                                      const localIso = new Date(baseDate.getTime() - baseDate.getTimezoneOffset() * 60000)
                                        .toISOString()
                                        .slice(0, 16);
                                      setIndividualDeadlineInput(localIso);
                                    }}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium"
                                  >
                                    Extend 📅
                                  </button>
                                </div>
                                {isExpired && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-semibold">
                                    Window Expired
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    isInvited
                                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {isInvited ? "Sent (SMTP)" : "Pending Dispatch"}
                                </span>
                              </td>
                              <td className="py-3 pl-2 text-right">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await postAction(
                                      {
                                        action: "email.send_approved",
                                        adminApproved: true,
                                        candidateIds: [c.id],
                                        templateId: "tpl-invite-assessment",
                                      },
                                      `Dispatched invitation to ${c.fullName} via siddharth@deeveecapital.com`
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{isInvited ? "Resend Invite" : "Send Invite"}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE RENDER: FINALISTS */}
              {shortlistingFilter === "FINALISTS" && (
                <div>
                  {filteredList.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-white font-bold">No Candidates Shortlisted for Final Yet</div>
                      <p className="text-slate-400 text-xs">
                        Review submitted assessments in the &ldquo;Submitted Assessments&rdquo; tab and click &ldquo;Shortlist for Final&rdquo; to add candidates here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 pr-2">Rank</th>
                            <th className="py-2.5 px-2">Finalist Candidate</th>
                            <th className="py-2.5 px-2">AI Interview Score</th>
                            <th className="py-2.5 px-2">Proctoring Status</th>
                            <th className="py-2.5 px-2">Composite Score</th>
                            <th className="py-2.5 px-2">Submitted Responses</th>
                            <th className="py-2.5 pl-2 text-right">Schedule Partner Interview</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredList.map((c, idx) => {
                            const comp =
                              c.manualScoreOverride ??
                              c.aiInterviewScore ??
                              c.finalWeightedScore ??
                              c.profileScore;
                            const sess = sessionByCand.get(c.id) || sessionByCand.get(c.candidateCode);

                            return (
                              <tr key={c.id} className="hover:bg-slate-800/40 transition">
                                <td className="py-3 pr-2 font-mono font-bold text-emerald-400">
                                  #{idx + 1}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="font-semibold text-white">{c.fullName}</div>
                                  <div className="text-[11px] text-slate-400">
                                    {c.candidateCode} • {c.ugDegree} ({c.totalWorkExMonths > 0 ? `${c.totalWorkExMonths}m Work-Ex` : "Fresher"})
                                  </div>
                                </td>
                                <td className="py-3 px-2 font-bold text-emerald-400 text-sm">
                                  {c.aiInterviewScore !== null && c.aiInterviewScore !== undefined
                                    ? `${c.aiInterviewScore}/100`
                                    : "—"}
                                </td>
                                <td className="py-3 px-2">
                                  {c.proctoringIntegrityScore !== null &&
                                  c.proctoringIntegrityScore !== undefined ? (
                                    <span className="text-slate-300">
                                      {c.proctoringIntegrityScore}% ({c.proctoringIntegrityStatus})
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-2 font-bold text-white text-sm">
                                  {comp}/100
                                </td>
                                <td className="py-3 px-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (sess) setSelectedSessionId(sess.id);
                                      setSelectedCandidateId(c.id);
                                      onChangeSubTab("rec-submissions");
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>View Responses 📝</span>
                                  </button>
                                </td>
                                <td className="py-3 pl-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCandidateId(c.id);
                                      onChangeSubTab("rec-interviews");
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Schedule Partner Call 📞</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLE RENDER: ALL COHORT */}
              {shortlistingFilter === "ALL" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 pr-2">Rank</th>
                        <th className="py-2.5 px-2">Candidate</th>
                        <th className="py-2.5 px-2">Stage 1 Profile</th>
                        <th className="py-2.5 px-2">AI Interview + Task</th>
                        <th className="py-2.5 px-2">Proctoring</th>
                        <th className="py-2.5 px-2">Composite Score</th>
                        <th className="py-2.5 px-2">Submitted Responses</th>
                        <th className="py-2.5 px-2">Status</th>
                        <th className="py-2.5 pl-2 text-right">Quick Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredList.map((c, idx) => {
                        const comp =
                          c.manualScoreOverride ??
                          c.aiInterviewScore ??
                          c.finalWeightedScore ??
                          c.profileScore;
                        const isSubmitted = isCandidateSubmitted(c);
                        const sess = sessionByCand.get(c.id) || sessionByCand.get(c.candidateCode);

                        return (
                          <tr key={c.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 pr-2 font-mono font-bold text-slate-400">
                              #{idx + 1}
                            </td>
                            <td className="py-2.5 px-2">
                              <div className="font-semibold text-white">{c.fullName}</div>
                              <div className="text-[11px] text-slate-400">
                                {c.candidateCode} • {c.ugDegree} ({c.totalWorkExMonths > 0 ? `${c.totalWorkExMonths}m Work-Ex` : "Fresher"})
                              </div>
                            </td>
                            <td className="py-2.5 px-2">{c.profileScore}/100</td>
                            <td className="py-2.5 px-2 font-semibold">
                              {c.aiInterviewScore !== null && c.aiInterviewScore !== undefined ? (
                                <span className="text-emerald-400">{c.aiInterviewScore}/100</span>
                              ) : (
                                <span className="text-slate-500">Pending</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2">
                              {c.proctoringIntegrityScore !== null &&
                              c.proctoringIntegrityScore !== undefined ? (
                                <span className="text-blue-300">
                                  {c.proctoringIntegrityScore}% ({c.proctoringIntegrityStatus})
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 font-bold text-white text-sm">
                              {comp}/100
                            </td>
                            <td className="py-2.5 px-2">
                              {isSubmitted ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (sess) setSelectedSessionId(sess.id);
                                    setSelectedCandidateId(c.id);
                                    onChangeSubTab("rec-submissions");
                                  }}
                                  className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold text-[11px] flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3 text-indigo-400" />
                                  <span>View Responses 📝</span>
                                </button>
                              ) : (
                                <span className="text-slate-500 text-[11px]">Awaiting Test</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px]">
                                {c.applicationStatus}
                              </span>
                            </td>
                            <td className="py-2.5 pl-2 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={async () => {
                                  await postAction(
                                    {
                                      action: "candidate.update",
                                      candidateId: c.id,
                                      updates: { applicationStatus: "Shortlisted for Final Interview" },
                                    },
                                    `Shortlisted ${c.fullName} for Final Partner Interview!`
                                  );
                                }}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600/25 text-emerald-300 hover:bg-emerald-600/40"
                              >
                                Shortlist
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await postAction(
                                    {
                                      action: "candidate.update",
                                      candidateId: c.id,
                                      updates: { applicationStatus: "Waitlisted" },
                                    },
                                    `Moved ${c.fullName} to Waitlist`
                                  );
                                }}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-600/25 text-amber-300 hover:bg-amber-600/40"
                              >
                                Waitlist
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await postAction(
                                    {
                                      action: "candidate.update",
                                      candidateId: c.id,
                                      updates: { applicationStatus: "Rejected" },
                                    },
                                    `Marked ${c.fullName} as Rejected`
                                  );
                                }}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-rose-600/25 text-rose-300 hover:bg-rose-600/40"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          9. FINAL PARTNER INTERVIEWS (STAGE 5 RESEARCH DEFENCE)
         ===================================================================== */}
      {activeSubTab === "rec-interviews" && selectedCandidate && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
            <div className="font-bold text-base text-white">
              Schedule / Score Final Partner Defence Interview
            </div>
            <select
              value={selectedCandidate.id}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.candidateCode} — {c.fullName}
                </option>
              ))}
            </select>

            <div>
              <label className="block text-slate-400 mb-1">Google Meet / Zoom Link</label>
              <input
                type="text"
                value={intMeetingLink}
                onChange={(e) => setIntMeetingLink(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Overall Partner Defence Score ({intScore}/100)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={intScore}
                onChange={(e) => setIntScore(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Research Defence & AI Verification Notes
              </label>
              <textarea
                rows={3}
                value={intNotes}
                onChange={(e) => setIntNotes(e.target.value)}
                placeholder="Notes on how the candidate defended their startup thesis and what they could/could not verify..."
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <select
                value={intDecision}
                onChange={(e) =>
                  setIntDecision(
                    e.target.value as "Strong Hire" | "Hire" | "Waitlist" | "No Hire"
                  )
                }
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              >
                <option value="Strong Hire">Strong Hire</option>
                <option value="Hire">Hire</option>
                <option value="Waitlist">Waitlist</option>
                <option value="No Hire">No Hire</option>
              </select>

              <button
                type="button"
                onClick={async () => {
                  await postAction(
                    {
                      action: "interview.save",
                      interview: {
                        candidateId: selectedCandidate.id,
                        meetingLink: intMeetingLink,
                        status: "Completed",
                        overallInterviewScore: intScore,
                        overallNotes: intNotes,
                        decisionRecommendation: intDecision,
                      },
                    },
                    `Recorded Stage 5 Partner Interview scorecard for ${selectedCandidate.fullName}`
                  );
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
              >
                Save Interview Scorecard
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-base text-white">
              Standard Deevee Capital Research Defence Question Guide
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>Why did you choose this startup over the other two in the Data Room?</li>
              <li>How did you verify its billed revenue vs founder pitch claims?</li>
              <li>What are the two biggest operational or working-capital risks in this business?</li>
              <li>Who is the most dangerous competitor or unorganised substitute?</li>
              <li>What could you NOT verify from public data, and how would you test it on a call?</li>
              <li>Would you invest ₹25 Lakhs of Deevee Capital&apos;s money today? Under what milestone conditions?</li>
              <li>Which exact metrics were cross-checked independently without relying on AI summaries?</li>
            </ol>
          </div>
        </div>
      )}

      {/* =====================================================================
          10. EMAIL & INVITATIONS (WORKABLE LIVE GMAIL SMTP DISPATCH & ROSTER)
         ===================================================================== */}
      {activeSubTab === "rec-emails" && (
        <div className="space-y-6">
          {/* SMT P STATUS BANNER */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="text-xs font-bold text-white flex flex-wrap items-center gap-2">
                  <span>Live Gmail SMTP Sender Connected:</span>
                  <span className="text-emerald-400 font-mono font-semibold">siddharth@deeveecapital.com</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    SSL Port 465 Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dispatches real candidate invitations containing Candidate ID, Unique Passkey, 1-Click Direct Assessment Link, and Practice Sandbox Link.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
                Total Cohort: <strong className="text-white">{candidates.length}</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                Invited: <strong>{candidates.filter((c) => c.inviteStatus === "Sent" || c.inviteStatus === "Accepted").length}</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-amber-950/50 text-amber-300 border border-amber-500/30">
                Uninvited: <strong>{candidates.filter((c) => c.inviteStatus !== "Sent" && c.inviteStatus !== "Accepted").length}</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-blue-950/50 text-blue-300 border border-blue-500/30">
                Shortlisted: <strong>{shortlistedCount}</strong>
              </span>
            </div>
          </div>

          {/* TOP GRID: TEST DISPATCH & AUDIT LOG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: TEST DISPATCH & PREVIEW */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Email Dispatcher & Preview Engine
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Invitation & Credentials Email Preview
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 text-[11px] font-mono">
                  From: siddharth@deeveecapital.com
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Select Email Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    {recruitment.emailTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Sample Candidate For Credentials Preview</label>
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.candidateCode} — {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await postAction({
                      action: "email.preview",
                      candidateId: selectedCandidateId,
                      templateId: selectedTemplateId,
                    });
                    if (res?.preview) setEmailPreviewData(res.preview);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Personalized Invitation & Credentials</span>
                </button>
              </div>

              {/* LIVE PREVIEW BOX */}
              {emailPreviewData && (
                <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="font-semibold text-blue-300">
                      Subject: {emailPreviewData.subject}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Subject: ${emailPreviewData.subject}\n\n${emailPreviewData.bodyText}`
                        );
                        setCopiedKey("email-preview-text");
                        setTimeout(() => setCopiedKey(null), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1"
                    >
                      {copiedKey === "email-preview-text" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied Email!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Email Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* CREDENTIALS CALLOUT BOX */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      Student Access Credentials Callout
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Username / Candidate ID: </span>
                        <strong className="text-white font-mono">{emailPreviewData.candidateCode || selectedCandidate?.candidateCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Portal Passkey / Password: </span>
                        <strong className="text-emerald-300 font-mono">{emailPreviewData.password || selectedCandidate?.assignedPortalPassword || "DVC@Sample2026"}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Direct 1-Click Link: </span>
                        <a
                          href={cleanCandidateUrl(emailPreviewData.directLink || emailPreviewData.setupLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline font-mono break-all"
                        >
                          {cleanCandidateUrl(emailPreviewData.directLink || emailPreviewData.setupLink)}
                        </a>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Sample Sandbox Mode: </span>
                        <a
                          href={cleanCandidateUrl(emailPreviewData.sampleTestLink || "https://deeveecapital.com/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline font-mono break-all"
                        >
                          {cleanCandidateUrl(emailPreviewData.sampleTestLink || "https://deeveecapital.com/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com")}
                        </a>
                      </div>
                    </div>
                  </div>

                  <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 whitespace-pre-wrap font-sans leading-relaxed text-[11px] max-h-60 overflow-y-auto">
                    {emailPreviewData.bodyText}
                  </pre>
                </div>
              )}

              {/* TEST EMAIL SENDER VIA SIDDHARTH@DEEVEECAPITAL.COM */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Send Live Test Email via siddharth@deeveecapital.com</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Gmail SMTP Verified</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Dispatches a real email through Google Workspace SMTP with sample credentials and direct links so you can inspect how it looks in your inbox.
                </p>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="siddharth@deeveecapital.com"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSendingTestEmail}
                    onClick={async () => {
                      setIsSendingTestEmail(true);
                      const res = await postAction(
                        {
                          action: "email.send_test",
                          testRecipientEmail: testEmailRecipient,
                          candidateId: selectedCandidateId,
                          templateId: selectedTemplateId,
                        },
                        `Dispatched live test invitation via siddharth@deeveecapital.com to ${testEmailRecipient}`
                      );
                      setIsSendingTestEmail(false);
                      if (res?.messageId) {
                        showToast(`Delivered via SMTP! MessageId: ${res.messageId}`);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-lg shadow-indigo-600/20"
                  >
                    {isSendingTestEmail ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending via SMTP...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Live Test Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: LIVE AUDIT LOG */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Invitation & SMTP Audit Log</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {recruitment.emailLogs.length} total logged
                </span>
              </div>

              {recruitment.emailLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 rounded-xl bg-slate-950 border border-slate-800/60">
                  No emails sent yet. Use the test dispatcher or student roster below to dispatch invitations.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {recruitment.emailLogs.slice(0, 15).map((log) => {
                    const isSmtp = log.status === "Sent (SMTP)";
                    const isFailed = log.status === "Failed";
                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-blue-300 truncate font-mono">
                            {log.recipientEmail}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                              isSmtp
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : isFailed
                                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isSmtp ? "🟢 Sent (Live SMTP)" : isFailed ? "🔴 Failed" : log.status}
                          </span>
                        </div>
                        <div className="text-slate-300 truncate text-[11px]">{log.subject}</div>
                        {log.error && (
                          <div className="text-[10px] text-rose-400 font-mono bg-rose-950/30 p-1.5 rounded">
                            {log.error}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>{log.isTestSend ? "TEST MODE" : "OFFICIAL DISPATCH"} • By {log.sentBy}</span>
                          <span>{new Date(log.sentAt).toLocaleString("en-IN", { timeStyle: "short", dateStyle: "short" })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ASSESSMENT DEADLINE & WINDOW EXTENSION CONTROLLER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Assessment Window & Deadline Manager</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      Cohort Control
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set a cohort-wide completion deadline or extend deadlines for individual candidates. Preserved automatically across invitations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Active Cohort Deadline:</span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 text-indigo-300 border border-indigo-500/30 font-mono font-semibold">
                  {recruitment.settings?.defaultAssessmentDeadlineAt
                    ? new Date(recruitment.settings.defaultAssessmentDeadlineAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Rolling 48 Hours"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Quick Presets:
                </span>
                {[
                  { label: "+24 Hours", hours: 24 },
                  { label: "+48 Hours", hours: 48 },
                  { label: "+72 Hours", hours: 72 },
                  { label: "+7 Days", hours: 168 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + preset.hours * 3600 * 1000);
                      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                      setCustomDeadlineInput(localIso);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-2 justify-end">
                <div className="relative flex-1 sm:w-60">
                  <input
                    type="datetime-local"
                    value={customDeadlineInput}
                    onChange={(e) => setCustomDeadlineInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                    placeholder="YYYY-MM-DDTHH:mm"
                  />
                </div>

                <button
                  type="button"
                  disabled={!customDeadlineInput || isUpdatingDeadline || selectedIds.length === 0}
                  onClick={async () => {
                    if (!customDeadlineInput) return;
                    setIsUpdatingDeadline(true);
                    const deadlineIso = new Date(customDeadlineInput).toISOString();
                    await postAction(
                      {
                        action: "candidate.update_deadline",
                        candidateIds: selectedIds,
                        deadlineAt: deadlineIso,
                      },
                      `Extended assessment deadline for ${selectedIds.length} selected candidates to ${new Date(deadlineIso).toLocaleString("en-IN")}`
                    );
                    setIsUpdatingDeadline(false);
                    showToast(`Updated deadline for ${selectedIds.length} selected candidates!`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 whitespace-nowrap transition"
                >
                  {isUpdatingDeadline ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span>Apply to Selected ({selectedIds.length})</span>
                </button>

                <button
                  type="button"
                  disabled={!customDeadlineInput || isUpdatingDeadline}
                  onClick={async () => {
                    if (!customDeadlineInput) return;
                    setIsUpdatingDeadline(true);
                    const deadlineIso = new Date(customDeadlineInput).toISOString();
                    await postAction(
                      {
                        action: "candidate.update_deadline",
                        deadlineAt: deadlineIso,
                      },
                      `Extended cohort assessment deadline to ${new Date(deadlineIso).toLocaleString("en-IN")}`
                    );
                    setIsUpdatingDeadline(false);
                    showToast(`Updated cohort-wide deadline to ${new Date(deadlineIso).toLocaleString("en-IN")}!`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 whitespace-nowrap transition"
                >
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span>Apply Cohort-Wide ({candidates.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* CANDIDATE INVITATION & DISPATCH ROSTER */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Student Dispatch Hub
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Candidate Roster & 1-Click Email Dispatch
                </h3>
                <p className="text-xs text-slate-400">
                  Invite students individually with 1 click or select multiple candidates for batch dispatch via <strong className="text-white">siddharth@deeveecapital.com</strong>.
                </p>
              </div>

              {/* COPY CREDENTIALS BUTTON FOR PLACECOM */}
              <button
                type="button"
                onClick={() => {
                  const targetList = selectedIds.length > 0
                    ? candidates.filter((c) => selectedIds.includes(c.id))
                    : filteredRosterCandidates;
                  
                  const header = "Roll No / Candidate ID\tFull Name\tEmail\tPortal Password / Passkey\tDirect 1-Click Link\n";
                  const rows = targetList.map((c) => {
                    const pass = c.assignedPortalPassword || "DVC@Sample2026";
                    const direct = `https://deeveecapital.com/candidate?code=${encodeURIComponent(c.candidateCode)}&email=${encodeURIComponent(c.email)}`;
                    return `${c.candidateCode}\t${c.fullName}\t${c.email}\t${pass}\t${direct}`;
                  }).join("\n");

                  navigator.clipboard.writeText(header + rows);
                  setCopiedKey("placecom-credentials-roster");
                  setTimeout(() => setCopiedKey(null), 2500);
                  showToast(`Copied ${targetList.length} candidate credentials formatted for Excel / Placement Committee!`);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
              >
                {copiedKey === "placecom-credentials-roster" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Credentials Roster!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Credentials for PlaceCom ({selectedIds.length || filteredRosterCandidates.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* FILTER TABS & SEARCH */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { key: "all", label: `All Candidates (${candidates.length})` },
                    { key: "uninvited", label: `Uninvited (${candidates.filter((c) => c.inviteStatus !== "Sent" && c.inviteStatus !== "Accepted").length})` },
                    { key: "invited", label: `Invited (${candidates.filter((c) => c.inviteStatus === "Sent" || c.inviteStatus === "Accepted").length})` },
                    { key: "shortlisted", label: `Shortlisted (${shortlistedCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRosterFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      rosterFilter === tab.key
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search name, code, email..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* BATCH SELECTION & ACTION BAR */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const ids = filteredRosterCandidates.map((c) => c.id);
                    setSelectedIds(ids);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                >
                  Select All Filtered ({filteredRosterCandidates.length})
                </button>
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium"
                  >
                    Deselect All
                  </button>
                )}
                <span className="text-xs text-slate-400">
                  <strong className="text-white">{selectedIds.length}</strong> candidates selected
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={adminConfirmedBulkSend}
                    onChange={(e) => setAdminConfirmedBulkSend(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span>Confirm live email dispatch via siddharth@deeveecapital.com</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={skipAlreadyDelivered}
                    onChange={(e) => setSkipAlreadyDelivered(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <span>Skip already delivered candidates (no duplicates)</span>
                </label>

                {/* 1-CLICK DISPATCH LATEST INVITATIONS TO PENDING / FAILED CANDIDATES */}
                <button
                  type="button"
                  disabled={!adminConfirmedBulkSend || isSendingBatch}
                  onClick={async () => {
                    const pendingCandidates = candidates.filter(
                      (c) => c.inviteStatus !== "Sent"
                    );
                    const pendingIds = pendingCandidates.map((c) => c.id);

                    if (pendingIds.length === 0) {
                      showToast("All candidates have already received invitations successfully!");
                      return;
                    }

                    setIsSendingBatch(true);
                    const res = await postAction(
                      {
                        action: "email.send_approved",
                        adminApproved: true,
                        candidateIds: pendingIds,
                        templateId: selectedTemplateId,
                        skipAlreadySent: true,
                      },
                      `Dispatched latest invitations via siddharth@deeveecapital.com to ${pendingIds.length} pending/failed candidates!`
                    );
                    setIsSendingBatch(false);
                    if (res?.sentCount) {
                      showToast(`Successfully dispatched ${res.sentCount} latest invitations via SMTP!`);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {isSendingBatch ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching via SMTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        Send Latest Invites to Pending / Failed ({candidates.filter((c) => c.inviteStatus !== "Sent").length})
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!adminConfirmedBulkSend || isSendingBatch}
                  onClick={async () => {
                    const targetIds =
                      selectedIds.length > 0
                        ? selectedIds
                        : filteredRosterCandidates.map((c) => c.id);

                    if (targetIds.length === 0) {
                      setErrorMsg("No candidates selected to dispatch.");
                      return;
                    }

                    setIsSendingBatch(true);
                    const res = await postAction(
                      {
                        action: "email.send_approved",
                        adminApproved: true,
                        candidateIds: targetIds,
                        templateId: selectedTemplateId,
                        skipAlreadySent: skipAlreadyDelivered,
                      },
                      `Dispatched live invitations via siddharth@deeveecapital.com to ${targetIds.length} candidates!`
                    );
                    setIsSendingBatch(false);
                    if (res?.sentCount) {
                      showToast(`Successfully dispatched ${res.sentCount} emails via SMTP!`);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isSendingBatch ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Batch via SMTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        Send Selected / Filtered ({selectedIds.length > 0 ? selectedIds.length : filteredRosterCandidates.length} Students)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CANDIDATES TABLE */}
            <div className="rounded-xl border border-slate-800 overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          filteredRosterCandidates.length > 0 &&
                          filteredRosterCandidates.every((c) => selectedIds.includes(c.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredRosterCandidates.map((c) => c.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded border-slate-700"
                      />
                    </th>
                    <th className="py-3 px-3">Candidate</th>
                    <th className="py-3 px-3">Registered Email</th>
                    <th className="py-3 px-3">Assigned Passkey</th>
                    <th className="py-3 px-3">Direct Assessment Link</th>
                    <th className="py-3 px-3">Assessment Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {filteredRosterCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No candidates match your filter or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredRosterCandidates.map((cand) => {
                      const isSelected = selectedIds.includes(cand.id);
                      const isRevealed = revealedPasswords[cand.id] ?? false;
                      const passkey =
                        cand.assignedPortalPassword ||
                        (cand.candidateCode === "DVC-SAMPLE-001"
                          ? "DVC@Sample2026"
                          : "Deevee@2026");
                      const directUrl = `https://deeveecapital.com/candidate?code=${encodeURIComponent(cand.candidateCode)}&email=${encodeURIComponent(cand.email)}`;
                      const isInvited = cand.inviteStatus === "Sent" || cand.inviteStatus === "Accepted";
                      const isSendingThis = singleSendingId === cand.id;

                      return (
                        <tr
                          key={cand.id}
                          className={`hover:bg-slate-800/40 transition ${
                            isSelected ? "bg-blue-950/20" : ""
                          }`}
                        >
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds((prev) => [...prev, cand.id]);
                                } else {
                                  setSelectedIds((prev) => prev.filter((id) => id !== cand.id));
                                }
                              }}
                              className="rounded border-slate-700"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{cand.fullName}</div>
                            <div className="font-mono text-[10px] text-blue-400">
                              {cand.candidateCode}
                              {cand.candidateCode === "DVC-SAMPLE-001" && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-sans">
                                  Sandbox
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {cand.email}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {isRevealed ? passkey : "••••••••"}
                              </span>
                              <button
                                type="button"
                                title={isRevealed ? "Hide Passkey" : "Reveal Passkey"}
                                onClick={() =>
                                  setRevealedPasswords((prev) => ({
                                    ...prev,
                                    [cand.id]: !isRevealed,
                                  }))
                                }
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                {isRevealed ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                title="Copy Passkey"
                                onClick={() => {
                                  navigator.clipboard.writeText(passkey);
                                  setCopiedKey(cand.id);
                                  setTimeout(() => setCopiedKey(null), 2000);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                {copiedKey === cand.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={directUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[11px] text-blue-400 hover:underline truncate max-w-[160px] block"
                                title={directUrl}
                              >
                                /candidate?code={cand.candidateCode}
                              </a>
                              <button
                                type="button"
                                title="Copy 1-Click Direct Link"
                                onClick={() => {
                                  navigator.clipboard.writeText(directUrl);
                                  setCopiedKey(`link-${cand.id}`);
                                  setTimeout(() => setCopiedKey(null), 2000);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                {copiedKey === `link-${cand.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {cand.assessmentDeadlineAt ? (
                              <div className="space-y-0.5">
                                <div className="text-[11px] font-mono text-slate-200">
                                  {new Date(cand.assessmentDeadlineAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {new Date(cand.assessmentDeadlineAt).getTime() < Date.now() ? (
                                    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 text-[9px] font-semibold border border-rose-500/30">
                                      Expired
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-semibold border border-emerald-500/30">
                                      Active
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIndividualDeadlineModalCand(cand);
                                      const baseDate = new Date(cand.assessmentDeadlineAt!);
                                      const localIso = new Date(baseDate.getTime() - baseDate.getTimezoneOffset() * 60000)
                                        .toISOString()
                                        .slice(0, 16);
                                      setIndividualDeadlineInput(localIso);
                                    }}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium"
                                  >
                                    Extend 📅
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="text-slate-400 text-[11px]">Rolling 48h</span>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIndividualDeadlineModalCand(cand);
                                      const baseDate = new Date(Date.now() + 48 * 3600 * 1000);
                                      const localIso = new Date(baseDate.getTime() - baseDate.getTimezoneOffset() * 60000)
                                        .toISOString()
                                        .slice(0, 16);
                                      setIndividualDeadlineInput(localIso);
                                    }}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                                  >
                                    Set Deadline 📅
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {cand.inviteStatus === "Accepted" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Accepted / Active</span>
                              </span>
                            ) : cand.inviteStatus === "Sent" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <Check className="w-3 h-3" />
                                <span>Sent (Live SMTP)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                <Mail className="w-3 h-3" />
                                <span>Not Sent</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              disabled={isSendingThis}
                              onClick={async () => {
                                setSingleSendingId(cand.id);
                                const res = await postAction(
                                  {
                                    action: "email.send_single_candidate",
                                    candidateId: cand.id,
                                    templateId: selectedTemplateId,
                                  },
                                  `Dispatched live invitation via siddharth@deeveecapital.com to ${cand.fullName} (${cand.email})`
                                );
                                setSingleSendingId(null);
                                if (res?.messageId) {
                                  showToast(`Delivered via SMTP! MessageId: ${res.messageId}`);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 transition ${
                                isInvited
                                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                              }`}
                            >
                              {isSendingThis ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Sending...</span>
                                </>
                              ) : isInvited ? (
                                <>
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Resend Invite</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3" />
                                  <span>Send Live Invite</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          11. QUESTION BANK
         ===================================================================== */}
      {activeSubTab === "rec-question-bank" && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              VC Analyst Question Bank ({recruitment.questions.length} Questions • 100 Marks)
            </h3>
            <p className="text-xs text-slate-400">
              Covers Research Methodology, Information Verification, Financial Reasoning, Business Model Comprehension, and Analytical Reasoning.
            </p>
          </div>
          <div className="space-y-3">
            {recruitment.questions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-blue-400">
                    {q.code} • {q.format.toUpperCase()} • {q.competency}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold">
                    {q.marks} Marks ({q.difficulty})
                  </span>
                </div>
                <p className="text-white font-medium">{q.prompt}</p>
                {q.contextData && (
                  <div className="p-2.5 rounded bg-slate-900 text-slate-300 font-mono text-[11px]">
                    {q.contextData}
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  <strong>Evaluation Rubric:</strong> {q.evaluationRubric}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          12. RECRUITMENT ANALYTICS
         ===================================================================== */}
      {activeSubTab === "rec-analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-white text-sm">
                Undergraduate Degree Distribution (79 Applicants)
              </div>
              {[
                ["B.Tech / B.E. (Engineering)", candidates.filter((c) => /(b\.tech|b\.e)/i.test(c.ugDegree)).length],
                ["B.Com / B.Com Hons", candidates.filter((c) => /b\.com/i.test(c.ugDegree)).length],
                ["B.B.A. / BMS", candidates.filter((c) => /(b\.b\.a|bba|bms)/i.test(c.ugDegree)).length],
                ["B.Sc. / B.A. / BCA / B.Pharm", candidates.filter((c) => /(b\.sc|b\.a|bca|b\.pharm)/i.test(c.ugDegree)).length],
              ].map(([label, count]) => (
                <div key={String(label)} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{label}</span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.round((Number(count) / 79) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-white text-sm">
                Research & Work Experience Breakdown
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span>Substantive Startup/Market Research Claim</span>
                  <strong className="text-emerald-400">{withSubstantiveResearch} / 79</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span>Prior Full-Time Work Experience (6–34 mos)</span>
                  <strong className="text-blue-400">{withWorkEx} / 79</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span>NISM / CFA / Finance Certifications</span>
                  <strong className="text-indigo-400">
                    {candidates.filter((c) => /(nism|cfa|cfp|sebi|zerodha|bloomberg|financial)/i.test(c.certifications + " " + c.otherQualifications)).length} / 79
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-white text-sm">Export & Reporting</div>
              <p className="text-slate-400">
                Download the complete 79-candidate database with all 25 original columns + evaluation scores or generate the executive PDF report.
              </p>
              <div className="space-y-2 pt-1">
                <a
                  href="/api/workspace/recruitment?export=excel"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Full Excel Database (.xls)</span>
                </a>
                <a
                  href="/api/workspace/recruitment?export=pdf_analytics"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Executive PDF Report</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          13. SETTINGS & WEIGHTS
         ===================================================================== */}
      {activeSubTab === "rec-settings" && (
        <div className="max-w-3xl p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
          <div className="font-bold text-base text-white">
            Recruitment Campaign & Scoring Weights Configuration
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">
                AI Interview + Startup Task Duration (Minutes)
              </label>
              <input
                type="number"
                value={recruitment.settings.aiInterviewDurationMinutes || 25}
                onChange={(e) =>
                  setRecruitment((prev) =>
                    prev
                      ? {
                          ...prev,
                          settings: {
                            ...prev.settings,
                            aiInterviewDurationMinutes: Number(e.target.value),
                          },
                        }
                      : prev
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">
                Stage 1 Shortlist Threshold (/100)
              </label>
              <input
                type="number"
                value={recruitment.settings.stage1ShortlistThreshold}
                onChange={(e) =>
                  setRecruitment((prev) =>
                    prev
                      ? {
                          ...prev,
                          settings: {
                            ...prev.settings,
                            stage1ShortlistThreshold: Number(e.target.value),
                          },
                        }
                      : prev
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await postAction(
                {
                  action: "settings.update",
                  settings: recruitment.settings,
                },
                "Updated recruitment settings and recalculated weighted scores."
              );
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            Save Recruitment Settings
          </button>
        </div>
      )}

      {/* INDIVIDUAL CANDIDATE DEADLINE EXTENSION MODAL (GLOBALLY ACCESSIBLE) */}
      {individualDeadlineModalCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Extend Assessment Deadline
                  </h3>
                  <p className="text-xs text-slate-400">
                    {individualDeadlineModalCand.fullName} ({individualDeadlineModalCand.candidateCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIndividualDeadlineModalCand(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate Email:</span>
                <span className="font-mono text-slate-200">{individualDeadlineModalCand.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Window Deadline:</span>
                <span className="font-mono text-indigo-300">
                  {individualDeadlineModalCand.assessmentDeadlineAt
                    ? new Date(individualDeadlineModalCand.assessmentDeadlineAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Rolling 48 Hours"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assessment Status:</span>
                <span className="font-medium text-slate-200">{individualDeadlineModalCand.assessmentStatus}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Quick Extension Presets:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "+24 Hours", hours: 24 },
                  { label: "+48 Hours", hours: 48 },
                  { label: "+72 Hours", hours: 72 },
                  { label: "+7 Days", hours: 168 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const base =
                        individualDeadlineModalCand.assessmentDeadlineAt &&
                        new Date(individualDeadlineModalCand.assessmentDeadlineAt).getTime() > Date.now()
                          ? new Date(individualDeadlineModalCand.assessmentDeadlineAt)
                          : new Date();
                      const d = new Date(base.getTime() + preset.hours * 3600 * 1000);
                      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                      setIndividualDeadlineInput(localIso);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition text-center"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                New Assessment Deadline (Date & Time):
              </label>
              <input
                type="datetime-local"
                value={individualDeadlineInput}
                onChange={(e) => setIndividualDeadlineInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-blue-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Candidate will be permitted to access and submit their proctored assessment until this timestamp.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIndividualDeadlineModalCand(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!individualDeadlineInput || isUpdatingDeadline}
                onClick={async () => {
                  if (!individualDeadlineInput) return;
                  setIsUpdatingDeadline(true);
                  const deadlineIso = new Date(individualDeadlineInput).toISOString();
                  await postAction(
                    {
                      action: "candidate.update_deadline",
                      candidateIds: [individualDeadlineModalCand.id],
                      deadlineAt: deadlineIso,
                    },
                    `Extended assessment deadline for ${individualDeadlineModalCand.fullName} to ${new Date(deadlineIso).toLocaleString("en-IN")}`
                  );
                  setIsUpdatingDeadline(false);
                  setIndividualDeadlineModalCand(null);
                  showToast(`Extended deadline for ${individualDeadlineModalCand.fullName}!`);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                {isUpdatingDeadline ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Save & Extend Deadline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
