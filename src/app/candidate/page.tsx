"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  FileSpreadsheet,
  FileText,
  Laptop,
  Lock,
  Mic,
  MicOff,
  Monitor,
  Play,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Volume2,
  VolumeX,
} from "lucide-react";

interface SanitizedTurn {
  id: string;
  questionIndex: number;
  phase: "RESUME_PROBE" | "STARTUP_THINKING";
  phaseLabel: string;
  resumeContextCited: string;
  questionPrompt: string;
  candidateAnswer: string;
  inputMethod: "voice" | "text" | "hybrid";
  timeTakenSeconds: number;
  answeredAt: string | null;
}

interface SanitizedStartup {
  id: string;
  code: "STARTUP_A" | "STARTUP_B" | "STARTUP_C";
  name: string;
  tagline: string;
  sector: string;
  cityAndStage: string;
  askAmountINR: string;
  proposedValuationINR: string;
  founderHeadlineClaim: string;
  founderBackground: string;
  productAndModel: string;
  financialMetricsTable: Array<{
    metric: string;
    founderDeckValue: string;
    dataRoomVerifiedValue: string;
    auditFootnote: string;
  }>;
  cohortAndOperatingNotes: string[];
  competitorLandscape: string;
}

interface SanitizedCaseSet {
  id: string;
  title: string;
  subtitle: string;
  briefingInstructions: string;
  timeLimitMinutes: number;
  taskPrompts: {
    task1DiscrepancyAuditPrompt: string;
    task2AllocationDecisionPrompt: string;
    task3FounderDiligencePrompt: string;
  };
  startups: SanitizedStartup[];
}

interface SanitizedSession {
  id: string;
  candidateId: string;
  candidateCode: string;
  candidateName: string;
  status:
    | "Not Started"
    | "Phase 1: Resume Probe"
    | "Phase 2: Startup Thinking"
    | "Phase 3: Startup Case Task"
    | "Completed";
  assignedCaseSetId: string;
  startedAt: string;
  completedAt: string | null;
  totalDurationSeconds: number;
  timeLimitMinutes: number;
  currentTurnIndex: number;
  turns: SanitizedTurn[];
  startupTaskSubmission: {
    startupBTrueMetricAnalysis: string;
    startupCTrueMetricAnalysis: string;
    spottedRedFlagsSummary: string;
    selectedStartupFor1CrId: string;
    watchlistedStartupId: string;
    passedStartupId: string;
    investmentThesisAndNumbers: string;
    winningStartupPrimaryRisk: string;
    threeFounderDiligenceQuestions: string;
  } | null;
  proctoring: {
    webcamEnabled: boolean;
    micEnabled: boolean;
    screenShareActive?: boolean;
    fullscreenEntered: boolean;
    fullscreenExitCount: number;
    tabSwitchCount: number;
    copyPasteBlockedCount: number;
    integrityScore: number;
    integrityStatus: string;
    eventsCount: number;
    snapshotsCount?: number;
  };
}

interface CandidatePortalProfile {
  id: string;
  candidateCode: string;
  fullName: string;
  email: string;
  institution: string;
  cohortProgram: string;
  ugDegree: string;
  ugSpecialisation: string;
  internshipSummary: string;
  totalWorkExMonths: number;
  certifications: string;
  achievements: string;
  technicalSkills: string;
  startupResearchExperience: string;
  currentStage: string;
  applicationStatus: string;
  assessmentStatus: string;
  passwordConfigured: boolean;
  assessmentDeadlineAt: string | null;
}

const SAMPLE_TEST_CANDIDATES = [
  {
    code: "DVC-SAMPLE-001",
    name: "Sample Candidate (Demo Sandbox • 13m WorkEx • Strategy Intern @ Litti King • EV/Fintech)",
    email: "sample.candidate@deeveecapital.com",
    password: "DVC@Sample2026",
  },
];

