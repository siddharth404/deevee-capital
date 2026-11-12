"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import {
  AIInterviewSessionRecord,
  CandidateRecord,
  InterviewEvaluationRecord,
} from "@/lib/workspace/recruitmentTypes";

interface PartnerCallsSectionProps {
  candidates: CandidateRecord[];
  interviews: InterviewEvaluationRecord[];
  aiSessions: AIInterviewSessionRecord[];
  selectedCandidate: CandidateRecord;
  setSelectedCandidateId: (id: string) => void;
  setSelectedSessionId: (id: string) => void;
  onChangeSubTab: (tab: "rec-submissions") => void;
  onOpenScheduleModal: (candidateIds: string[]) => void;
  intMeetingLink: string;
  setIntMeetingLink: (val: string) => void;
  intScore: number;
  setIntScore: (val: number) => void;
  intNotes: string;
  setIntNotes: (val: string) => void;
  intDecision: "Strong Hire" | "Hire" | "Waitlist" | "No Hire";
  setIntDecision: (val: "Strong Hire" | "Hire" | "Waitlist" | "No Hire") => void;
  postAction: (
    payload: Record<string, unknown>,
    successToast?: string
  ) => Promise<unknown>;
  showToast: (msg: string) => void;
}

function formatSlotShortIST(iso?: string | null, durationMinutes = 30): string {
  if (!iso) return "Not Scheduled";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid slot";
  const datePart = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timePart = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart} IST (${durationMinutes}m)`;
}

export default function PartnerCallsSection({
  candidates,
  interviews,
  aiSessions,
  selectedCandidate,
  setSelectedCandidateId,
  setSelectedSessionId,
  onChangeSubTab,
  onOpenScheduleModal,
  intMeetingLink,
  setIntMeetingLink,
  intScore,
  setIntScore,
  intNotes,
  setIntNotes,
  intDecision,
  setIntDecision,
  postAction,
  showToast,
}: PartnerCallsSectionProps) {
  const [queueFilter, setQueueFilter] = useState<
    "ALL_PIPELINE" | "NEEDS_SCHEDULING" | "UPCOMING" | "COMPLETED"
  >("ALL_PIPELINE");

  const interviewByCandidate = useMemo(() => {
    const map = new Map<string, InterviewEvaluationRecord>();
    for (const inv of interviews) {
      map.set(inv.candidateId, inv);
    }
    return map;
  }, [interviews]);

  const sessionByCandidate = useMemo(() => {
    const map = new Map<string, AIInterviewSessionRecord>();
    for (const s of aiSessions) {
      map.set(s.candidateId, s);
    }
    return map;
  }, [aiSessions]);

  const needsSchedulingList = useMemo(() => {
    return candidates.filter((c) => {
      const inv = interviewByCandidate.get(c.id);
      const isShortlisted =
        c.applicationStatus === "Shortlisted for Final Interview" ||
        c.applicationStatus === "Interview Stage";
      return isShortlisted && !inv;
    });
  }, [candidates, interviewByCandidate]);

  const upcomingList = useMemo(() => {
    return interviews
      .filter((i) => i.status === "Scheduled" || i.status === "Rescheduled")
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [interviews]);

  const completedList = useMemo(() => {
    return interviews
      .filter((i) => i.status === "Completed" || i.status === "No Show")
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.scheduledAt).getTime() -
          new Date(a.completedAt || a.scheduledAt).getTime()
      );
  }, [interviews]);

  const activeInterview = interviewByCandidate.get(selectedCandidate.id);
  const activeSession = sessionByCandidate.get(selectedCandidate.id);

  const visibleItems = useMemo(() => {
    const items: Array<{
      candidate: CandidateRecord;
      interview?: InterviewEvaluationRecord;
      bucket: "NEEDS_SCHEDULING" | "UPCOMING" | "COMPLETED";
    }> = [];

    if (queueFilter === "ALL_PIPELINE" || queueFilter === "NEEDS_SCHEDULING") {
      for (const c of needsSchedulingList) {
        items.push({ candidate: c, bucket: "NEEDS_SCHEDULING" });
      }
    }
    if (queueFilter === "ALL_PIPELINE" || queueFilter === "UPCOMING") {
      for (const inv of upcomingList) {
        const c = candidates.find((cand) => cand.id === inv.candidateId);
        if (c) items.push({ candidate: c, interview: inv, bucket: "UPCOMING" });
      }
    }
    if (queueFilter === "ALL_PIPELINE" || queueFilter === "COMPLETED") {
      for (const inv of completedList) {
        const c = candidates.find((cand) => cand.id === inv.candidateId);
        if (c) items.push({ candidate: c, interview: inv, bucket: "COMPLETED" });
      }
    }
    return items;
  }, [queueFilter, needsSchedulingList, upcomingList, completedList, candidates]);

  return (
    <div className="space-y-5">
      {/* Top Pipeline Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Stage 5 • Partner Calls & Scheduling Pipeline
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Final Interview Schedule & Research Defence Scorecards
          </h3>
          <p className="text-xs text-slate-400">
            Schedule sequential slots, dispatch calendar invites (.ics + email), launch calls, and record final hiring verdicts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {needsSchedulingList.length > 0 && (
            <button
              type="button"
              onClick={() =>
                onOpenScheduleModal(needsSchedulingList.map((c) => c.id))
              }
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>
                Batch Schedule Unscheduled ({needsSchedulingList.length})
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenScheduleModal([selectedCandidate.id])}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Video className="w-4 h-4 text-cyan-400" />
            <span>
              {activeInterview ? "Reschedule Selected" : "Schedule Selected Candidate"}
            </span>
          </button>
        </div>
      </div>

      {/* Main 2-Col Pipeline & Scorecard Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 5 COLS: PIPELINE QUEUE */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800">
            {[
              {
                key: "ALL_PIPELINE",
                label: `All (${needsSchedulingList.length + upcomingList.length + completedList.length})`,
              },
              {
                key: "NEEDS_SCHEDULING",
                label: `Needs Slot (${needsSchedulingList.length})`,
              },
              {
                key: "UPCOMING",
                label: `Upcoming (${upcomingList.length})`,
              },
              {
                key: "COMPLETED",
                label: `Done (${completedList.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setQueueFilter(
                    tab.key as
                      | "ALL_PIPELINE"
                      | "NEEDS_SCHEDULING"
                      | "UPCOMING"
                      | "COMPLETED"
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  queueFilter === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {visibleItems.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Users className="w-6 h-6 text-slate-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">
                No candidates in this interview queue yet
              </div>
              <p className="text-[11px] text-slate-500">
                Shortlist candidates in the Submissions or Shortlisting tab, or click &ldquo;Schedule Selected Candidate&rdquo; above.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {visibleItems.map(({ candidate: c, interview: inv, bucket }) => {
                const isSelected = c.id === selectedCandidate.id;
                const sess = sessionByCandidate.get(c.id);
                const effectiveAiScore =
                  sess?.reviewerOverrideScore ??
                  sess?.scoringBreakdown?.overallAiInterviewScore ??
                  c.aiInterviewScore;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCandidateId(c.id);
                      if (inv?.meetingLink) setIntMeetingLink(inv.meetingLink);
                      if (inv?.overallInterviewScore) setIntScore(inv.overallInterviewScore);
                      if (inv?.overallNotes) setIntNotes(inv.overallNotes);
                      if (inv?.decisionRecommendation) setIntDecision(inv.decisionRecommendation);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition space-y-2 ${
                      isSelected
                        ? "bg-blue-950/50 border-blue-500/60 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-blue-400 font-bold">
                            {c.candidateCode}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              bucket === "NEEDS_SCHEDULING"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : bucket === "UPCOMING"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {bucket === "NEEDS_SCHEDULING"
                              ? "Needs Slot"
                              : bucket === "UPCOMING"
                              ? "Scheduled"
                              : inv?.decisionRecommendation || inv?.status || "Done"}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-white mt-0.5">
                          {c.fullName}
                        </div>
                      </div>

                      {effectiveAiScore !== null && effectiveAiScore !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] font-bold shrink-0">
                          AI: {effectiveAiScore}/100
                        </span>
                      )}
                    </div>

                    {inv ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
                        <span className="text-emerald-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatSlotShortIST(
                              inv.scheduledAt,
                              inv.durationMinutes || 30
                            )}
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          {inv.inviteEmailSentAt && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1"
                              title={`Invite emailed ${new Date(inv.inviteEmailSentAt).toLocaleString("en-IN")}`}
                            >
                              <MailCheck className="w-3 h-3" />
                              <span>Invited</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenScheduleModal([c.id]);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold"
                          >
                            Reschedule
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                        <span className="text-[11px] text-amber-300">
                          Shortlisted — awaiting slot
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenScheduleModal([c.id]);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Schedule &amp; Invite</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback dropdown to pull any non-shortlisted candidate into interviews if needed */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <label className="text-[11px] text-slate-400">
              Jump to any candidate (all {candidates.length}):
            </label>
            <select
              value={selectedCandidate.id}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.candidateCode} — {c.fullName} ({c.applicationStatus})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT 7 COLS: PRE-CALL DOSSIER + SLOT BANNER + SCORECARD + GUIDE */}
        <div className="lg:col-span-7 space-y-5">
          {/* Candidate Pre-Call Snapshot & Scheduled Slot */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-400 font-bold">
                    {selectedCandidate.candidateCode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-semibold">
                    {selectedCandidate.applicationStatus}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  {selectedCandidate.fullName}
                </h4>
                <div className="text-slate-400">
                  {selectedCandidate.email} • {selectedCandidate.institution}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeSession && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSessionId(activeSession.id);
                      onChangeSubTab("rec-submissions");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open Full Transcript</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenScheduleModal([selectedCandidate.id])}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {activeInterview ? "Edit / Re-send Invite" : "Schedule & Send Invite"}
                  </span>
                </button>
              </div>
            </div>

            {/* Pre-call metrics strip */}
            {activeSession && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-[10px] uppercase text-slate-400">AI / Override Score</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {activeSession.reviewerOverrideScore ??
                      activeSession.scoringBreakdown?.overallAiInterviewScore ??
                      "—"}
                    /100
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Phase 3 Winner Pick</div>
                  <div
                    className={`text-sm font-bold ${
                      activeSession.scoringBreakdown?.pickedCorrectWinningStartup
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {activeSession.scoringBreakdown?.pickedCorrectWinningStartup
                      ? "Correct ✓"
                      : "Missed / Partial"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Proctoring</div>
                  <div className="text-sm font-bold text-cyan-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{activeSession.proctoring.integrityScore}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Stage 1 Profile</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {selectedCandidate.profileScore}/100
                  </div>
                </div>
              </div>
            )}

            {activeSession?.reviewerNotes && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
                <span className="font-bold">Pre-Call Reviewer Note: </span>
                <span>{activeSession.reviewerNotes}</span>
              </div>
            )}

            {/* Active slot banner */}
            {activeInterview && (
              <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/35 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {activeInterview.status === "Completed"
                        ? "Completed Interview"
                        : "Confirmed Interview Slot"}
                    </span>
                  </div>
                  <div className="text-white font-semibold">
                    {formatSlotShortIST(
                      activeInterview.scheduledAt,
                      activeInterview.durationMinutes || 30
                    )}{" "}
                    • Panel: {activeInterview.interviewerName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(activeInterview.meetingLink);
                      showToast("Copied Meet link to clipboard!");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </button>
                  <a
                    href={activeInterview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Join Call</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Post-Call Scorecard Form */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base">
              Stage 5: Post-Call Scorecard & Final Verdict ({selectedCandidate.fullName})
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Meeting Link (Google Meet / Zoom)</label>
                  <input
                    value={intMeetingLink}
                    onChange={(e) => setIntMeetingLink(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Partner Interview Score: {intScore}/100</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={intScore}
                    onChange={(e) => setIntScore(Number(e.target.value))}
                    className="w-full mt-3"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400">
                  Defence Observations & Verification Notes
                </label>
                <textarea
                  rows={4}
                  value={intNotes}
                  onChange={(e) => setIntNotes(e.target.value)}
                  placeholder="How effectively did the candidate defend their Phase 3 deal choice, red flags, and independent verification?"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={intDecision}
                  onChange={(e) =>
                    setIntDecision(
                      e.target.value as "Strong Hire" | "Hire" | "Waitlist" | "No Hire"
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
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
                          id: activeInterview?.id,
                          candidateId: selectedCandidate.id,
                          meetingLink: intMeetingLink,
                          scheduledAt: activeInterview?.scheduledAt,
                          durationMinutes: activeInterview?.durationMinutes,
                          status: "Completed",
                          overallInterviewScore: intScore,
                          overallNotes: intNotes,
                          decisionRecommendation: intDecision,
                        },
                      },
                      `Recorded Stage 5 Partner Interview scorecard for ${selectedCandidate.fullName}`
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Completed Scorecard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Standard Research Defence Question Guide */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
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
      </div>
    </div>
  );
}
