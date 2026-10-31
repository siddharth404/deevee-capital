"use client";

/**
 * SECTION 7: STARTUP SUBMISSION FORM (Blended with Cobalt Toile Copperplate Aesthetic)
 * Uses the --ctl-* CSS variables and copperplate engraving motifs from CobaltToileLanding
 * so the form adapts dynamically to the active ink palette (Cobalt, Midnight Navy, Indigo, Delft, Oxblood).
 * Implements all 10 required/optional fields, client + server validation, field-level errors,
 * duplicate submission prevention, loading state, backend confirmation with Reference ID,
 * retry on failure, and honeypot/timing spam protection.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  FileText,
  ArrowUpRight,
  RotateCcw,
  UploadCloud,
  Trash2,
  Download,
  Paperclip,
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface FormValues {
  founderName: string;
  founderEmail: string;
  startupName: string;
  websiteUrl: string;
  sector: string;
  stage: string;
  description: string;
  fundingSought: string;
  pitchDeckUrl: string;
  privacyConsent: boolean;
  companyFaxNumber: string; // Honeypot
}

const INITIAL_VALUES: FormValues = {
  founderName: "",
  founderEmail: "",
  startupName: "",
  websiteUrl: "",
  sector: "",
  stage: "",
  description: "",
  fundingSought: "",
  pitchDeckUrl: "",
  privacyConsent: false,
  companyFaxNumber: "",
};

interface PitchFormSectionProps {
  onOpenPrivacyPolicy: () => void;
}

export function PitchFormSection({
  onOpenPrivacyPolicy,
}: PitchFormSectionProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");
  const [submittedAt, setSubmittedAt] = useState<string>("");
  const [memoUrl, setMemoUrl] = useState<string>("");
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRenderedAtRef = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    formRenderedAtRef.current = Date.now();
  }, []);

  const validateClient = (data: FormValues): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (data.founderName.trim().length < 2) {
      errors.founderName = "Please enter the founder's full name.";
    }
    const emailTrimmed = data.founderEmail.trim();
    if (
      !emailTrimmed ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrimmed)
    ) {
      errors.founderEmail = "Please enter a valid founder email address.";
    }
    if (data.startupName.trim().length < 2) {
      errors.startupName = "Please enter your startup or company name.";
    }
    if (data.websiteUrl.trim()) {
      const normalized = /^https?:\/\//i.test(data.websiteUrl.trim())
        ? data.websiteUrl.trim()
        : `https://${data.websiteUrl.trim()}`;
      try {
        const u = new URL(normalized);
        if (!u.hostname.includes(".")) {
          errors.websiteUrl = "Please enter a valid website or product link.";
        }
      } catch {
        errors.websiteUrl = "Please enter a valid website or product link.";
      }
    }
    if (!data.sector) {
      errors.sector = "Please select a primary sector.";
    }
    if (!data.stage) {
      errors.stage = "Please select your current stage.";
    }
    if (data.description.trim().length < 25) {
      errors.description =
        "Please provide a brief description (at least 25 characters) of the problem, product, and opportunity.";
    }
    if (data.pitchDeckUrl.trim()) {
      const normalized = /^https?:\/\//i.test(data.pitchDeckUrl.trim())
        ? data.pitchDeckUrl.trim()
        : `https://${data.pitchDeckUrl.trim()}`;
      try {
        const u = new URL(normalized);
        if (!u.hostname.includes(".")) {
          errors.pitchDeckUrl = "Please enter a valid pitch deck URL.";
        }
      } catch {
        errors.pitchDeckUrl = "Please enter a valid pitch deck URL.";
      }
    }
    if (!data.privacyConsent) {
      errors.privacyConsent =
        "Please confirm your consent to the Privacy Policy before submitting.";
    }

    return errors;
  };

  const handleChange = (
    field: keyof FormValues,
    value: string | boolean
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmittingRef.current || status === "submitting") {
      return;
    }

    const errors = validateClient(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("error");
      setServerMessage(
        "Please check the highlighted fields below and try submitting again."
      );
      return;
    }

    isSubmittingRef.current = true;
    setStatus("submitting");
    setFieldErrors({});
    setServerMessage("");

    try {
      const formData = new FormData();
      formData.append("founderName", values.founderName);
      formData.append("founderEmail", values.founderEmail);
      formData.append("startupName", values.startupName);
      formData.append("sector", values.sector);
      formData.append("stage", values.stage);
      formData.append("description", values.description);
      if (values.websiteUrl) formData.append("websiteUrl", values.websiteUrl);
      if (values.fundingSought) formData.append("fundingSought", values.fundingSought);
      if (values.pitchDeckUrl) formData.append("pitchDeckUrl", values.pitchDeckUrl);
      formData.append("privacyConsent", String(values.privacyConsent));
      if (values.companyFaxNumber) formData.append("companyFaxNumber", values.companyFaxNumber);
      if (formRenderedAtRef.current) formData.append("formRenderedAt", String(formRenderedAtRef.current));
      if (deckFile) formData.append("pitchDeckFile", deckFile);

      const response = await fetch("/api/pitch", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setStatus("error");
        setServerMessage(
          data.message ||
            "We could not complete your submission right now. Please review your entries and try again."
        );
        return;
      }

      setReferenceId(data.referenceId || "DVC-CONFIRMED");
      setSubmittedAt(data.submittedAt || new Date().toISOString());
      setMemoUrl(data.memoUrl || "");
      setServerMessage(
        data.message ||
          "Thank you for sharing your startup with Deevee Capital. Your submission has been securely recorded."
      );
      setStatus("success");
      requestAnimationFrame(() => {
        const sectionEl = document.getElementById("pitch-form");
        if (sectionEl) {
          sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } catch {
      setStatus("error");
      setServerMessage(
        "A network error occurred while sending your submission. Your entries have been preserved—please try again."
      );
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleResetForAnotherPitch = () => {
    setValues(INITIAL_VALUES);
    setFieldErrors({});
    setStatus("idle");
    setServerMessage("");
    setReferenceId("");
    setMemoUrl("");
    setDeckFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    formRenderedAtRef.current = Date.now();
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    lineHeight: 1.4,
    color: "var(--ctl-text, #101A24)",
    background: "var(--ctl-paper, #f7f4ec)",
    border: hasError
      ? "1px solid #b4322a"
      : "1px solid var(--ctl-line, rgba(34,56,196,0.24))",
    boxSizing: "border-box",
    transition: "border-color 0.25s ease, box-shadow 0.25s ease",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--ctl-ink, #2238c4)",
    marginBottom: "8px",
  };

  return (
    <section
      id="pitch-form"
      data-sec="pitch-form"
      aria-labelledby="pitch-form-heading"
      className="ctl-sec"
      style={{
        borderBottom: "1px solid var(--ctl-line)",
        background: "var(--ctl-paper)",
      }}
    >
      <div className="ctl-wrap">
        {/* Section Header */}
        <div className="ctl-sechead">
          <div>
            <span className="ctl-kicker">
              {siteConfig.form.index} · {siteConfig.form.eyebrow}
            </span>
            <h2 className="ctl-h2" id="pitch-form-heading">
              Share what you are <em>building.</em>
            </h2>
          </div>
          <p className="ctl-lede">{siteConfig.form.subheadline}</p>
        </div>

        {/* Copperplate Split Ledger Frame */}
        <div
          style={{
            position: "relative",
            border: "1px solid var(--ctl-ink)",
            background: "var(--ctl-wash)",
            boxShadow: "inset 0 0 0 4px var(--ctl-paper), inset 0 0 0 5px var(--ctl-line)",
            padding: "clamp(24px, 4vw, 52px)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: "clamp(32px, 5vw, 64px)",
              alignItems: "start",
            }}
          >
            {/* Left Column: Editorial Ledger Guidance & Assurances */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div>
                <span
                  style={{
                    fontFamily: "var(--ctl-serif)",
                    fontStyle: "italic",
                    fontSize: "18px",
                    color: "var(--ctl-ink)",
                  }}
                >
                  Founder Registry — Direct Review
                </span>
                <h3
                  style={{
                    marginTop: "10px",
                    fontFamily: "var(--ctl-serif)",
                    fontWeight: 400,
                    fontSize: "clamp(26px, 2.8vw, 38px)",
                    lineHeight: 1.1,
                    color: "var(--ctl-text)",
                  }}
                >
                  Every submission is read with care and discretion.
                </h3>
                <p
                  style={{
                    marginTop: "14px",
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "var(--ctl-soft)",
                  }}
                >
                  We prefer clear, plain language over buzzwords. Share the real
                  customer problem, what your team has learned firsthand, and
                  how your product creates durable value.
                </p>
              </div>

              {/* 3 Roman Numeral Process Steps */}
              <ol
                style={{
                  borderTop: "1px solid var(--ctl-line)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {[
                  {
                    num: "I.",
                    title: "Share the essentials",
                    detail:
                      "Tell us clearly about the problem, your product, and the customer insight driving your team.",
                  },
                  {
                    num: "II.",
                    title: "First-principles inquiry",
                    detail:
                      "Submissions are reviewed directly with attention to founder conviction and long-term scalability.",
                  },
                  {
                    num: "III.",
                    title: "Direct conversation",
                    detail:
                      "When there is strong alignment with our areas of interest, we reach out directly via email to learn more.",
                  },
                ].map((item) => (
                  <li
                    key={item.num}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "38px 1fr",
                      gap: "12px",
                      padding: "16px 0",
                      borderBottom: "1px solid var(--ctl-line)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--ctl-serif)",
                        fontStyle: "italic",
                        fontSize: "20px",
                        color: "var(--ctl-ink)",
                      }}
                    >
                      {item.num}
                    </span>
                    <div>
                      <strong
                        style={{
                          display: "block",
                          fontFamily: "var(--ctl-serif)",
                          fontWeight: 400,
                          fontSize: "19px",
                          color: "var(--ctl-text)",
                        }}
                      >
                        {item.title}
                      </strong>
                      <p
                        style={{
                          marginTop: "4px",
                          fontSize: "13.5px",
                          lineHeight: 1.55,
                          color: "var(--ctl-soft)",
                        }}
                      >
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Confidentiality & Deck Callouts */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    border: "1px solid var(--ctl-line)",
                    background: "var(--ctl-paper)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--ctl-ink)",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Confidentiality</span>
                  </div>
                  <p
                    style={{
                      marginTop: "8px",
                      fontFamily: "var(--ctl-serif)",
                      fontSize: "17px",
                      color: "var(--ctl-text)",
                    }}
                  >
                    Encrypted &amp; Access-Restricted
                  </p>
                  <p
                    style={{
                      marginTop: "4px",
                      fontSize: "12.5px",
                      lineHeight: 1.5,
                      color: "var(--ctl-soft)",
                    }}
                  >
                    Founder submissions are never exposed publicly or shared
                    outside our review team.
                  </p>
                </div>

                <div
                  style={{
                    padding: "16px",
                    border: "1px solid var(--ctl-line)",
                    background: "var(--ctl-paper)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--ctl-ink)",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Pitch Deck or Memo</span>
                  </div>
                  <p
                    style={{
                      marginTop: "8px",
                      fontFamily: "var(--ctl-serif)",
                      fontSize: "17px",
                      color: "var(--ctl-text)",
                    }}
                  >
                    Optional Link Accepted
                  </p>
                  <p
                    style={{
                      marginTop: "4px",
                      fontSize: "12.5px",
                      lineHeight: 1.5,
                      color: "var(--ctl-soft)",
                    }}
                  >
                    Share a DocSend, Google Drive, or Notion link if available.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 10-Field Startup Submission Form */}
            <div
              style={{
                background: "var(--ctl-paper)",
                border: "1px solid var(--ctl-line)",
                padding: "clamp(20px, 3vw, 36px)",
              }}
            >
              {status === "success" ? (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    padding: "12px 0",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        width: "46px",
                        height: "46px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--ctl-deep)",
                        color: "var(--ctl-ondeep)",
                      }}
                    >
                      <CheckCircle2
                        className="h-6 w-6"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>

                    <span className="ctl-kicker">SUBMISSION CONFIRMED</span>

                    <h3
                      style={{
                        fontFamily: "var(--ctl-serif)",
                        fontWeight: 400,
                        fontSize: "clamp(28px, 3vw, 38px)",
                        lineHeight: 1.1,
                        color: "var(--ctl-text)",
                      }}
                    >
                      Thank you for sharing what you are building.
                    </h3>

                    <p
                      style={{
                        fontSize: "15px",
                        lineHeight: 1.6,
                        color: "var(--ctl-soft)",
                      }}
                    >
                      {serverMessage}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "16px",
                      padding: "18px 0",
                      borderTop: "1px solid var(--ctl-line)",
                      borderBottom: "1px solid var(--ctl-line)",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "var(--ctl-soft)",
                        }}
                      >
                        REFERENCE ID
                      </span>
                      <strong
                        style={{
                          display: "block",
                          marginTop: "4px",
                          fontFamily: "var(--ctl-serif)",
                          fontSize: "20px",
                          color: "var(--ctl-ink)",
                        }}
                      >
                        {referenceId}
                      </strong>
                    </div>
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "var(--ctl-soft)",
                        }}
                      >
                        STARTUP
                      </span>
                      <strong
                        style={{
                          display: "block",
                          marginTop: "4px",
                          fontFamily: "var(--ctl-serif)",
                          fontSize: "20px",
                          color: "var(--ctl-text)",
                        }}
                      >
                        {values.startupName}
                      </strong>
                    </div>
                    {submittedAt && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "var(--ctl-soft)",
                          }}
                        >
                          RECORDED AT
                        </span>
                        <span
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "12.5px",
                            color: "var(--ctl-soft)",
                          }}
                        >
                          {new Date(submittedAt).toUTCString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                    {memoUrl && (
                      <a
                        href={memoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ctl-btn"
                        style={{
                          textDecoration: "none",
                          background: "var(--ctl-ink)",
                          color: "var(--ctl-paper)",
                        }}
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Download Pitch Memorandum (PDF)</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleResetForAnotherPitch}
                      className="ctl-btn"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Submit Another Response</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={handleSubmit}
                  aria-label="Startup Pitch Submission Form"
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  {/* Top Form Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "14px",
                      borderBottom: "1px solid var(--ctl-line)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--ctl-ink)",
                      }}
                    >
                      FOUNDER &amp; COMPANY LEDGER
                    </span>
                    <span style={{ fontSize: "11.5px", color: "var(--ctl-soft)" }}>
                      <strong style={{ color: "var(--ctl-ink)" }}>*</strong>{" "}
                      Required fields
                    </span>
                  </div>

                  {/* Error Alert Banner */}
                  {status === "error" && serverMessage && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "14px 16px",
                        border: "1px solid #b4322a",
                        background: "rgba(180, 50, 42, 0.06)",
                        color: "#8c1d16",
                      }}
                    >
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
                        <strong style={{ display: "block" }}>
                          Submission requires attention
                        </strong>
                        <span>{serverMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Honeypot Anti-Spam Field */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      width: 0,
                      height: 0,
                      overflow: "hidden",
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <label htmlFor="companyFaxNumber">
                      Company Fax Number (Leave blank)
                    </label>
                    <input
                      id="companyFaxNumber"
                      name="companyFaxNumber"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.companyFaxNumber}
                      onChange={(e) =>
                        handleChange("companyFaxNumber", e.target.value)
                      }
                    />
                  </div>

                  {/* Row 1: Founder Name & Founder Email */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label htmlFor="founderName" style={labelStyle}>
                        Founder Name <span>*</span>
                      </label>
                      <input
                        id="founderName"
                        name="founderName"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Aarav Mehta"
                        value={values.founderName}
                        onChange={(e) =>
                          handleChange("founderName", e.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.founderName)}
                        aria-describedby={
                          fieldErrors.founderName
                            ? "founderName-error"
                            : undefined
                        }
                        style={inputStyle(Boolean(fieldErrors.founderName))}
                      />
                      {fieldErrors.founderName && (
                        <p
                          id="founderName-error"
                          role="alert"
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#b4322a",
                          }}
                        >
                          {fieldErrors.founderName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="founderEmail" style={labelStyle}>
                        Founder Email <span>*</span>
                      </label>
                      <input
                        id="founderEmail"
                        name="founderEmail"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="founder@company.com"
                        value={values.founderEmail}
                        onChange={(e) =>
                          handleChange("founderEmail", e.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.founderEmail)}
                        aria-describedby={
                          fieldErrors.founderEmail
                            ? "founderEmail-error"
                            : undefined
                        }
                        style={inputStyle(Boolean(fieldErrors.founderEmail))}
                      />
                      {fieldErrors.founderEmail && (
                        <p
                          id="founderEmail-error"
                          role="alert"
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#b4322a",
                          }}
                        >
                          {fieldErrors.founderEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Startup Name & Website / Product Link */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label htmlFor="startupName" style={labelStyle}>
                        Startup Name <span>*</span>
                      </label>
                      <input
                        id="startupName"
                        name="startupName"
                        type="text"
                        required
                        placeholder="e.g. Meridian Systems"
                        value={values.startupName}
                        onChange={(e) =>
                          handleChange("startupName", e.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.startupName)}
                        aria-describedby={
                          fieldErrors.startupName
                            ? "startupName-error"
                            : undefined
                        }
                        style={inputStyle(Boolean(fieldErrors.startupName))}
                      />
                      {fieldErrors.startupName && (
                        <p
                          id="startupName-error"
                          role="alert"
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#b4322a",
                          }}
                        >
                          {fieldErrors.startupName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="websiteUrl" style={labelStyle}>
                        Website or Product Link{" "}
                        <span style={{ fontWeight: 400, color: "var(--ctl-soft)" }}>
                          (Optional)
                        </span>
                      </label>
                      <input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="url"
                        placeholder="https://yourstartup.com"
                        value={values.websiteUrl}
                        onChange={(e) =>
                          handleChange("websiteUrl", e.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.websiteUrl)}
                        aria-describedby={
                          fieldErrors.websiteUrl ? "websiteUrl-error" : undefined
                        }
                        style={inputStyle(Boolean(fieldErrors.websiteUrl))}
                      />
                      {fieldErrors.websiteUrl && (
                        <p
                          id="websiteUrl-error"
                          role="alert"
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#b4322a",
                          }}
                        >
                          {fieldErrors.websiteUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Sector & Current Stage */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label htmlFor="sector" style={labelStyle}>
                        Sector <span>*</span>
                      </label>
                      <select
                        id="sector"
                        name="sector"
                        required
                        value={values.sector}
                        onChange={(e) => handleChange("sector", e.target.value)}
                        aria-invalid={Boolean(fieldErrors.sector)}
                        aria-describedby={
                          fieldErrors.sector ? "sector-error" : undefined
                        }
                        style={inputStyle(Boolean(fieldErrors.sector))}
                      >
                        <option value="">Select primary sector...</option>
                        {siteConfig.form.sectors.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.sector && (
                        <p
                          id="sector-error"
                          role="alert"
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#b4322a",
                          }}
                        >
                          {fieldErrors.sector}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stage" style={labelStyle}>
                        Current Stage <span>*</span>
                      </label>
                      <select
                        id="stage"
                        name="stage"
                        required
                        value={values.stage}
                        onChange={(e) => handleChange("stage", e.target.value)}
                        aria-invalid={Boolean(fieldErrors.stage)}
                        aria-describedby={
                          fieldErrors.stage ? "stage-error" : undefined
                        }
                        style={inputStyle(Boolean(fieldErrors.stage))}
                      >
                        <option value="">Select current stage...</option>
                        {siteConfig.form.stages.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.stage && (
                        <p
                          id="stage-error"
                          role="alert"
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#b4322a",
                          }}
                        >
                          {fieldErrors.stage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Brief Description */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <label htmlFor="description" style={labelStyle}>
                        Brief Description <span>*</span>
                      </label>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--ctl-soft)",
                          marginBottom: "8px",
                        }}
                      >
                        {values.description.trim().length} / 3000 chars
                      </span>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      required
                      placeholder="What problem are you solving, who is the customer, what is your insight, and what progress have you made so far?"
                      value={values.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      aria-invalid={Boolean(fieldErrors.description)}
                      aria-describedby={
                        fieldErrors.description
                          ? "description-error"
                          : "description-hint"
                      }
                      style={{
                        ...inputStyle(Boolean(fieldErrors.description)),
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                    {fieldErrors.description ? (
                      <p
                        id="description-error"
                        role="alert"
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "#b4322a",
                        }}
                      >
                        {fieldErrors.description}
                      </p>
                    ) : (
                      <p
                        id="description-hint"
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "var(--ctl-soft)",
                        }}
                      >
                        Clear, plain language is preferred over buzzwords
                        (minimum 25 characters).
                      </p>
                    )}
                  </div>

                  {/* Row 5: Funding Sought & Pitch Deck (PDF Upload + Link) */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label htmlFor="fundingSought" style={labelStyle}>
                        Funding Sought{" "}
                        <span style={{ fontWeight: 400, color: "var(--ctl-soft)" }}>
                          (Optional)
                        </span>
                      </label>
                      <input
                        id="fundingSought"
                        name="fundingSought"
                        type="text"
                        placeholder="e.g. ₹2 Cr / $250k Pre-Seed"
                        value={values.fundingSought}
                        onChange={(e) =>
                          handleChange("fundingSought", e.target.value)
                        }
                        style={inputStyle(false)}
                      />
                    </div>

                    <div>
                      <label htmlFor="pitchDeckUrl" style={labelStyle}>
                        Pitch Deck Link{" "}
                        <span style={{ fontWeight: 400, color: "var(--ctl-soft)" }}>
                          (DocSend / Drive)
                        </span>
                      </label>
                      <input
                        id="pitchDeckUrl"
                        name="pitchDeckUrl"
                        type="url"
                        placeholder="https://docsend.com/view/..."
                        value={values.pitchDeckUrl}
                        onChange={(e) =>
                          handleChange("pitchDeckUrl", e.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.pitchDeckUrl)}
                        aria-describedby={
                          fieldErrors.pitchDeckUrl
                            ? "pitchDeckUrl-error"
                            : undefined
                        }
                        style={inputStyle(Boolean(fieldErrors.pitchDeckUrl))}
                      />
                      {fieldErrors.pitchDeckUrl && (
                        <p
                          id="pitchDeckUrl-error"
                          role="alert"
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#b4322a",
                          }}
                        >
                          {fieldErrors.pitchDeckUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 5B: Dedicated Pitch Deck File Upload (PDF) */}
                  <div style={{ marginTop: "4px" }}>
                    <label style={labelStyle}>
                      Upload Pitch Deck (PDF){" "}
                      <span style={{ fontWeight: 400, color: "var(--ctl-soft)" }}>
                        (Max 25MB · Recommended)
                      </span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.pptx,.ppt"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          if (file.size > 25 * 1024 * 1024) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              pitchDeckFile: "File exceeds 25MB limit. Please upload a smaller PDF or use a link.",
                            }));
                            setDeckFile(null);
                          } else {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.pitchDeckFile;
                              return next;
                            });
                            setDeckFile(file);
                          }
                        }
                      }}
                    />

                    {deckFile ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "var(--ctl-paper)",
                          border: "1px solid var(--ctl-ink)",
                          borderRadius: "2px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <FileText className="h-5 w-5 shrink-0" style={{ color: "var(--ctl-ink)" }} />
                          <div style={{ minWidth: 0 }}>
                            <strong
                              style={{
                                display: "block",
                                fontSize: "13px",
                                color: "var(--ctl-text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {deckFile.name}
                            </strong>
                            <span style={{ fontSize: "11px", color: "var(--ctl-soft)" }}>
                              {(deckFile.size / (1024 * 1024)).toFixed(2)} MB · PDF Deck Attached
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDeckFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#b4322a",
                            cursor: "pointer",
                            padding: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                          }}
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0] || null;
                          if (file) {
                            if (file.size > 25 * 1024 * 1024) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                pitchDeckFile: "File exceeds 25MB limit. Please upload a smaller PDF or use a link.",
                              }));
                            } else {
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                delete next.pitchDeckFile;
                                return next;
                              });
                              setDeckFile(file);
                            }
                          }
                        }}
                        style={{
                          border: isDragging
                            ? "2px dashed var(--ctl-ink)"
                            : "1px dashed var(--ctl-line, rgba(34,56,196,0.3))",
                          background: isDragging
                            ? "rgba(16,26,36,0.04)"
                            : "var(--ctl-paper)",
                          padding: "20px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "border-color 0.2s ease, background 0.2s ease",
                          borderRadius: "2px",
                        }}
                      >
                        <UploadCloud
                          className="h-6 w-6 mx-auto mb-2"
                          style={{ color: "var(--ctl-ink)", opacity: 0.8 }}
                        />
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "var(--ctl-text)" }}>
                          <span style={{ color: "var(--ctl-ink)", textDecoration: "underline" }}>
                            Click to upload your pitch deck (PDF)
                          </span>{" "}
                          or drag &amp; drop
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--ctl-soft)" }}>
                          PDF, PPTX up to 25MB. Delivered directly to our investment team.
                        </p>
                      </div>
                    )}

                    {fieldErrors.pitchDeckFile && (
                      <p
                        role="alert"
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "#b4322a",
                        }}
                      >
                        {fieldErrors.pitchDeckFile}
                      </p>
                    )}
                  </div>

                  {/* Row 6: Privacy Policy Consent */}
                  <div
                    style={{
                      paddingTop: "14px",
                      borderTop: "1px solid var(--ctl-line)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <input
                        id="privacyConsent"
                        name="privacyConsent"
                        type="checkbox"
                        required
                        checked={values.privacyConsent}
                        onChange={(e) =>
                          handleChange("privacyConsent", e.target.checked)
                        }
                        aria-invalid={Boolean(fieldErrors.privacyConsent)}
                        aria-describedby={
                          fieldErrors.privacyConsent
                            ? "privacyConsent-error"
                            : undefined
                        }
                        style={{
                          marginTop: "3px",
                          width: "16px",
                          height: "16px",
                          accentColor: "var(--ctl-ink)",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <label
                        htmlFor="privacyConsent"
                        style={{
                          fontSize: "12.5px",
                          lineHeight: 1.55,
                          color: "var(--ctl-text)",
                        }}
                      >
                        I consent to Deevee Capital storing and reviewing the
                        information submitted in this form in accordance with
                        the{" "}
                        <button
                          type="button"
                          onClick={onOpenPrivacyPolicy}
                          style={{
                            fontWeight: 600,
                            color: "var(--ctl-ink)",
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          Privacy Policy
                        </button>
                        , and I understand that submitting this form does not
                        create an investment commitment.{" "}
                        <span style={{ color: "var(--ctl-ink)" }}>*</span>
                      </label>
                    </div>
                    {fieldErrors.privacyConsent && (
                      <p
                        id="privacyConsent-error"
                        role="alert"
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "#b4322a",
                        }}
                      >
                        {fieldErrors.privacyConsent}
                      </p>
                    )}
                  </div>

                  {/* Submit Button using .ctl-btn */}
                  <div style={{ paddingTop: "6px" }}>
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="ctl-btn"
                      style={{
                        width: "100%",
                        height: "48px",
                        fontSize: "12.5px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        opacity: status === "submitting" ? 0.7 : 1,
                      }}
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          <span>Recording Your Submission...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Startup Pitch</span>
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
