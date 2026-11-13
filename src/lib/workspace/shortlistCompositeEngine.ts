import {
  AIInterviewSessionRecord,
  CandidateRecord,
  StartupCaseSet,
} from "./recruitmentTypes";

export interface ShortlistWeightsConfig {
  profileWeight: number; // default 25
  humannessWeight: number; // default 25
  researchRelevancyWeight: number; // default 30
  assessmentWeight: number; // default 20
}

export const DEFAULT_SHORTLIST_WEIGHTS: ShortlistWeightsConfig = {
  profileWeight: 25,
  humannessWeight: 25,
  researchRelevancyWeight: 30,
  assessmentWeight: 20,
};

export interface CandidateShortlistMetrics {
  profileScore: number; // 0-100 (Stage 1 resume/profile pillars)
  humannessScore: number; // 0-100 (Linguistic humanness + Proctoring trust)
  linguisticHumannessScore: number; // 0-100 (Pure answer text & timing authenticity)
  proctoringTrustScore: number; // 0-100
  researchRelevancyScore: number; // 0-100 (Domain, resume specificity & verification depth)
  assessmentScore: number; // 0-100 (Reviewer override or AI interview+task raw score)
  compositeScore: number; // 0-100 weighted shortlist score
  humannessVerdict: "Authentic Human" | "Mixed / Check on Call" | "Likely AI / Assisted" | "No Responses";
  trustTier: "Top Shortlist" | "Strong Candidate" | "Verify Integrity" | "Flagged / Low Fit";
  aiFingerprintHits: string[];
  humannessPositives: string[];
  humannessWarnings: string[];
  researchStrengths: string[];
  researchGaps: string[];
}

const AI_CLICHE_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: "Furthermore/Moreover", regex: /\b(furthermore|moreover|additionally|consequently|nevertheless)\b/i },
  { label: "In conclusion/summary", regex: /\b(in conclusion|to summarize|in summary|overall, it is|all in all)\b/i },
  { label: "LLM filler verbs", regex: /\b(delve|foster|bolster|underscore|testament|spearhead(?:ed|ing)? synergy|holistic|multifaceted|paramount|pivotal|tapestry|landscape of)\b/i },
  { label: "AI hedging clichés", regex: /\b(it is (?:crucial|important|essential|worth noting|imperative) (?:to note|to remember|that)|plays a crucial role|navigating the complexities|robust framework|comprehensive approach|mitigate risks while maximizing)\b/i },
  { label: "Structured essay opener", regex: /\b(let's break this down|here is a breakdown|key takeaways|the following factors highlight)\b/i },
];

const RESEARCH_VERIFICATION_MARKERS = [
  "mca",
  "roc",
  "gst",
  "tracxn",
  "tofler",
  "zauba",
  "dpiit",
  "sebi",
  "rbi",
  "primary research",
  "customer interview",
  "founder call",
  "channel check",
  "field visit",
  "mystery shop",
  "triangulat",
  "cross-check",
  "cross check",
  "audit footnote",
  "bank statement",
  "cohort retention",
  "payback",
  "unit economics",
  "contribution margin",
  "working capital",
  "debtor days",
  "receivable",
  "rto",
  "churn",
  "cac",
  "ltv",
  "unverified",
  "assumption",
  "sample size",
];

const STOPWORDS = new Set([
  "intern",
  "internship",
  "strategy",
  "management",
  "marketing",
  "finance",
  "analyst",
  "associate",
  "research",
  "startup",
  "company",
  "limited",
  "private",
  "india",
  "services",
  "solutions",
  "technologies",
  "project",
  "worked",
  "using",
  "analysis",
  "market",
  "business",
  "college",
  "school",
  "amritsar",
  "university",
  "degree",
  "month",
  "months",
  "btech",
  "mba",
  "msdsm",
  "excel",
  "python",
  "none",
  "na",
]);

function extractResumeAnchors(candidate?: CandidateRecord): string[] {
  if (!candidate) return [];
  const rawParts = [
    ...(candidate.internships || []).map((i) => `${i.organization} ${i.designation}`),
    ...(candidate.workExperiences || []).map((w) => `${w.organization} ${w.designation}`),
    candidate.technicalSkills || "",
    candidate.certifications || "",
    candidate.startupResearchExperience || "",
  ]
    .join(" ")
    .toLowerCase();

  const tokens = rawParts
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));

  return Array.from(new Set(tokens)).slice(0, 24);
}