function CandidatePortalInner() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  const codeParam = searchParams.get("code") || "";
  const sampleParam =
    searchParams.get("sample") ||
    searchParams.get("test") ||
    searchParams.get("reset") ||
    "";

  const [sessionToken, setSessionToken] = useState<string>("");
  const [candidate, setCandidate] = useState<CandidatePortalProfile | null>(null);
  const [aiSession, setAiSession] = useState<SanitizedSession | null>(null);
  const [caseSet, setCaseSet] = useState<SanitizedCaseSet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [proctoringWarningBanner, setProctoringWarningBanner] = useState<string>("");

  // Auth form state
  const [loginEmail, setLoginEmail] = useState<string>(emailParam);
  const [loginCode, setLoginCode] = useState<string>(codeParam);
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);

  // Pre-check hardware & proctoring state
  const [preCheckDone, setPreCheckDone] = useState<boolean>(false);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [pledgeAccepted, setPledgeAccepted] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Active Turn State (Phase 1 & Phase 2)
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [turnInputMethod, setTurnInputMethod] = useState<"voice" | "text" | "hybrid">("hybrid");
  const [turnElapsedSec, setTurnElapsedSec] = useState<number>(0);
  const [sessionRemainingSec, setSessionRemainingSec] = useState<number>(45 * 60);
  const [submittingTurn, setSubmittingTurn] = useState<boolean>(false);

  // Phase 3 Startup Virtual Data Room Task State
  const [activeStartupTab, setActiveStartupTab] = useState<string>("COMPARE_ALL");
  const [startupBAnalysis, setStartupBAnalysis] = useState<string>("");
  const [startupCAnalysis, setStartupCAnalysis] = useState<string>("");
  const [spottedRedFlags, setSpottedRedFlags] = useState<string>("");
  const [selected1CrStartupId, setSelected1CrStartupId] = useState<string>("");
  const [watchlistedStartupId, setWatchlistedStartupId] = useState<string>("");
  const [passedStartupId, setPassedStartupId] = useState<string>("");
  const [investmentThesis, setInvestmentThesis] = useState<string>("");
  const [winningStartupRisk, setWinningStartupRisk] = useState<string>("");
  const [threeFounderQuestions, setThreeFounderQuestions] = useState<string>("");
  const [submittingFinalTask, setSubmittingFinalTask] = useState<boolean>(false);
  const [resettingSample, setResettingSample] = useState<boolean>(false);
  const hasInitialLoadedRef = useRef<boolean>(false);

  // Device & Screen Share Proctoring state
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [screenShareActive, setScreenShareActive] = useState<boolean>(false);
  const screenShareStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Ensure dark background on body for proctoring immersion
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = "#070B14";
      document.body.style.color = "#F1F5F9";
    }
  }, []);

  // Detect Mobile / Tablet vs Laptop / Desktop
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isSmallTouch =
      window.innerWidth < 1024 &&
      ("ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0));
    const u = new URLSearchParams(window.location.search);
    const bypass =
      u.get("bypass_device") === "1" ||
      u.get("desktop") === "1" ||
      u.get("sample") === "1" ||
      u.get("test") === "1";
    if ((isMobileUA || isSmallTouch) && !bypass) {
      setIsMobileDevice(true);
    }
  }, []);

  const loadCandidateContext = useCallback(
    async (
      overrideToken?: string,
      overrideEmail?: string,
      overrideCode?: string,
      forceResetSample?: boolean
    ) => {
      setLoading(true);
      setErrorMsg("");

      // Read both from props/searchParams and direct window.location.search for instant hydration
      let urlToken = tokenParam;
      let urlEmail = emailParam;
      let urlCode = codeParam;
      let urlSample = Boolean(sampleParam);

      if (typeof window !== "undefined") {
        const u = new URLSearchParams(window.location.search);
        if (!urlToken && u.get("token")) urlToken = u.get("token") || "";
        if (!urlEmail && u.get("email")) urlEmail = u.get("email") || "";
        if (!urlCode && u.get("code")) urlCode = u.get("code") || "";
        if (!urlSample && (u.get("sample") === "1" || u.get("test") === "1" || u.get("reset") === "1")) {
          urlSample = true;
        }
      }

      const effEmail = overrideEmail || urlEmail;
      const effCode = overrideCode || urlCode;

      try {
        const storedJwt =
          overrideToken ||
          (typeof window !== "undefined"
            ? localStorage.getItem("dvc_candidate_token") || ""
            : "");

        const qs = new URLSearchParams();
        if (urlToken) qs.set("token", urlToken);
        if (effEmail) qs.set("email", effEmail);
        if (effCode) qs.set("code", effCode);
        if (urlSample || forceResetSample) qs.set("sample", "1");

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 35000);

        let res: Response;
        try {
          res = await fetch(`/api/workspace/candidate?${qs.toString()}`, {
            signal: controller.signal,
            headers: storedJwt ? { Authorization: `Bearer ${storedJwt}` } : {},
          });
        } catch (fetchErr: any) {
          if (fetchErr?.name === "AbortError" || String(fetchErr).includes("abort")) {
            console.warn("Connection slow, retrying load without abort timer...");
            res = await fetch(`/api/workspace/candidate?${qs.toString()}`, {
              headers: storedJwt ? { Authorization: `Bearer ${storedJwt}` } : {},
            });
          } else {
            throw fetchErr;
          }
        } finally {
          clearTimeout(timer);
        }

        const data = await res.json();

        if (data.sessionToken) {
          setSessionToken(data.sessionToken);
          if (typeof window !== "undefined") {
            localStorage.setItem("dvc_candidate_token", data.sessionToken);
          }
        }
        if (data.candidate) {
          setCandidate(data.candidate);
          setLoginEmail(data.candidate.email);
          setLoginCode(data.candidate.candidateCode);
        }
        if (data.aiInterviewSession) {
          setAiSession(data.aiInterviewSession);
          const idx = data.aiInterviewSession.currentTurnIndex || 0;
          const activeTurn = data.aiInterviewSession.turns?.[idx];
          if (activeTurn?.candidateAnswer) {
            setCurrentAnswer(activeTurn.candidateAnswer);
          }
        } else {
          setAiSession(null);
          setPreCheckDone(false);
        }
        if (data.assignedCaseSet) {
          setCaseSet(data.assignedCaseSet);
          const sts = data.assignedCaseSet.startups || [];
          setSelected1CrStartupId((prev) => prev || sts[0]?.id || "");
          setWatchlistedStartupId((prev) => prev || sts[1]?.id || "");
          setPassedStartupId((prev) => prev || sts[2]?.id || "");
        }
      } catch (err: any) {
        console.warn("Candidate portal load error:", err);
        const msg = err?.message || String(err);
        if (msg.includes("abort") || err?.name === "AbortError") {
          setErrorMsg("Connection took longer than expected. Please tap 'Retry' or refresh.");
        } else {
          setErrorMsg(msg || "Failed to load candidate portal.");
        }
      } finally {
        setLoading(false);
      }
    },
    [codeParam, emailParam, sampleParam, tokenParam]
  );

  useEffect(() => {
    if (hasInitialLoadedRef.current) return;
    hasInitialLoadedRef.current = true;
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("dvc_candidate_token") || ""
        : "";
    if (saved) setSessionToken(saved);
    void loadCandidateContext(saved);
  }, [loadCandidateContext]);

  // Attach Webcam Stream when video element mounts
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [preCheckDone, aiSession?.status]);

  // Attach Screen Share Stream when video element mounts
  useEffect(() => {
    if (screenVideoRef.current && screenShareStreamRef.current) {
      screenVideoRef.current.srcObject = screenShareStreamRef.current;
    }
  }, [screenShareActive]);

  // Proctoring event logger helper
  const logProctoringEvent = useCallback(
    async (
      eventType:
        | "FULLSCREEN_EXIT"
        | "TAB_SWITCH"
        | "WINDOW_BLUR"
        | "CLIPBOARD_PASTE_BLOCKED"
        | "RAPID_TEXT_INJECTION"
        | "HEARTBEAT_SNAPSHOT"
        | "SCREEN_SHARE_STARTED"
        | "SCREEN_SHARE_STOPPED",
      description: string
    ) => {
      if (!candidate || !aiSession || aiSession.status === "Completed") return;
      if (eventType !== "HEARTBEAT_SNAPSHOT" && eventType !== "SCREEN_SHARE_STARTED") {
        setProctoringWarningBanner(`Proctoring Alert: ${description}`);
        setTimeout(() => setProctoringWarningBanner(""), 6500);
      }
      try {
        const res = await fetch("/api/workspace/candidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
          },
          body: JSON.stringify({
            action: "ai_interview.log_proctoring",
            candidateId: candidate.id,
            eventType,
            description,
            webcamEnabled: webcamActive,
            micEnabled: micActive,
            screenShareActive: screenShareActive,
            fullscreenEntered: Boolean(document.fullscreenElement),
          }),
        });
        const data = await res.json();
        if (data.proctoring && aiSession) {
          setAiSession((prev) =>
            prev
              ? {
                  ...prev,
                  proctoring: {
                    ...prev.proctoring,
                    ...data.proctoring,
                  },
                }
              : prev
          );
        }
      } catch {
        // non-blocking telemetry
      }
    },
    [aiSession, candidate, micActive, screenShareActive, sessionToken, webcamActive]
  );

  // Active Proctoring Listeners (Tab Switch, Window Blur, Fullscreen Exit, Clipboard Paste Block)
  useEffect(() => {
    if (!aiSession || aiSession.status === "Not Started" || aiSession.status === "Completed") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        void logProctoringEvent(
          "TAB_SWITCH",
          "Candidate switched browser tabs or minimized window during proctored session."
        );
      }
    };

    const handleBlur = () => {
      void logProctoringEvent(
        "WINDOW_BLUR",
        "Candidate switched application or lost window focus during proctored session."
      );
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && preCheckDone) {
        void logProctoringEvent(
          "FULLSCREEN_EXIT",
          "Candidate exited Fullscreen Sanctuary Mode during active assessment."
        );
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      void logProctoringEvent(
        "CLIPBOARD_PASTE_BLOCKED",
        "External clipboard paste (Ctrl+V / Cmd+V) blocked by Proctoring Sanctuary."
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("paste", handlePaste);
    };
  }, [aiSession, logProctoringEvent, preCheckDone]);

  // Crash-Free Periodic Low-Bandwidth Screen & Webcam Snapshot Engine (45s–80s randomized)
  useEffect(() => {
    if (
      !aiSession ||
      aiSession.status === "Not Started" ||
      aiSession.status === "Completed"
    ) {
      return;
    }

    let isMounted = true;
    let timeoutId: any = null;

    const captureAndUploadSnapshot = async () => {
      if (!isMounted) return;
      try {
        let snapshotJpeg = "";
        let snapType: "screen" | "webcam" = "screen";

        // 1. Prioritize screen share capture (scaled to 640x360 at 0.32 quality ~18KB)
        if (
          screenVideoRef.current &&
          screenShareActive &&
          screenVideoRef.current.videoWidth > 0
        ) {
          const offscreen = document.createElement("canvas");
          offscreen.width = 640;
          offscreen.height = 360;
          const ctx = offscreen.getContext("2d");
          if (ctx) {
            ctx.drawImage(screenVideoRef.current, 0, 0, 640, 360);
            snapshotJpeg = offscreen.toDataURL("image/jpeg", 0.32);
            snapType = "screen";
          }
        } else if (
          videoRef.current &&
          webcamActive &&
          videoRef.current.videoWidth > 0
        ) {
          // Fallback to webcam frame if screen stream is momentarily paused
          const offscreen = document.createElement("canvas");
          offscreen.width = 320;
          offscreen.height = 240;
          const ctx = offscreen.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 320, 240);
            snapshotJpeg = offscreen.toDataURL("image/jpeg", 0.35);
            snapType = "webcam";
          }
        }

        if (snapshotJpeg && candidate) {
          const controller = new AbortController();
          const reqTimer = setTimeout(() => controller.abort(), 12000);
          try {
            const res = await fetch("/api/workspace/candidate", {
              method: "POST",
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
                ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
              },
              body: JSON.stringify({
                action: "proctoring.snapshot",
                candidateId: candidate.id,
                type: snapType,
                dataUrl: snapshotJpeg,
                timestamp: new Date().toISOString(),
              }),
            });
            const data = await res.json();
            if (data.snapshotsCount && aiSession) {
              setAiSession((prev) =>
                prev
                  ? {
                      ...prev,
                      proctoring: {
                        ...prev.proctoring,
                        snapshotsCount: data.snapshotsCount,
                      },
                    }
                  : prev
              );
            }
          } catch {
            // Non-blocking: background network packet drops will not interrupt candidate
          } finally {
            clearTimeout(reqTimer);
          }
        }
      } catch (err) {
        console.warn("Background snapshot capture non-fatal error:", err);
      }

      if (isMounted) {
        // Randomized delay between 45 and 80 seconds
        const nextDelay = Math.floor(45000 + Math.random() * 35000);
        timeoutId = setTimeout(captureAndUploadSnapshot, nextDelay);
      }
    };

    // First snapshot taken after 12 seconds
    timeoutId = setTimeout(captureAndUploadSnapshot, 12000);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [aiSession?.status, candidate, screenShareActive, sessionToken, webcamActive]);

  // Countdown & Per-Turn Timer
  useEffect(() => {
    if (!aiSession || aiSession.status === "Not Started" || aiSession.status === "Completed") {
      return;
    }
    const interval = setInterval(() => {
      setTurnElapsedSec((s) => s + 1);
      setSessionRemainingSec((rem) => Math.max(0, rem - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [aiSession]);

  // Speak active question prompt using Web Speech Synthesis
  const speakQuestion = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !ttsEnabled) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.02;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore TTS errors
      }
    },
    [ttsEnabled]
  );

  // Trigger TTS when question turn changes
  const activeTurnIndex = aiSession?.currentTurnIndex ?? 0;
  const activeTurn = aiSession?.turns?.[activeTurnIndex] || null;

  useEffect(() => {
    if (
      activeTurn &&
      preCheckDone &&
      (aiSession?.status === "Phase 1: Resume Probe" ||
        aiSession?.status === "Phase 2: Startup Thinking")
    ) {
      speakQuestion(activeTurn.questionPrompt);
    }
  }, [activeTurn, aiSession?.status, preCheckDone, speakQuestion]);

  // Toggle Voice-to-Text Microphone Dictation (Web Speech API)
  const toggleVoiceRecognition = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setErrorMsg(
        "Browser Speech-to-Text API is not supported in this browser window. You can type your response directly below."
      );
      return;
    }

    if (isListeningMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript.trim()) {
          setCurrentAnswer((prev) => `${prev.trim()} ${finalTranscript.trim()}`.trim());
          setTurnInputMethod("voice");
        }
      };

      rec.onerror = () => {
        setIsListeningMic(false);
      };
      rec.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsListeningMic(true);
    } catch {
      setIsListeningMic(false);
    }
  };

  // Request Webcam & Mic Permissions
  const handleEnableHardware = async () => {
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera and microphone access is not supported by your browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      if (!videoTracks.length || !audioTracks.length) {
        throw new Error("Both camera video and microphone audio tracks must be present and active.");
      }
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setWebcamActive(true);
      setMicActive(true);

      videoTracks[0].onended = () => {
        setWebcamActive(false);
        setProctoringWarningBanner("ALERT: Camera stream disconnected! Camera is required to continue proctored assessment.");
      };
      audioTracks[0].onended = () => {
        setMicActive(false);
        setProctoringWarningBanner("ALERT: Microphone stream disconnected! Microphone is required to continue proctored assessment.");
      };
    } catch (err) {
      console.warn("Hardware access error:", err);
      setWebcamActive(false);
      setMicActive(false);
      const msg = (err as Error).message || "";
      if (msg.includes("denied") || msg.includes("Permission") || msg.includes("NotAllowedError")) {
        setErrorMsg("Camera & microphone permission denied. Please click the lock or camera icon in your browser address bar, set Camera & Microphone to 'Allow', and refresh or try again.");
      } else {
        setErrorMsg(`Camera / microphone could not be accessed: ${msg}. A functional camera and microphone are required to complete this assessment.`);
      }
    }
  };

  // For sample / test mode only: allow generating a canvas test stream if physical webcam is absent on the testing device
  const handleEnableVirtualHardwareTestMode = () => {
    if (typeof window === "undefined") return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let tick = 0;
      const renderTestFrame = () => {
        tick++;
        ctx.fillStyle = "#0B132B";
        ctx.fillRect(0, 0, 640, 480);

        ctx.fillStyle = "#1E293B";
        ctx.beginPath();
        ctx.arc(320, 200, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#38BDF8";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PROCTORED WEBCAM SIMULATOR", 320, 190);

        ctx.fillStyle = "#A7F3D0";
        ctx.font = "14px monospace";
        ctx.fillText(`Frame ${tick} | Camera & Mic ACTIVE`, 320, 220);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "12px sans-serif";
        ctx.fillText("Sample Test Mode • Telemetry Active", 320, 310);

        requestAnimationFrame(renderTestFrame);
      };
      renderTestFrame();

      const canvasStream = canvas.captureStream(30);

      // Add dummy audio track using AudioContext oscillator
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const dst = audioCtx.createMediaStreamDestination();
        osc.connect(dst);
        osc.start();
        dst.stream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
      }

      mediaStreamRef.current = canvasStream;
      if (videoRef.current) {
        videoRef.current.srcObject = canvasStream;
        videoRef.current.play().catch(() => {});
      }
      setWebcamActive(true);
      setMicActive(true);
      setErrorMsg("");
    } catch (e) {
      console.warn("Virtual stream error:", e);
    }
  };

  // Request Desktop Screen Share Permissions
  const handleEnableScreenShare = async () => {
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen sharing is not supported by your browser. Please use Google Chrome, Edge, Brave, or Safari on desktop.");
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 5,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: false,
      });
      const videoTracks = stream.getVideoTracks();
      if (!videoTracks.length) {
        throw new Error("No screen capture video track detected.");
      }
      screenShareStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }
      setScreenShareActive(true);
      void logProctoringEvent("SCREEN_SHARE_STARTED", "Screen share proctoring feed started.");

      videoTracks[0].onended = () => {
        setScreenShareActive(false);
        setProctoringWarningBanner(
          "ALERT: Screen share was disconnected! Screen sharing is mandatory to maintain proctoring integrity."
        );
        void logProctoringEvent(
          "SCREEN_SHARE_STOPPED",
          "Candidate stopped screen sharing stream during proctored session."
        );
      };
    } catch (err: any) {
      console.warn("Screen share error:", err);
      setScreenShareActive(false);
      const msg = err?.message || String(err);
      if (
        msg.includes("denied") ||
        msg.includes("Permission") ||
        msg.includes("NotAllowedError") ||
        msg.includes("canceled")
      ) {
        setErrorMsg(
          "Screen share permission was dismissed or denied. Please click 'Enable Screen Share' and choose 'Entire Screen' to proceed."
        );
      } else {
        setErrorMsg(`Screen sharing could not be started: ${msg}. A laptop or desktop display is required.`);
      }
    }
  };

  // For sample / test mode only: allow generating a canvas test stream if screen capture is simulated
  const handleEnableVirtualScreenTestMode = () => {
    if (typeof window === "undefined") return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let tick = 0;
      const renderFrame = () => {
        tick++;
        ctx.fillStyle = "#0A101D";
        ctx.fillRect(0, 0, 1280, 720);

        ctx.fillStyle = "#1E293B";
        ctx.fillRect(0, 0, 1280, 48);
        ctx.fillStyle = "#334155";
        ctx.fillRect(200, 10, 600, 28);
        ctx.fillStyle = "#94A3B8";
        ctx.font = "14px monospace";
        ctx.fillText("https://deeveecapital.com/candidate (Simulated Screen)", 220, 29);

        ctx.fillStyle = "#38BDF8";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("DEEVEE CAPITAL PROCTORED SCREEN SIMULATOR", 640, 340);
        ctx.fillStyle = "#A7F3D0";
        ctx.font = "16px monospace";
        ctx.fillText(`Frame ${tick} | Randomized Telemetry Active`, 640, 385);

        requestAnimationFrame(renderFrame);
      };
      renderFrame();

      const stream = canvas.captureStream(5);
      screenShareStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }
      setScreenShareActive(true);
      void logProctoringEvent("SCREEN_SHARE_STARTED", "Virtual screen proctoring feed started (Test Mode).");
    } catch (e) {
      console.warn("Virtual screen error:", e);
    }
  };

  // Sign In / Activate Candidate Account
  const handleCandidateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/workspace/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: tokenParam ? "activate_account" : "login",
          email: loginEmail,
          candidateCode: loginCode,
          password: loginPassword,
          token: tokenParam,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Authentication failed.");
        return;
      }
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
        localStorage.setItem("dvc_candidate_token", data.sessionToken);
      }
      await loadCandidateContext(data.sessionToken, loginEmail, loginCode);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Start Proctored AI Interview Session
  const handleStartProctoredSession = async () => {
    if (!candidate) return;
    setErrorMsg("");

    if (!webcamActive || !micActive) {
      setErrorMsg("Camera and microphone must be enabled and active before you can start the proctored interview.");
      return;
    }

    if (!screenShareActive) {
      setErrorMsg("Screen share proctoring must be active before you can start. Please enable screen sharing below.");
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Ignore fullscreen error in restricted iframes
    }

    const res = await fetch("/api/workspace/candidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify({
        action: "ai_interview.start",
        candidateId: candidate.id,
        forceRestart: true,
        webcamEnabled: webcamActive,
        micEnabled: micActive,
        screenShareActive: screenShareActive,
        fullscreenEntered: Boolean(document.fullscreenElement),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(data.error || "Failed to start proctored interview.");
      return;
    }

    setPreCheckDone(true);
    if (data.session) {
      setAiSession(data.session);
      setSessionRemainingSec((data.session.timeLimitMinutes || 45) * 60);
      setTurnElapsedSec(0);
      const idx = data.session.currentTurnIndex || 0;
      setCurrentAnswer(data.session.turns?.[idx]?.candidateAnswer || "");
    }
    if (data.assignedCaseSet) {
      setCaseSet(data.assignedCaseSet);
    }
  };

  // Reset & Retake Sample Session anytime
  const handleResetSampleSession = async () => {
    if (!candidate) return;
    setErrorMsg("");
    setResettingSample(true);
    try {
      await fetch("/api/workspace/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          action: "ai_interview.reset",
          candidateId: candidate.id,
        }),
      });
      setAiSession(null);
      setPreCheckDone(false);
      setCurrentAnswer("");
      setTurnElapsedSec(0);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setResettingSample(false);
    }
  };

  // Fast-forward directly to Phase 3 Startup Virtual Data Room Task
  const handleSkipToStartupTask = async () => {
    if (!candidate) return;
    setErrorMsg("");
    try {
      const res = await fetch("/api/workspace/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          action: "ai_interview.skip_to_task",
          candidateId: candidate.id,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setAiSession(data.session);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  // Submit current question turn (Phase 1 & Phase 2)
  const handleSubmitTurnAnswer = async () => {
    if (!candidate || !aiSession || !activeTurn) return;
    if (currentAnswer.trim().split(/\s+/).filter(Boolean).length < 8) {
      setErrorMsg("Please provide a substantive response (at least 8–10 words) before advancing.");
      return;
    }

    if (isListeningMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    }

    setSubmittingTurn(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/workspace/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          action: "ai_interview.submit_turn",
          candidateId: candidate.id,
          turnIndex: aiSession.currentTurnIndex,
          candidateAnswer: currentAnswer.trim(),
          inputMethod: turnInputMethod,
          timeTakenSeconds: Math.max(12, turnElapsedSec),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save response.");
        return;
      }
      if (data.session) {
        setAiSession(data.session);
        setCurrentAnswer("");
        setTurnElapsedSec(0);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmittingTurn(false);
    }
  };

  // Submit Phase 3 Startup Virtual Data Room Simulation & Complete Session
  const handleCompleteStartupSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate || !aiSession || !caseSet) return;

    if (
      !startupBAnalysis.trim() ||
      !startupCAnalysis.trim() ||
      !investmentThesis.trim() ||
      !winningStartupRisk.trim() ||
      !threeFounderQuestions.trim()
    ) {
      setErrorMsg(
        "Please complete all 3 Analyst Tasks (Discrepancy Audit, ₹1 Cr Allocation Thesis, and Founder Diligence Questions) before final submission."
      );
      return;
    }

    setSubmittingFinalTask(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/workspace/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          action: "ai_interview.submit_complete",
          candidateId: candidate.id,
          startupTaskSubmission: {
            startupBTrueMetricAnalysis: startupBAnalysis,
            startupCTrueMetricAnalysis: startupCAnalysis,
            spottedRedFlagsSummary:
              spottedRedFlags || `${startupBAnalysis} | ${startupCAnalysis}`,
            selectedStartupFor1CrId: selected1CrStartupId || caseSet.startups[0]?.id,
            watchlistedStartupId: watchlistedStartupId || caseSet.startups[1]?.id,
            passedStartupId: passedStartupId || caseSet.startups[2]?.id,
            investmentThesisAndNumbers: investmentThesis,
            winningStartupPrimaryRisk: winningStartupRisk,
            threeFounderDiligenceQuestions: threeFounderQuestions,
            timeSpentSeconds: Math.max(180, turnElapsedSec),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit Startup Simulation Task.");
        return;
      }
      if (data.session) setAiSession(data.session);
      if (data.candidate) setCandidate(data.candidate);
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmittingFinalTask(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div
        id="main-content"
        style={{
          minHeight: "100vh",
          backgroundColor: "#070B14",
          color: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
        className="min-h-screen bg-[#070B14] text-slate-100 flex items-center justify-center"
      >
        <div
          className="flex flex-col items-center gap-3"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}
        >
          <RefreshCw
            className="w-7 h-7 text-blue-400 animate-spin"
            style={{ width: "28px", height: "28px", color: "#60A5FA" }}
          />
          <p
            className="text-sm text-slate-300 font-medium"
            style={{ fontSize: "14px", color: "#CBD5E1", fontWeight: 500 }}
          >
            Initializing Deevee Capital Proctored Assessment Environment...
          </p>
        </div>
      </div>
    );
  }

  // LAPTOP & DESKTOP COMPUTER ENFORCEMENT BLOCKER
  if (isMobileDevice) {
    return (
      <div
        id="main-content"
        className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-blue-600 selection:text-white"
      >
        <div className="max-w-md w-full bg-[#0D1527] border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center shadow-inner">
            <Laptop className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Laptop or Desktop Required</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Desktop Assessment Environment
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The Deevee Capital Investment Assessment is a 45-minute timed session involving a live webcam & mic proctored AI interview, continuous screen monitoring, and a 3-startup Virtual Data Room financial triage.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Why Laptop Only?
            </div>
            <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
              <li>Physical keyboard required for financial triage</li>
              <li>Dual webcam & screen-share proctoring</li>
              <li>Fullscreen sanctuary anti-cheat enforcement</li>
            </ul>
          </div>

          {candidate && (
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-left text-xs space-y-0.5">
              <div className="text-[10px] text-blue-300 uppercase font-semibold">Applicant:</div>
              <div className="font-semibold text-white">{candidate.fullName} ({candidate.candidateCode})</div>
              <div className="text-slate-400 truncate text-[11px]">{candidate.email}</div>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 4000);
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg min-h-[46px]"
            >
              {linkCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Link Copied! Open on Laptop</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Assessment Link</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 leading-normal">
              Copy this link and open in Google Chrome, Edge, Brave, or Safari on your laptop.
            </p>

            <button
              type="button"
              onClick={() => setIsMobileDevice(false)}
              className="text-[11px] text-slate-500 hover:text-slate-400 underline pt-2 block mx-auto"
            >
              Bypass Device Check (Test Mode Only)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* TOP PROCTORING & BRAND BAR */}
      <header className="border-b border-slate-800/80 bg-[#0B1120]/95 backdrop-blur sticky top-0 z-40 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-sm shrink-0">
            DV
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-white">
                DEEVEE CAPITAL
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
                Assessment Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Investment Research & Startup Sourcing Intern • Proctored AI Interview & Deal Desk
            </p>
          </div>
        </div>

        {candidate && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {aiSession && aiSession.status !== "Not Started" && aiSession.status !== "Completed" && (
              <>
                <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400 hidden sm:inline">Timer:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {formatTimer(sessionRemainingSec)}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-700/40 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Proctoring:</span>
                  <span className="font-bold text-emerald-300">
                    {aiSession.proctoring.integrityScore}%
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="font-medium text-white max-w-[110px] sm:max-w-none truncate">{candidate.fullName}</span>
              <span className="text-slate-400 font-mono text-[10px] sm:text-xs">({candidate.candidateCode})</span>
              {aiSession && (
                <button
                  type="button"
                  onClick={handleResetSampleSession}
                  disabled={resettingSample}
                  className="ml-1 sm:ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-medium text-[10px] sm:text-[11px] transition flex items-center gap-1 shrink-0"
                  title="Reset this candidate's session to take the interview again from the start"
                >
                  <RefreshCw className={`w-3 h-3 ${resettingSample ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Reset & Retake</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("dvc_candidate_token");
                  setSessionToken("");
                  setCandidate(null);
                  setAiSession(null);
                  setPreCheckDone(false);
                }}
                className="ml-1 text-slate-400 hover:text-rose-400 underline text-[10px] sm:text-[11px]"
              >
                Switch
              </button>
            </div>
          </div>
        )}
      </header>

      {/* PROCTORING ALERT BANNER */}
      {proctoringWarningBanner && (
        <div className="bg-rose-950/90 border-b border-rose-700 px-6 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{proctoringWarningBanner}</span>
          </div>
          <span className="font-mono text-[11px] text-rose-300">Logged to Audit Trail</span>
        </div>
      )}

      {errorMsg && (
        <div className="max-w-5xl mx-auto w-full mt-4 px-6">
          <div className="bg-rose-950/60 border border-rose-700/60 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="text-rose-300 hover:text-white font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
        {/* ===================================================================
            STEP 1: CANDIDATE SIGN-IN / ACCOUNT ACTIVATION
           =================================================================== */}
        {!candidate ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Candidate Assessment • 45-Min Timed Session</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Investment Research & Startup Sourcing Intern Assessment
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Welcome to Deevee Capital’s candidate evaluation portal. Unlike generic multiple-choice tests, this session evaluates how you defend your past work, how you verify founder claims, and how you allocate capital across real startup dossiers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
                    Phase 1 (12 Mins)
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-white mb-1">
                    AI Resume & Research Probe
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Personalized questions generated directly from your profile, internships, and research experience.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                    Phase 2 (13 Mins)
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-white mb-1">
                    Startup & VC Judgement
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    3 adaptive questions testing non-obvious Indian startup sourcing, bottom-up TAM verification, and cash traps.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Phase 3 (20 Mins)
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-white mb-1">
                    Startup Virtual Data Room
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Audit 3 Indian startups seeking ₹1 Crore, expose hidden financial red flags, and defend your top pick.
                  </p>
                </div>
              </div>

              {/* QUICK PROFILE SELECTOR FOR DEMO / TESTING (ONLY VISIBLE IN SAMPLE MODE) */}
              {sampleParam && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Quick-Load Applicant Profile (Sandbox Sample Mode)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {SAMPLE_TEST_CANDIDATES.map((sc) => (
                      <button
                        key={sc.code}
                        type="button"
                        onClick={() => {
                          setLoginEmail(sc.email);
                          setLoginCode(sc.code);
                          setLoginPassword(sc.password || "DVC@Sample2026");
                        }}
                        className="text-left p-2.5 rounded-lg bg-slate-950/80 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 transition text-xs"
                      >
                        <div className="font-mono text-[11px] text-blue-400">{sc.code}</div>
                        <div className="font-medium text-slate-200 truncate">{sc.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{sc.email}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <form
                onSubmit={handleCandidateAuth}
                className="p-4 sm:p-6 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 sm:pb-4">
                  <Lock className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-white">
                      Candidate Sign-In & Activation
                    </h2>
                    <p className="text-xs text-slate-400">
                      Use your registered application email
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Application Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="yourname@institution.edu"
                    className="w-full px-3.5 py-3 sm:py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Candidate ID (Optional — e.g. DVC-IIMA-063)
                  </label>
                  <input
                    type="text"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    placeholder="DVC-IIMA-001"
                    className="w-full px-3.5 py-3 sm:py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Set / Enter Portal Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Create or enter your password"
                    className="w-full px-3.5 py-3 sm:py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2 min-h-[46px]"
                >
                  {authSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Access Proctored Assessment</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : aiSession?.status === "Completed" ? (
          /* ===================================================================
             COMPLETED SESSION CONFIRMATION SCREEN
             =================================================================== */
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-[#0D1527] border border-emerald-700/50 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Submission Confirmed & Locked
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-0.5">
                    Thank you, {candidate.fullName} ({candidate.candidateCode})
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    Your Proctored AI Interview responses and Startup Virtual Data Room Deal Triage have been recorded and transmitted to the Deevee Capital Investment Team.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetSampleSession}
                disabled={resettingSample}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-2 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${resettingSample ? "animate-spin" : ""}`} />
                <span>Reset & Take Interview Again (Sample Mode)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div>
                <div className="text-slate-400">Interview Questions Completed</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {aiSession.turns.length} / {aiSession.turns.length} Turns
                </div>
              </div>
              <div>
                <div className="text-slate-400">Startup Deal Simulation</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  Submitted ({caseSet?.title.split("—")[0] || "Case Set"})
                </div>
              </div>
              <div>
                <div className="text-slate-400">Proctoring Integrity</div>
                <div className="text-base font-bold text-blue-400 mt-0.5">
                  {aiSession.proctoring.integrityScore}% ({aiSession.proctoring.integrityStatus})
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Recorded Interview Transcript Summary
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {aiSession.turns.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="font-semibold text-blue-300">
                      Q{t.questionIndex} ({t.phaseLabel}): {t.questionPrompt}
                    </div>
                    <div className="text-slate-300">{t.candidateAnswer}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !preCheckDone ? (
          /* ===================================================================
             STEP 2: 60-SECOND PROCTORING & HARDWARE SANCTUARY ONBOARDING
             =================================================================== */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-[#0D1527] border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Pre-Session Sanctuary Check
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    Welcome, {candidate.fullName} ({candidate.candidateCode})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Your interview has been dynamically personalized using your profile.
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="text-slate-400">Total Allotted Duration</div>
                  <div className="text-base font-bold text-white">45 Minutes (Proctored)</div>
                </div>
              </div>

              {/* EXTRACTED RESUME CONTEXT PREVIEW */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Your Imported Profile Context (Used by AI Interviewer in Phase 1)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400">UG Background: </span>
                    <span className="text-slate-200 font-medium">
                      {candidate.ugDegree} ({candidate.ugSpecialisation || "General"})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Internships & Work Ex: </span>
                    <span className="text-slate-200 font-medium">
                      {candidate.internshipSummary || "Fresher"} ({candidate.totalWorkExMonths} mos work-ex)
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Prior Startup/Market Research Response: </span>
                    <span className="text-slate-300 italic">
                      &ldquo;{candidate.startupResearchExperience || "None stated"}&rdquo;
                    </span>
                  </div>
                </div>
              </div>

              {/* HIDDEN OFFSCREEN VIDEO ELEMENT FOR SCREEN SHARE CANVAS SNAPSHOTS */}
              <video ref={screenVideoRef} autoPlay playsInline muted className="hidden" />

              {/* HARDWARE, SCREEN SHARE & PROCTORING RULES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT: LIVE HARDWARE & SCREEN SHARE FEEDS */}
                <div className="space-y-4">
                  {/* CAMERA & MIC FEED */}
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span>Webcam & Microphone Feed</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            webcamActive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {webcamActive ? "● Camera Active" : "○ Camera Offline"}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            micActive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {micActive ? "● Mic Active" : "○ Mic Offline"}
                        </span>
                      </div>
                    </div>

                    <div className="aspect-video rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${webcamActive ? "block" : "hidden"}`}
                      />
                      {!webcamActive && (
                        <div className="text-center p-4 space-y-2">
                          <Camera className="w-8 h-8 text-rose-400/80 mx-auto" />
                          <p className="text-xs text-slate-300 font-medium">
                            Camera & Microphone Required for Proctored Assessment
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Click below to allow camera & mic. Without an active video and audio feed, the assessment will remain locked.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleEnableHardware}
                        className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <span>{webcamActive && micActive ? "Camera & Mic Connected (Click to Re-test)" : "Enable Camera & Microphone (Required)"}</span>
                      </button>

                      {(sampleParam || (typeof window !== "undefined" && (window.location.search.includes("sample=1") || window.location.search.includes("test=1")))) && (
                        <button
                          type="button"
                          onClick={handleEnableVirtualHardwareTestMode}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition flex items-center justify-center gap-1.5"
                          title="Simulates virtual camera & mic stream for testing without a physical webcam"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Simulate Virtual Camera & Mic (Test Mode Only)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SCREEN SHARE PROCTORING FEED */}
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Monitor className="w-4 h-4 text-indigo-400" />
                        <span>Desktop Screen Share Monitoring</span>
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          screenShareActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {screenShareActive ? "● Screen Sharing Active" : "○ Screen Offline"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Periodic low-bandwidth background snapshots (~18 KB) verify no unauthorized materials or external assistance are used. Please choose <strong>Entire Screen</strong> when prompted.
                    </p>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleEnableScreenShare}
                        className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Monitor className="w-3.5 h-3.5 text-white" />
                        <span>{screenShareActive ? "Screen Share Active (Click to Re-select)" : "Enable Screen Share (Required)"}</span>
                      </button>

                      {(sampleParam || (typeof window !== "undefined" && (window.location.search.includes("sample=1") || window.location.search.includes("test=1")))) && (
                        <button
                          type="button"
                          onClick={handleEnableVirtualScreenTestMode}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition flex items-center justify-center gap-1.5"
                          title="Simulates virtual screen stream for testing without browser screen prompts"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Simulate Virtual Screen (Test Mode Only)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: SANCTUARY RULES & PLEDGE */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Proctored Sanctuary Rules</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">1.</span>
                        <span>
                          <strong>Camera & Mic Mandatory:</strong> Live video and audio feed must stay active throughout all 3 phases.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">2.</span>
                        <span>
                          <strong>Screen Share Active:</strong> Periodic compressed snapshots (~18 KB) verify compliance without slowing down internet.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">3.</span>
                        <span>
                          <strong>Fullscreen Lock:</strong> The session runs in Fullscreen Sanctuary mode. Exiting fullscreen logs a proctoring violation.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">4.</span>
                        <span>
                          <strong>No Tab Switching:</strong> Switching tabs or windows (`Alt+Tab`) deducts points from your Integrity Score.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">5.</span>
                        <span>
                          <strong>Clipboard Locked:</strong> Pasting external text (`Ctrl+V` / `Cmd+V`) is blocked. Speak answers or type original analysis.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={pledgeAccepted}
                      onChange={(e) => setPledgeAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      I confirm that I am completing this assessment independently without external assistance, and I consent to audio, video, and screen proctoring telemetry.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
                {!webcamActive || !micActive ? (
                  <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/60 border border-rose-700/60 px-3.5 py-2 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Camera & Microphone Required:</strong> Please click &ldquo;Enable Camera & Microphone&rdquo; above. You cannot start without active audio/video.
                    </span>
                  </div>
                ) : !screenShareActive ? (
                  <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/60 border border-rose-700/60 px-3.5 py-2 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Screen Share Required:</strong> Please click &ldquo;Enable Screen Share&rdquo; above. Continuous screen monitoring is mandatory.
                    </span>
                  </div>
                ) : !pledgeAccepted ? (
                  <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-700/50 px-3.5 py-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Camera, Mic & Screen Verified. Please check the proctoring pledge to proceed.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-700/50 px-3.5 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sanctuary Ready: Camera, Microphone, Screen Share, and Pledge Verified.</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!pledgeAccepted || !webcamActive || !micActive || !screenShareActive}
                  onClick={handleStartProctoredSession}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg transition flex items-center gap-2 shrink-0"
                  title={
                    !webcamActive || !micActive
                      ? "Camera and microphone must be enabled before you can start"
                      : !screenShareActive
                      ? "Screen share must be enabled before you can start"
                      : !pledgeAccepted
                      ? "Please check the anti-cheat pledge to start"
                      : "Start the 45-minute assessment"
                  }
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Enter Fullscreen & Start 45-Min AI Interview</span>
                </button>
              </div>
            </div>
          </div>
        ) : aiSession &&
          (aiSession.status === "Phase 1: Resume Probe" ||
            aiSession.status === "Phase 2: Startup Thinking") &&
          activeTurn ? (
          /* ===================================================================
             STEP 3: PHASE 1 (RESUME PROBE) & PHASE 2 (STARTUP THINKING)
             =================================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: AI INTERVIEWER & QUESTION STAGE */}
            <div className="lg:col-span-8 space-y-5">
              {/* PROGRESS STEPPER */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#0D1527] border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold">
                    Question {activeTurn.questionIndex} of {aiSession.turns.length}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    {activeTurn.phaseLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSkipToStartupTask}
                    disabled={submittingTurn}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition flex items-center gap-1"
                    title="Fast-forward directly to Phase 3: Startup Virtual Data Room Task"
                  >
                    <span>Skip to Phase 3</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {aiSession.turns.map((t, idx) => (
                      <div
                        key={t.id}
                        className={`h-2 rounded-full transition-all ${
                          idx < aiSession.currentTurnIndex
                            ? "w-4 sm:w-6 bg-emerald-500"
                            : idx === aiSession.currentTurnIndex
                            ? "w-6 sm:w-8 bg-blue-500"
                            : "w-3 sm:w-4 bg-slate-800"
                        }`}
                      />
                    ))}
                    <div className="h-2 w-5 sm:w-8 rounded-full bg-slate-800 ml-0.5 sm:ml-1" title="Phase 3: Startup Task" />
                  </div>
                </div>
              </div>

              {/* MOBILE PROCTORING PILL (< lg) */}
              <div className="lg:hidden p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">Camera & Mic Streaming</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold">
                  {aiSession.proctoring.integrityScore}% Integrity
                </span>
              </div>

              {/* AI INTERVIEWER PROMPT CARD */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0F1A30] to-[#0B1222] border border-blue-500/30 shadow-xl space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] sm:text-xs font-medium max-w-[80%] truncate">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Context: {activeTurn.resumeContextCited}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !ttsEnabled;
                      setTtsEnabled(next);
                      if (next) speakQuestion(activeTurn.questionPrompt);
                      else if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 shrink-0"
                  >
                    {ttsEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">AI Voice On</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Muted</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
                  &ldquo;{activeTurn.questionPrompt}&rdquo;
                </div>
              </div>

              {/* CANDIDATE VOICE + LIVE TRANSCRIPT RESPONSE BOX */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#0D1527] border border-slate-800 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleVoiceRecognition}
                      className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition min-h-[44px] sm:min-h-0 ${
                        isListeningMic
                          ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                          : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40"
                      }`}
                    >
                      {isListeningMic ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Listening... Tap to Pause</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>Speak Answer (Voice-to-Text)</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Speak naturally or type/refine below (Paste locked)
                    </span>
                  </div>

                  <div className="text-[11px] sm:text-xs font-mono text-slate-400 text-right">
                    Words: {currentAnswer.trim().split(/\s+/).filter(Boolean).length} | Elapsed:{" "}
                    {formatTimer(turnElapsedSec)}
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    void logProctoringEvent(
                      "CLIPBOARD_PASTE_BLOCKED",
                      "Attempted clipboard paste inside AI Interview response box."
                    );
                  }}
                  placeholder="Speak using your microphone or type your structured response here... Cite concrete numbers, methodology, and how you verified your conclusions."
                  className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-slate-400">
                    Tip: Be specific—mention exact metrics, ratios, and verification sources.
                  </span>

                  <button
                    type="button"
                    disabled={submittingTurn}
                    onClick={handleSubmitTurnAnswer}
                    className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {submittingTurn ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>
                          {aiSession.currentTurnIndex + 1 < aiSession.turns.length
                            ? "Submit & Next Question"
                            : "Submit & Proceed to Phase 3"}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE WEBCAM PROCTORING & SESSION STATUS */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Proctoring Feed</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[11px]">
                    REC • {aiSession.proctoring.integrityScore}%
                  </span>
                </div>

                <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${webcamActive ? "block" : "hidden"}`}
                  />
                  {!webcamActive && (
                    <div className="text-center p-4">
                      <ShieldCheck className="w-7 h-7 text-emerald-400 mx-auto mb-1" />
                      <p className="text-[11px] text-slate-400">
                        Audio & Browser Sanctuary Telemetry Active
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-400">Tab Switches</div>
                    <div className="font-bold text-white">
                      {aiSession.proctoring.tabSwitchCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-400">Paste Blocked</div>
                    <div className="font-bold text-white">
                      {aiSession.proctoring.copyPasteBlockedCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-400">Snapshots</div>
                    <div className="font-bold text-emerald-400">
                      {aiSession.proctoring.snapshotsCount || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D1527] border border-slate-800 space-y-2.5 text-xs">
                <div className="font-semibold text-slate-200 uppercase tracking-wider">
                  Session Roadmap
                </div>
                <div className="space-y-2">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      activeTurn.phase === "RESUME_PROBE"
                        ? "bg-blue-950/40 border-blue-500/40 text-blue-200"
                        : "bg-slate-900/50 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="font-semibold">Phase 1: Resume & Research Probe</div>
                    <div className="text-[11px] opacity-80">Questions 1–3 • Personalized CV Check</div>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg border ${
                      activeTurn.phase === "STARTUP_THINKING"
                        ? "bg-blue-950/40 border-blue-500/40 text-blue-200"
                        : "bg-slate-900/50 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="font-semibold">Phase 2: Startup & VC Thinking</div>
                    <div className="text-[11px] opacity-80">
                      Questions 4–6 • Sourcing, TAM & Red Flags
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-900/50 border-slate-800 text-slate-400">
                    <div className="font-semibold">Phase 3: Virtual Startup Data Room</div>
                    <div className="text-[11px] opacity-80">
                      3 Dummy Indian Startups • ₹1 Cr Triage Task
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : aiSession && aiSession.status === "Phase 3: Startup Case Task" && caseSet ? (
          /* ===================================================================
             STEP 4: PHASE 3 — INTERACTIVE STARTUP VIRTUAL DATA ROOM & TASK
             =================================================================== */
          <div className="space-y-6">
            {/* DATA ROOM HEADER */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1B33] to-[#0D1527] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold mb-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Phase 3 of 3 • Interactive Startup Virtual Data Room</span>
                </div>
                <h2 className="text-xl font-bold text-white">{caseSet.title}</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed">
                  {caseSet.briefingInstructions}
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveStartupTab("COMPARE_ALL")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                    activeStartupTab === "COMPARE_ALL"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-900 text-slate-300 border border-slate-700 hover:text-white"
                  }`}
                >
                  View All 3 Startups
                </button>
                {caseSet.startups.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveStartupTab(st.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                      activeStartupTab === st.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-900 text-slate-300 border border-slate-700 hover:text-white"
                    }`}
                  >
                    {st.code.replace("_", " ")}: {st.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* MOBILE QUICK JUMP PILL (< xl) */}
            <div className="xl:hidden p-3 rounded-xl bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-blue-800/50 flex items-center justify-between text-xs gap-3">
              <span className="text-blue-200">Inspect startup ledgers below, then record your deal triage:</span>
              <a
                href="#deal-triage-form"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow-sm shrink-0"
              >
                <span>Jump to Worksheet ↓</span>
              </a>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT 7 COLS: STARTUP DOSSIERS & FINANCIAL AUDIT TABLES */}
              <div className="xl:col-span-7 space-y-5">
                {caseSet.startups
                  .filter(
                    (st) => activeStartupTab === "COMPARE_ALL" || activeStartupTab === st.id
                  )
                  .map((st) => (
                    <div
                      key={st.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#0D1527] border border-slate-800 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                              {st.code.replace("_", " ")}
                            </span>
                            <h3 className="text-base font-bold text-white">{st.name}</h3>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">{st.tagline}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {st.sector} • {st.cityAndStage}
                          </p>
                        </div>

                        <div className="text-right bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                          <div className="text-[11px] text-slate-400">Funding Ask</div>
                          <div className="text-sm font-bold text-emerald-400">
                            {st.askAmountINR}{" "}
                            <span className="text-xs font-normal text-slate-400">
                              @ {st.proposedValuationINR}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* FOUNDER HEADLINE PITCH CLAIM */}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                        <span className="font-semibold text-amber-300 uppercase tracking-wider block mb-0.5">
                          Founder Pitch Deck Headline Claim:
                        </span>
                        <span className="text-amber-100 italic">{st.founderHeadlineClaim}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <span className="text-slate-400 font-semibold block mb-0.5">
                            Founding Team:
                          </span>
                          <span className="text-slate-200">{st.founderBackground}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <span className="text-slate-400 font-semibold block mb-0.5">
                            Business Model:
                          </span>
                          <span className="text-slate-200">{st.productAndModel}</span>
                        </div>
                      </div>

                      {/* DATA ROOM VERIFIED LEDGER TABLE */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-slate-400 sm:hidden flex items-center gap-1">
                          <span>← Swipe table horizontally to inspect Audit Footnotes →</span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="min-w-[620px] w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                                <th className="p-2.5 font-semibold">Metric</th>
                                <th className="p-2.5 font-semibold">Founder Deck Claim</th>
                                <th className="p-2.5 font-semibold text-blue-300">
                                  Verified Data Room Reality
                                </th>
                                <th className="p-2.5 font-semibold text-amber-300">
                                  Audit Footnote & Clue
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/70 bg-slate-950/60">
                              {st.financialMetricsTable.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-900/40">
                                  <td className="p-2.5 font-medium text-white">{row.metric}</td>
                                  <td className="p-2.5 text-slate-400">{row.founderDeckValue}</td>
                                  <td className="p-2.5 font-semibold text-blue-200">
                                    {row.dataRoomVerifiedValue}
                                  </td>
                                  <td className="p-2.5 text-slate-300 leading-relaxed">
                                    {row.auditFootnote}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <div className="font-semibold text-slate-300">
                          Additional Data Room Notes & Competitors ({st.competitorLandscape}):
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {st.cohortAndOperatingNotes.map((note, nIdx) => (
                            <li key={nIdx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>

              {/* RIGHT 5 COLS: ANALYST DEAL TRIAGE SUBMISSION FORM */}
              <div className="xl:col-span-5">
                <form
                  id="deal-triage-form"
                  onSubmit={handleCompleteStartupSimulation}
                  className="p-4 sm:p-6 rounded-2xl bg-[#0D1527] border border-blue-500/40 shadow-2xl space-y-5 xl:sticky xl:top-20"
                >
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Analyst Deliverable • 100 Marks
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Deevee Capital ₹1 Crore Deal Triage Worksheet
                    </h3>
                  </div>

                  {/* TASK 1 */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-amber-300">
                      Task 1 (25 Marks): Expose the Data Room Discrepancies
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {caseSet.taskPrompts.task1DiscrepancyAuditPrompt}
                    </p>

                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1">
                        1A. Audit {caseSet.startups[1]?.name} (Startup B) — True Paying Revenue vs Pitch Claim *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={startupBAnalysis}
                        onChange={(e) => setStartupBAnalysis(e.target.value)}
                        placeholder="State the true paying ARR/cash vs founder claim and explain the free-trial/LOI/ISA & churn trap..."
                        className="w-full p-3 sm:p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1">
                        1B. Audit {caseSet.startups[2]?.name} (Startup C) — True Unit Economics & Cash Trap *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={startupCAnalysis}
                        onChange={(e) => setStartupCAnalysis(e.target.value)}
                        placeholder="Calculate the true net contribution margin after RTO/CAC/EMI/defaults and explain why scaling burns cash..."
                        className="w-full p-3 sm:p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* TASK 2 */}
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <div className="text-xs font-semibold text-emerald-300">
                      Task 2 (40 Marks): ₹1 Crore Capital Allocation Decision
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] text-emerald-400 font-semibold mb-1">
                          Advance to IC (₹1 Cr) *
                        </label>
                        <select
                          value={selected1CrStartupId}
                          onChange={(e) => setSelected1CrStartupId(e.target.value)}
                          className="w-full p-3 sm:p-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-base sm:text-xs min-h-[44px]"
                        >
                          {caseSet.startups.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.code.replace("_", " ")}: {st.name.split(" ")[0]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-amber-400 font-semibold mb-1">
                          Watchlist / Hold *
                        </label>
                        <select
                          value={watchlistedStartupId}
                          onChange={(e) => setWatchlistedStartupId(e.target.value)}
                          className="w-full p-3 sm:p-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-base sm:text-xs min-h-[44px]"
                        >
                          {caseSet.startups.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.code.replace("_", " ")}: {st.name.split(" ")[0]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-rose-400 font-semibold mb-1">
                          Pass / Reject *
                        </label>
                        <select
                          value={passedStartupId}
                          onChange={(e) => setPassedStartupId(e.target.value)}
                          className="w-full p-3 sm:p-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-base sm:text-xs min-h-[44px]"
                        >
                          {caseSet.startups.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.code.replace("_", " ")}: {st.name.split(" ")[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1">
                        Investment Thesis for Your Winning Startup (Cite Verified Data Room Numbers) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={investmentThesis}
                        onChange={(e) => setInvestmentThesis(e.target.value)}
                        placeholder="Why does your selected startup deserve Deevee Capital's ₹1 Cr check? Cite verified quarterly revenue, QoQ growth, gross/EBITDA margin, and payback..."
                        className="w-full p-3 sm:p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* TASK 3 */}
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <div className="text-xs font-semibold text-blue-300">
                      Task 3 (35 Marks): Key Risk & 3 Founder Diligence Questions
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1">
                        3A. What is the #1 Structural Risk in Your Winning Startup? *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={winningStartupRisk}
                        onChange={(e) => setWinningStartupRisk(e.target.value)}
                        placeholder="Identify the exact customer/supplier concentration % and receivable debtor-day working capital risk from the table..."
                        className="w-full p-3 sm:p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1">
                        3B. Write 3 Sharp Diligence Questions for Tomorrow&apos;s Founder Call *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={threeFounderQuestions}
                        onChange={(e) => setThreeFounderQuestions(e.target.value)}
                        placeholder={`1. Question on customer/contract concentration...\n2. Question on working capital / debtor days...\n3. Question on unit economics / expansion moat...`}
                        className="w-full p-3 sm:p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFinalTask}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
                  >
                    {submittingFinalTask ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Deal Triage & Complete Proctored Assessment</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function CandidateAssessmentPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B14] text-slate-200 flex items-center justify-center text-sm">
          Loading Deevee Capital Candidate Assessment Portal...
        </div>
      }
    >
      <CandidatePortalInner />
    </Suspense>
  );
}
