import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { sendPitchNotificationEmail, PitchEmailAttachment } from "@/lib/email";
import { generatePitchMemoPdf } from "@/lib/pdf-memo";
import { uploadPitchAttachment } from "@/lib/gcs";
import { verifyCaptcha } from "@/lib/captcha";

export const runtime = "nodejs";

/**
 * In-memory rate limiting & duplicate submission guard (per serverless/node instance)
 */
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const recentSubmissionHashes = new Map<string, { referenceId: string; timestamp: number }>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 12;
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export interface PitchSubmissionPayload {
  founderName: string;
  founderEmail: string;
  founderPhone?: string;
  linkedinUrl?: string;
  startupName: string;
  websiteUrl?: string;
  sector: string;
  stage: string;
  description: string;
  fundingSought?: string;
  pitchDeckUrl?: string;
  privacyConsent: boolean;
  captchaToken?: string;
  captchaAnswer?: string;
  companyFaxNumber?: string; // Honeypot
  formRenderedAt?: number;
}

function sanitizeText(value: unknown, maxLen = 3000): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function sanitizeForSpreadsheetCell(value: string): string {
  if (!value) return "";
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function isValidOptionalUrl(raw: string): boolean {
  if (!raw) return true;
  try {
    const url = new URL(raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeOptionalUrl(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `DVC-${year}-${randomHex}`;
}

async function persistSubmissionLocally(record: Record<string, unknown>): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, "submissions.jsonl");
  await fs.appendFile(filePath, JSON.stringify(record) + "\n", {
    encoding: "utf-8",
    mode: 0o600,
  });
}

export async function POST(request: NextRequest) {
  const now = Date.now();

  try {
    // 1. Rate Limiting Check
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateRecord = rateLimitMap.get(clientIp);
    if (rateRecord) {
      if (now - rateRecord.windowStart < RATE_LIMIT_WINDOW_MS) {
        if (rateRecord.count >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json(
            {
              ok: false,
              error: "rate_limited",
              message: "Too many submissions from this connection. Please try again later.",
            },
            { status: 429 }
          );
        }
        rateRecord.count += 1;
      } else {
        rateLimitMap.set(clientIp, { count: 1, windowStart: now });
      }
    } else {
      rateLimitMap.set(clientIp, { count: 1, windowStart: now });
    }

    // 2. Parse Body (Supports both multipart/form-data and JSON)
    const contentType = request.headers.get("content-type") || "";
    let body: Partial<PitchSubmissionPayload> = {};
    let uploadedDeckBuffer: Buffer | null = null;
    let uploadedDeckName = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = {
        founderName: (formData.get("founderName") as string) || "",
        founderEmail: (formData.get("founderEmail") as string) || "",
        founderPhone: (formData.get("founderPhone") as string) || undefined,
        linkedinUrl: (formData.get("linkedinUrl") as string) || undefined,
        startupName: (formData.get("startupName") as string) || "",
        websiteUrl: (formData.get("websiteUrl") as string) || undefined,
        sector: (formData.get("sector") as string) || "",
        stage: (formData.get("stage") as string) || "",
        description: (formData.get("description") as string) || "",
        fundingSought: (formData.get("fundingSought") as string) || undefined,
        pitchDeckUrl: (formData.get("pitchDeckUrl") as string) || undefined,
        privacyConsent: formData.get("privacyConsent") === "true",
        captchaToken: (formData.get("captchaToken") as string) || undefined,
        captchaAnswer: (formData.get("captchaAnswer") as string) || undefined,
        companyFaxNumber: (formData.get("companyFaxNumber") as string) || undefined,
        formRenderedAt: Number(formData.get("formRenderedAt")) || undefined,
      };

      const file = formData.get("pitchDeckFile") as File | null;
      if (file && typeof file === "object" && typeof file.arrayBuffer === "function" && file.size > 0) {
        if (file.size > 25 * 1024 * 1024) {
          return NextResponse.json(
            {
              ok: false,
              fieldErrors: {
                pitchDeckFile: "File size exceeds 25MB limit. Please upload a smaller file or provide a link.",
              },
            },
            { status: 400 }
          );
        }
        uploadedDeckBuffer = Buffer.from(await file.arrayBuffer());
        uploadedDeckName = file.name || "Pitch_Deck.pdf";
      }
    } else {
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error: "invalid_json",
            message: "Invalid request payload. Please check your form inputs.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Spam Protection: Honeypot & Timing
    const honeypot = sanitizeText(body.companyFaxNumber, 120);
    if (honeypot.length > 0) {
      return NextResponse.json(
        {
          ok: true,
          referenceId: "DVC-RECEIVED",
          submittedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }

    if (
      typeof body.formRenderedAt === "number" &&
      body.formRenderedAt > 0 &&
      now - body.formRenderedAt < 1000
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "submission_too_fast",
          message: "Please review your details before submitting.",
        },
        { status: 400 }
      );
    }

    // 4. Sanitize & Validate Form Fields
    const founderName = sanitizeText(body.founderName, 120);
    const founderEmail = sanitizeText(body.founderEmail, 160).toLowerCase();
    const founderPhone = sanitizeText(body.founderPhone, 60);
    const linkedinUrlRaw = sanitizeText(body.linkedinUrl, 300);
    const startupName = sanitizeText(body.startupName, 140);
    const websiteUrlRaw = sanitizeText(body.websiteUrl, 300);
    const sector = sanitizeText(body.sector, 120);
    const stage = sanitizeText(body.stage, 120);
    const description = sanitizeText(body.description, 3500);
    const fundingSought = sanitizeText(body.fundingSought, 160);
    const pitchDeckUrlRaw = sanitizeText(body.pitchDeckUrl, 400);
    const privacyConsent = body.privacyConsent === true;

    const fieldErrors: Record<string, string> = {};

    if (founderName.length < 2) {
      fieldErrors.founderName = "Please enter the founder's full name.";
    }
    if (!founderEmail || !isValidEmail(founderEmail)) {
      fieldErrors.founderEmail = "Please enter a valid work or founder email address.";
    }
    if (linkedinUrlRaw && !isValidOptionalUrl(linkedinUrlRaw)) {
      fieldErrors.linkedinUrl = "Please enter a valid LinkedIn URL.";
    }
    if (startupName.length < 2) {
      fieldErrors.startupName = "Please enter your startup or project name.";
    }
    if (websiteUrlRaw && !isValidOptionalUrl(websiteUrlRaw)) {
      fieldErrors.websiteUrl = "Please enter a valid website or product URL (e.g. https://example.com).";
    }
    if (!sector) {
      fieldErrors.sector = "Please select the primary sector for your business.";
    }
    if (!stage) {
      fieldErrors.stage = "Please select the current stage of your business.";
    }
    if (description.length < 20) {
      fieldErrors.description =
        "Please provide a meaningful description of the problem, the insight, and your solution (minimum 20 characters).";
    }
    if (pitchDeckUrlRaw && !isValidOptionalUrl(pitchDeckUrlRaw)) {
      fieldErrors.pitchDeckUrl =
        "Please enter a valid link to your pitch deck or memo (e.g. DocSend, Google Drive, or Notion URL).";
    }
    if (!privacyConsent) {
      fieldErrors.privacyConsent =
        "You must confirm that you consent to sharing this information for evaluation purposes.";
    }

    // Security Verification / CAPTCHA Validation
    const captchaCheck = verifyCaptcha(body.captchaToken, body.captchaAnswer);
    if (!captchaCheck.valid) {
      fieldErrors.captcha = captchaCheck.error || "Security verification failed. Please try again.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "validation_failed",
          fieldErrors,
          message: "Please correct the highlighted fields and resubmit.",
        },
        { status: 400 }
      );
    }

    const websiteUrl = normalizeOptionalUrl(websiteUrlRaw);
    const linkedinUrl = normalizeOptionalUrl(linkedinUrlRaw);
    const pitchDeckUrl = normalizeOptionalUrl(pitchDeckUrlRaw);

    // 5. Duplicate Submission Detection
    const fingerprint = crypto
      .createHash("sha256")
      .update(`${founderEmail}|${startupName.toLowerCase()}|${description.slice(0, 100)}`)
      .digest("hex");

    const existingSubmission = recentSubmissionHashes.get(fingerprint);
    if (existingSubmission && now - existingSubmission.timestamp < DEDUP_WINDOW_MS) {
      return NextResponse.json(
        {
          ok: true,
          referenceId: existingSubmission.referenceId,
          submittedAt: new Date(existingSubmission.timestamp).toISOString(),
          duplicateIgnored: true,
          message:
            "This startup pitch has already been recorded. Your submission has been securely delivered to our investment team.",
        },
        { status: 200 }
      );
    }

    const referenceId = generateReferenceId();
    const submittedAt = new Date().toISOString();

    // 6. Handle Uploaded Pitch Deck File (GCS Upload)
    let pitchDeckStorageUrl = "";
    if (uploadedDeckBuffer) {
      try {
        const uploadResult = await uploadPitchAttachment(
          `${referenceId}_${uploadedDeckName}`,
          uploadedDeckBuffer,
          uploadedDeckName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"
        );
        pitchDeckStorageUrl = uploadResult.url;
      } catch (uploadErr) {
        console.warn("[Pitch API] Deck file upload to storage failed:", uploadErr);
      }
    }

    // 7. Generate Executive Pitch Memorandum PDF
    let memoPdfBuffer: Buffer | null = null;
    let memoStorageUrl = "";
    try {
      memoPdfBuffer = await generatePitchMemoPdf({
        referenceId,
        submittedAt,
        founderName,
        founderEmail,
        founderPhone: founderPhone || undefined,
        linkedinUrl: linkedinUrl || undefined,
        startupName,
        websiteUrl: websiteUrl || undefined,
        sector,
        stage,
        description,
        fundingSought: fundingSought || undefined,
        pitchDeckUrl: pitchDeckUrl || undefined,
        pitchDeckFileName: uploadedDeckName || undefined,
        pitchDeckStorageUrl: pitchDeckStorageUrl || undefined,
      });

      // Upload memo PDF to storage vault
      const memoUpload = await uploadPitchAttachment(
        `Deevee_Capital_Pitch_Memo_${referenceId}.pdf`,
        memoPdfBuffer,
        "application/pdf"
      );
      memoStorageUrl = memoUpload.url;
    } catch (pdfErr) {
      console.warn("[Pitch API] Executive PDF Memo generation failed:", pdfErr);
    }

    // 8. Persist Submission Record Locally
    const submissionRecord = {
      referenceId,
      submittedAt,
      founderName,
      founderEmail,
      founderPhone: founderPhone || null,
      linkedinUrl: linkedinUrl || null,
      startupName,
      websiteUrl: websiteUrl || null,
      sector,
      stage,
      description,
      fundingSought: fundingSought || null,
      pitchDeckUrl: pitchDeckUrl || null,
      pitchDeckFileName: uploadedDeckName || null,
      pitchDeckStorageUrl: pitchDeckStorageUrl || null,
      memoStorageUrl: memoStorageUrl || null,
      privacyConsent: true,
    };

    try {
      await persistSubmissionLocally(submissionRecord);
    } catch {
      // Non-critical local ledger fallback
    }

    // 9. Prepare Email Attachments & Dispatch
    const attachments: PitchEmailAttachment[] = [];

    // Attachment A: Generated Executive Pitch Memorandum PDF
    if (memoPdfBuffer) {
      attachments.push({
        filename: `Deevee_Capital_Pitch_Memo_${referenceId}.pdf`,
        content: memoPdfBuffer,
        contentType: "application/pdf",
      });
    }

    // Attachment B: Founder's Uploaded Pitch Deck PDF (if uploaded)
    if (uploadedDeckBuffer) {
      attachments.push({
        filename: uploadedDeckName || `Pitch_Deck_${referenceId}.pdf`,
        content: uploadedDeckBuffer,
        contentType: uploadedDeckName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream",
      });
    }

    let emailResult: {
      success: boolean;
      mode: "smtp" | "resend" | "logged_only";
      error?: string;
    } = { success: true, mode: "logged_only" };

    try {
      emailResult = await sendPitchNotificationEmail({
        referenceId,
        submittedAt,
        founderName,
        founderEmail,
        founderPhone: founderPhone || undefined,
        linkedinUrl: linkedinUrl || undefined,
        startupName,
        websiteUrl: websiteUrl || undefined,
        sector,
        stage,
        description,
        fundingSought: fundingSought || undefined,
        pitchDeckUrl: pitchDeckUrl || undefined,
        pitchDeckFileName: uploadedDeckName || undefined,
        pitchDeckStorageUrl: pitchDeckStorageUrl || undefined,
        attachments,
      });
    } catch (emailErr) {
      console.error("[Deevee Capital Pitch API] Email notification error:", emailErr);
    }

    recentSubmissionHashes.set(fingerprint, { referenceId, timestamp: now });

    // 10. Return Public Confirmation (Including streaming download links)
    const downloadMemoUrl = `/api/pitch/download?file=Deevee_Capital_Pitch_Memo_${referenceId}.pdf`;
    const downloadDeckUrl = uploadedDeckName
      ? `/api/pitch/download?file=${referenceId}_${uploadedDeckName}`
      : undefined;

    return NextResponse.json(
      {
        ok: true,
        referenceId,
        submittedAt,
        memoUrl: downloadMemoUrl,
        deckUrl: downloadDeckUrl,
        message:
          "Thank you for sharing your startup with Deevee Capital. Your submission has been securely recorded and dispatched to our investment team.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Deevee Capital Pitch API] Unexpected error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "internal_error",
        message: "We encountered a temporary issue recording your submission. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const secretKey = process.env.ADMIN_API_SECRET?.trim();
  const authHeader = request.headers.get("x-admin-key")?.trim();

  if (!secretKey || authHeader !== secretKey) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), "data", "submissions.jsonl");
    const raw = await fs.readFile(filePath, "utf-8");
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const submissions = lines.map((l) => JSON.parse(l));

    return NextResponse.json({
      ok: true,
      count: submissions.length,
      submissions: submissions.reverse(),
    });
  } catch {
    return NextResponse.json({ ok: true, count: 0, submissions: [] });
  }
}