function collectSessionAnswerTexts(session?: AIInterviewSessionRecord | null): {
  turnTexts: string[];
  phase1Text: string;
  phase2Text: string;
  phase3Text: string;
  allText: string;
  totalWords: number;
} {
  if (!session) {
    return {
      turnTexts: [],
      phase1Text: "",
      phase2Text: "",
      phase3Text: "",
      allText: "",
      totalWords: 0,
    };
  }

  const phase1Parts = (session.turns || [])
    .filter((t) => t.phase === "RESUME_PROBE")
    .map((t) => `${t.candidateAnswer || ""} ${t.adaptiveFollowUpAnswer || ""}`.trim())
    .filter(Boolean);

  const phase2Parts = (session.turns || [])
    .filter((t) => t.phase === "STARTUP_THINKING")
    .map((t) => `${t.candidateAnswer || ""} ${t.adaptiveFollowUpAnswer || ""}`.trim())
    .filter(Boolean);

  const sub = session.startupTaskSubmission;
  const phase3Parts = sub
    ? [
        sub.startupBTrueMetricAnalysis,
        sub.startupCTrueMetricAnalysis,
        sub.spottedRedFlagsSummary,
        sub.investmentThesisAndNumbers,
        sub.winningStartupPrimaryRisk,
        sub.threeFounderDiligenceQuestions,
      ]
        .map((s) => (s || "").trim())
        .filter(Boolean)
    : [];

  const turnTexts = [...phase1Parts, ...phase2Parts];
  const allParts = [...turnTexts, ...phase3Parts];
  const allText = allParts.join("\n").trim();
  const totalWords = allText ? allText.split(/\s+/).filter(Boolean).length : 0;

  return {
    turnTexts,
    phase1Text: phase1Parts.join(" "),
    phase2Text: phase2Parts.join(" "),
    phase3Text: phase3Parts.join(" "),
    allText,
    totalWords,
  };
}

