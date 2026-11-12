"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Link2,
  Mail,
  RefreshCw,
  Send,
  Users,
  Video,
  X,
} from "lucide-react";
import {
  CandidateRecord,
  InterviewEvaluationRecord,
} from "@/lib/workspace/recruitmentTypes";

interface ScheduleSlotDraft {
  candidateId: string;
  localDateTime: string;
  durationMinutes: number;
  meetingLink: string;
}

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateRecord[];
  existingInterviews: InterviewEvaluationRecord[];
  defaultInterviewerName?: string;
  defaultMeetingLink?: string;
  postAction: (
    payload: Record<string, unknown>,
    successToast?: string
  ) => Promise<{
    ok?: boolean;
    scheduledCount?: number;
    sentCount?: number;
    failedCount?: number;
    errors?: string[];
  } | null>;
  showToast: (msg: string) => void;
}

function toLocalDateTimeInputValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function getDefaultTomorrowSlotIso(hour = 14, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return toLocalDateTimeInputValue(d);
}

function formatSlotPreviewIST(localVal: string, durationMinutes: number): string {
  if (!localVal) return "Pick date & time";
  const start = new Date(localVal);
  if (Number.isNaN(start.getTime())) return "Invalid date";
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const datePart = start.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startPart = start.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endPart = end.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${startPart} – ${endPart} IST`;
}

export default function InterviewScheduleModal({
  isOpen,
  onClose,
  candidates,
  existingInterviews,
  defaultInterviewerName = "Siddharth Kaushik",
  defaultMeetingLink = "https://meet.google.com/dvc-iima-defence",
  postAction,
  showToast,
}: InterviewScheduleModalProps) {
  const isBatch = candidates.length > 1;
  const [startDateTime, setStartDateTime] = useState<string>(() =>
    getDefaultTomorrowSlotIso(14, 0)
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [bufferMinutes, setBufferMinutes] = useState<number>(5);
  const [interviewerName, setInterviewerName] = useState<string>(defaultInterviewerName);
  const [roundLabel, setRoundLabel] = useState<string>(
    "Stage 5: Final Partner & Research Defence"
  );
  const [sharedMeetingLink, setSharedMeetingLink] = useState<string>(defaultMeetingLink);
  const [customNote, setCustomNote] = useState<string>("");
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [slotOverrides, setSlotOverrides] = useState<Record<string, ScheduleSlotDraft>>({});

  // Hydrate initial slot if single candidate already has a scheduled interview
  useEffect(() => {
    if (!isOpen || candidates.length === 0) return;
    setSlotOverrides({});
    if (candidates.length === 1) {
      const existing = existingInterviews.find((i) => i.candidateId === candidates[0]!.id);
      if (existing?.scheduledAt && !Number.isNaN(new Date(existing.scheduledAt).getTime())) {
        setStartDateTime(toLocalDateTimeInputValue(new Date(existing.scheduledAt)));
      } else {
        setStartDateTime(getDefaultTomorrowSlotIso(14, 0));
      }
      if (existing?.meetingLink) setSharedMeetingLink(existing.meetingLink);
      if (existing?.interviewerName) setInterviewerName(existing.interviewerName);
      if (existing?.durationMinutes) setDurationMinutes(existing.durationMinutes);
      if (existing?.roundLabel) setRoundLabel(existing.roundLabel);
      if (existing?.schedulingNote) setCustomNote(existing.schedulingNote);
    } else {
      setStartDateTime(getDefaultTomorrowSlotIso(14, 0));
      setSharedMeetingLink(defaultMeetingLink);
      setCustomNote("");
    }
  }, [isOpen, candidates, existingInterviews, defaultMeetingLink]);

  const computedSlots = useMemo(() => {
    const baseStart = startDateTime ? new Date(startDateTime) : new Date();
    const validBase = Number.isNaN(baseStart.getTime()) ? new Date() : baseStart;
    const stepMs = (Math.max(15, durationMinutes) + Math.max(0, bufferMinutes)) * 60000;

    return candidates.map((cand, idx) => {
      const override = slotOverrides[cand.id];
      const autoDate = new Date(validBase.getTime() + idx * stepMs);
      const localDateTime = override?.localDateTime || toLocalDateTimeInputValue(autoDate);
      const dur = override?.durationMinutes || durationMinutes;
      const meet = override?.meetingLink ?? sharedMeetingLink;
      const existing = existingInterviews.find((i) => i.candidateId === cand.id);
      return {
        candidate: cand,
        localDateTime,
        durationMinutes: dur,
        meetingLink: meet,
        wasScheduled: existing?.status === "Scheduled",
      };
    });
  }, [
    candidates,
    startDateTime,
    durationMinutes,
    bufferMinutes,
    sharedMeetingLink,
    slotOverrides,
    existingInterviews,
  ]);

  if (!isOpen || candidates.length === 0) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const items = computedSlots.map((slot) => ({
        candidateId: slot.candidate.id,
        scheduledAt: new Date(slot.localDateTime).toISOString(),
        durationMinutes: slot.durationMinutes,
        meetingLink: slot.meetingLink.trim() || defaultMeetingLink,
        interviewerName: interviewerName.trim() || "Siddharth Kaushik",
        roundLabel: roundLabel.trim() || "Stage 5: Final Partner & Research Defence",
        customNote: customNote.trim(),
      }));

      const res = await postAction({
        action: "interview.schedule_and_send",
        items,
        sendEmail,
        isReschedule: computedSlots.some((s) => s.wasScheduled),
      });

      if (res) {
        const scheduled = res.scheduledCount ?? items.length;
        const sent = res.sentCount ?? 0;
        const failed = res.failedCount ?? 0;
        if (sendEmail) {
          showToast(
            failed > 0
              ? `Scheduled ${scheduled} interview(s): ${sent} invite(s) emailed, ${failed} failed.`
              : `Scheduled ${scheduled} interview(s) and sent ${sent} calendar invite email(s)!`
          );
        } else {
          showToast(`Saved interview slot(s) for ${scheduled} candidate(s) (email skipped).`);
        }
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              {isBatch ? <Users className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isBatch
                  ? `Batch Schedule Interviews (${candidates.length} Shortlisted Candidates)`
                  : `Schedule Final Interview — ${candidates[0]!.fullName}`}
              </h3>
              <p className="text-xs text-slate-400">
                {isBatch
                  ? "Auto-assigns sequential IST slots with customizable timing, Google Meet link, and .ics calendar invites."
                  : `${candidates[0]!.candidateCode} • ${candidates[0]!.email}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Date/Time Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Quick Start Time Presets (IST)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Tomorrow 11:00 AM", dayOffset: 1, hour: 11, min: 0 },
                { label: "Tomorrow 2:00 PM", dayOffset: 1, hour: 14, min: 0 },
                { label: "Tomorrow 4:30 PM", dayOffset: 1, hour: 16, min: 30 },
                { label: "+2 Days 2:00 PM", dayOffset: 2, hour: 14, min: 0 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + p.dayOffset);
                    d.setHours(p.hour, p.min, 0, 0);
                    setStartDateTime(toLocalDateTimeInputValue(d));
                    setSlotOverrides({});
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isBatch ? "First Slot Start (IST)" : "Interview Date & Time"}</span>
              </label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => {
                  setStartDateTime(e.target.value);
                  setSlotOverrides({});
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Slot Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            {isBatch ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Gap Between Slots
                </label>
                <select
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none"
                >
                  <option value={0}>0 Mins (Back-to-Back)</option>
                  <option value={5}>5 Mins Buffer</option>
                  <option value={10}>10 Mins Buffer</option>
                  <option value={15}>15 Mins Buffer</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Lead Panelist / Interviewer
                </label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Video Call Link (Google Meet / Zoom / Cal Link)</span>
              </label>
              <input
                type="url"
                value={sharedMeetingLink}
                onChange={(e) => setSharedMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isBatch ? "Lead Panelist / Round Title" : "Round Title"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {isBatch && (
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="Panelist name"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none"
                  />
                )}
                <input
                  type="text"
                  value={roundLabel}
                  onChange={(e) => setRoundLabel(e.target.value)}
                  placeholder="Stage 5: Final Defence"
                  className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none ${
                    isBatch ? "" : "col-span-2"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Slot Preview Table (Always visible for Batch, compact summary for Single) */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isBatch
                    ? "Editable Sequential Slot Schedule (IST)"
                    : "Confirmed Candidate Slot Preview"}
                </span>
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {formatSlotPreviewIST(
                  computedSlots[0]!.localDateTime,
                  computedSlots[0]!.durationMinutes
                )}
              </span>
            </div>

            {isBatch && (
              <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
                {computedSlots.map((slot, idx) => (
                  <div
                    key={slot.candidate.id}
                    className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-[180px]">
                      <div className="font-semibold text-white">
                        {idx + 1}. {slot.candidate.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {slot.candidate.candidateCode} • {slot.candidate.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="datetime-local"
                        value={slot.localDateTime}
                        onChange={(e) =>
                          setSlotOverrides((prev) => ({
                            ...prev,
                            [slot.candidate.id]: {
                              candidateId: slot.candidate.id,
                              localDateTime: e.target.value,
                              durationMinutes: slot.durationMinutes,
                              meetingLink: slot.meetingLink,
                            },
                          }))
                        }
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-[11px] font-mono"
                      />
                      <span className="text-[11px] text-emerald-300 min-w-[140px]">
                        {formatSlotPreviewIST(slot.localDateTime, slot.durationMinutes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Optional Note for Candidate Email (e.g. prep topics, waiting room instructions)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Please join 2 minutes early on desktop/laptop and keep your Phase 3 deal triage notes handy."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="mt-0.5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-emerald-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Send Official Interview Invitation Email + Calendar Invite (.ics) via siddharth@deeveecapital.com
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Includes confirmed IST date/time, Google Meet button, and attaches an interactive calendar event (.ics) plus updates Candidate Portal status to Stage 5.
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Status will automatically move to{" "}
            <strong className="text-emerald-300">Interview Stage</strong>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : sendEmail ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>
                {submitting
                  ? "Scheduling..."
                  : sendEmail
                  ? `Confirm Schedule & Send Invite${isBatch ? `s (${candidates.length})` : ""}`
                  : `Save Schedule${isBatch ? `s (${candidates.length})` : ""} Only`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