export function computeCandidateShortlistMetrics(
  candidate: CandidateRecord | undefined,
  session: AIInterviewSessionRecord | undefined,
  caseSet?: StartupCaseSet,
  weights: ShortlistWeightsConfig = DEFAULT_SHORTLIST_WEIGHTS
): CandidateShortlistMetrics {
  const profileScore = Math.max(0, Math.min(100, Math.round(candidate?.profileScore ?? 0)));
  const assessmentScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        session?.reviewerOverrideScore ??
          session?.scoringBreakdown?.overallAiInterviewScore ??
          candidate?.aiInterviewScore ??
          0
      )
    )
  );

  const texts = collectSessionAnswerTexts(session);
  const proctoringTrustScore = session
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (session.proctoring?.integrityScore ?? 0) -
              (session.proctoring?.rapidInjectionFlags || 0) * 6
          )
        )
      )
    : 0;

  // ============================================================================
  // 1. HUMANNESS & ANTI-CHEAT SCORE (0-100)
  // ============================================================================
  let linguisticHumannessScore = 0;
  const aiFingerprintHits: string[] = [];
  const humannessPositives: string[] = [];
  const humannessWarnings: string[] = [];

  if (!session || texts.totalWords < 12) {
    humannessWarnings.push("Insufficient submitted written/spoken answer text to verify authenticity.");
  } else {
    let ling = 84;

    // A. AI cliché phrase hits across submitted answers
    for (const pat of AI_CLICHE_PATTERNS) {
      const globalRegex = new RegExp(pat.regex.source, "gi");
      const matches = texts.allText.match(globalRegex);
      if (matches && matches.length > 0) {
        aiFingerprintHits.push(`${pat.label} (${matches.length}x)`);
        ling -= Math.min(12, matches.length * 4);
      }
    }

    // B. Markdown / LLM bullet-template formatting (**Label:**, numbered headers)
    const boldHeaderMatches = texts.allText.match(/\*\*[^*\n]{2,40}:\*\*/g) || [];
    const numberedMarkdownMatches = texts.allText.match(/(?:^|\n)\s*\d+\.\s+\*\*[^*\n]+\*\*/g) || [];
    const markdownHits = boldHeaderMatches.length + numberedMarkdownMatches.length;
    if (markdownHits >= 2) {
      aiFingerprintHits.push(`Markdown bold headings (${markdownHits}x)`);
      ling -= Math.min(22, markdownHits * 4);
    }

    // C. Em-dash density (AI models overuse spaced/unspaced em-dashes in short answers)
    const emDashCount = (texts.allText.match(/—/g) || []).length;
    if (emDashCount >= 4 && texts.totalWords < 650) {
      aiFingerprintHits.push(`Heavy em-dash phrasing (${emDashCount}x)`);
      ling -= Math.min(10, emDashCount * 2);
    }

    // D. Sentence length variance (burstiness check)
    const sentences = texts.allText
      .split(/[.!?]+/)
      .map((s) => s.trim().split(/\s+/).filter(Boolean).length)
      .filter((len) => len >= 4);
    if (sentences.length >= 6) {
      const mean = sentences.reduce((a, b) => a + b, 0) / sentences.length;
      const variance =
        sentences.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) /
        sentences.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev < 3.4) {
        ling -= 10;
        humannessWarnings.push(
          `Uniform sentence rhythm (low variance ${stdDev.toFixed(1)}w) — resembles templated output`
        );
      } else if (stdDev >= 5.5) {
        ling += 6;
        humannessPositives.push("Natural sentence-length burstiness consistent with spontaneous human writing/speech");
      }
    }

    // E. Response velocity anomaly (typing text unrealistically fast without voice)
    let fastTypingFlags = 0;
    let voiceTurns = 0;
    for (const turn of session.turns || []) {
      const ans = (turn.candidateAnswer || "").trim();
      if (!ans) continue;
      const wc = turn.wordCount || ans.split(/\s+/).filter(Boolean).length;
      if (turn.inputMethod === "voice") {
        voiceTurns += 1;
      } else if (wc >= 45 && turn.timeTakenSeconds > 0 && turn.timeTakenSeconds < 16) {
        fastTypingFlags += 1;
      } else if (wc >= 60 && turn.timeTakenSeconds > 0) {
        const wpm = (wc / turn.timeTakenSeconds) * 60;
        if (wpm > 120) {
          fastTypingFlags += 1;
        }
      }
    }
    if (fastTypingFlags > 0) {
      ling -= Math.min(20, fastTypingFlags * 9);
      humannessWarnings.push(
        `Speed anomaly on ${fastTypingFlags} non-voice turn(s) — typed faster than normal human composition`
      );
    }
    if (voiceTurns > 0) {
      ling += Math.min(8, voiceTurns * 2);
      humannessPositives.push(`Recorded ${voiceTurns} live voice-transcribed turn(s)`);
    }

    // F. First-person lived specificity & candid tone
    const firstPersonMatches =
      texts.allText.match(
        /\b(i built|i audited|i worked|i noticed|i found|i called|we tried|we discontinued|when i|in my|honestly|my manager|at my|personally|i couldn't verify|what worried me)\b/gi
      ) || [];
    if (firstPersonMatches.length >= 2) {
      ling += Math.min(10, firstPersonMatches.length * 2.5);
      humannessPositives.push("First-person lived ownership & candid analytical voice");
    } else if (texts.totalWords >= 120) {
      ling -= 6;
      humannessWarnings.push("Impersonal third-person tone throughout answers");
    }

    // G. Copy/paste or rapid injection warnings from proctoring
    if ((session.proctoring?.copyPasteBlockedCount || 0) > 0) {
      humannessWarnings.push(
        `${session.proctoring.copyPasteBlockedCount} blocked copy/paste attempt(s) logged`
      );
    }
    if ((session.proctoring?.tabSwitchCount || 0) >= 3) {
      humannessWarnings.push(
        `${session.proctoring.tabSwitchCount} tab switch(es) during proctored session`
      );
    }
    if ((session.proctoring?.rapidInjectionFlags || 0) > 0) {
      ling -= 12;
      humannessWarnings.push(
        `${session.proctoring.rapidInjectionFlags} rapid text-injection spike(s) detected`
      );
    }

    if (aiFingerprintHits.length > 0) {
      humannessWarnings.unshift(`AI phrasing patterns: ${aiFingerprintHits.join(", ")}`);
    } else if (ling >= 80) {
      humannessPositives.push("No synthetic LLM phrasing clichés or markdown templates detected");
    }

    linguisticHumannessScore = Math.max(0, Math.min(100, Math.round(ling)));
  }

  // Blend 60% Linguistic Authenticity + 40% Proctoring Telemetry Integrity
  const humannessScore = session && texts.totalWords >= 12
    ? Math.max(
        0,
        Math.min(100, Math.round(linguisticHumannessScore * 0.6 + proctoringTrustScore * 0.4))
      )
    : proctoringTrustScore;

  let humannessVerdict: CandidateShortlistMetrics["humannessVerdict"] = "No Responses";
  if (session && texts.totalWords >= 12) {
    if (humannessScore >= 75 && linguisticHumannessScore >= 68) {
      humannessVerdict = "Authentic Human";
    } else if (humannessScore >= 52) {
      humannessVerdict = "Mixed / Check on Call";
    } else {
      humannessVerdict = "Likely AI / Assisted";
    }
  }

  // ============================================================================
  // 2. RESEARCH & DOMAIN RELEVANCY SCORE (0-100)
  // ============================================================================
  const researchStrengths: string[] = [];
  const researchGaps: string[] = [];

  // A. Prior Research + Commercial Profile Foundation (0-25 pts)
  const rawPriorResearch = candidate?.stage1ProfileBreakdown?.researchExperienceScore ?? 0; // /30
  const rawCommercial = candidate?.stage1ProfileBreakdown?.startupCommercialExposureScore ?? 0; // /20
  const foundationPts = Math.round(((rawPriorResearch / 30) * 16) + ((rawCommercial / 20) * 9));
  if (rawPriorResearch >= 18) {
    researchStrengths.push(`Strong Stage 1 research background (${rawPriorResearch}/30)`);
  } else if (rawPriorResearch < 10) {
    researchGaps.push("Limited documented prior startup/market research before test");
  }

  // B. Resume-Specific Grounding in Phase 1 (0-20 pts)
  const anchors = extractResumeAnchors(candidate);
  const phase1Lower = texts.phase1Text.toLowerCase();
  const matchedAnchors = anchors.filter((tok) => phase1Lower.includes(tok));
  let resumeGroundingPts = 0;
  if (texts.phase1Text.trim().length >= 30) {
    resumeGroundingPts =
      matchedAnchors.length >= 3
        ? 20
        : matchedAnchors.length === 2
        ? 15
        : matchedAnchors.length === 1
        ? 9
        : 3;
    if (matchedAnchors.length >= 2) {
      researchStrengths.push(
        `Grounded Phase 1 answers in real resume specifics (${matchedAnchors.slice(0, 4).join(", ")})`
      );
    } else if (anchors.length > 0) {
      researchGaps.push("Phase 1 answers stayed generic instead of citing concrete resume projects/tools");
    }
  } else {
    researchGaps.push("Missing Phase 1 Resume Probe responses");
  }

  // C. Research Verification & Quantitative Depth across Stage 1 + Phase 2 + Phase 3 (0-25 pts)
  const combinedResearchCorpus = `${candidate?.startupResearchExperience || ""} ${texts.allText}`.toLowerCase();
  const verifHits = RESEARCH_VERIFICATION_MARKERS.filter((m) =>
    combinedResearchCorpus.includes(m)
  );
  const numericMatches =
    texts.allText.match(/(?:₹\s*\d+|\d+(?:\.\d+)?%|\d+\s*(?:lakh|lakhs|cr|crore|days|months|x|customers|orders))/gi) ||
    [];
  const verifPts = Math.min(15, verifHits.length * 2.5) + Math.min(10, numericMatches.length * 1.5);
  if (verifHits.length >= 4) {
    researchStrengths.push(
      `Applied real verification/unit-economics tools (${verifHits.slice(0, 4).join(", ")})`
    );
  } else {
    researchGaps.push("Few primary-source verification tools or financial ratios cited");
  }

  // D. Phase 3 Data Room Accuracy & Trap Detection (0-30 pts)
  let phase3RelPts = 0;
  const sb = session?.scoringBreakdown;
  if (sb) {
    if (sb.pickedCorrectWinningStartup) {
      phase3RelPts += 11;
      researchStrengths.push("Correctly picked true ₹1 Cr Data Room winner");
    } else {
      researchGaps.push("Did not pick the true Data Room winner");
    }
    if (sb.caughtFreeTrialArrTrap) phase3RelPts += 7;
    if (sb.caughtUnitEconomicsRtoTrap) phase3RelPts += 7;
    if (sb.identifiedWorkingCapitalRisk) phase3RelPts += 5;

    // Bonus check against case set startup names so copy-pasted unrelated theses don't score
    if (caseSet && texts.phase3Text.length > 40) {
      const p3Lower = texts.phase3Text.toLowerCase();
      const mentionsAnyCaseCompany = caseSet.startups.some((st) =>
        p3Lower.includes(st.name.split(" ")[0]!.toLowerCase())
      );
      if (!mentionsAnyCaseCompany) {
        phase3RelPts = Math.max(0, phase3RelPts - 8);
        researchGaps.push("Phase 3 response barely referenced the assigned Data Room startups");
      }
    }
  } else {
    researchGaps.push("Phase 3 Virtual Data Room submission incomplete");
  }

  const researchRelevancyScore = Math.max(
    0,
    Math.min(100, Math.round(foundationPts + resumeGroundingPts + verifPts + phase3RelPts))
  );

  // ============================================================================
  // 3. WEIGHTED SHORTLIST COMPOSITE SCORE (0-100)
  // ============================================================================
  const totalWeight = Math.max(
    1,
    weights.profileWeight +
      weights.humannessWeight +
      weights.researchRelevancyWeight +
      weights.assessmentWeight
  );

  const weightedRaw =
    (profileScore * weights.profileWeight +
      humannessScore * weights.humannessWeight +
      researchRelevancyScore * weights.researchRelevancyWeight +
      assessmentScore * weights.assessmentWeight) /
    totalWeight;

  const compositeScore = Math.round(weightedRaw * 10) / 10;

  let trustTier: CandidateShortlistMetrics["trustTier"] = "Flagged / Low Fit";
  if (humannessScore < 50 || proctoringTrustScore < 50) {
    trustTier = "Verify Integrity";
  } else if (compositeScore >= 72 && humannessScore >= 65 && researchRelevancyScore >= 60) {
    trustTier = "Top Shortlist";
  } else if (compositeScore >= 58) {
    trustTier = "Strong Candidate";
  }

  return {
    profileScore,
    humannessScore,
    linguisticHumannessScore,
    proctoringTrustScore,
    researchRelevancyScore,
    assessmentScore,
    compositeScore,
    humannessVerdict,
    trustTier,
    aiFingerprintHits,
    humannessPositives: humannessPositives.slice(0, 4),
    humannessWarnings: humannessWarnings.slice(0, 5),
    researchStrengths: researchStrengths.slice(0, 4),
    researchGaps: researchGaps.slice(0, 4),
  };
}
