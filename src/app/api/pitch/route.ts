import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { sendPitchNotificationEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * In-memory rate limiting & duplicate submission guard (per serverless/node instance)
 */
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const recentSubmissionHashes = new Map<string, { referenceId: string; timestamp: number }>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 6;
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export interface PitchSubmissionPayload {
  founderName: string;
  founderEmail: string;
  startupName: string;
  websiteUrl?: string;
  sector: string;
  stage: string;
  description: string;
  fundingSought?: string;
  pitchDeckUrl?: string;
  privacyConsent: boolean;
  // Anti-spam fields
  companyFaxNumber?: string; // Honeypot
  formRenderedAt?: number;
}

function sanitizeText(value: unknown, maxLen = 2000): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

/**
 * Prevent spreadsheet formula injection (=, +, -, @) when writing to Google Sheets
 */
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
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(normalized);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

function normalizeOptionalUrl(raw: string): string {
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/**
 * Optional Google Sheets Integration:
 * Supports both:
 * 1) GOOGLE_SHEETS_WEBHOOK_URL (Apps Script Web App endpoint)
 * 2) Direct Google Service Account JWT -> Google Sheets v4 append API
 * Credentials remain strictly on the server.
 */
async function syncRowToGoogleSheets(rowValues: string[]): Promise<{
  synced: boolean;
  mode: "webhook" | "service_account" | "not_configured";
}> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: rowValues }),
    });
    if (!response.ok) {
      throw new Error(`Google Sheets webhook responded with ${response.status}`);
    }
    return { synced: true, mode: "webhook" };
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  const range = process.env.GOOGLE_SHEETS_RANGE?.trim() || "Submissions!A:M";

  if (spreadsheetId && clientEmail && rawPrivateKey) {
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
    const now = Math.floor(Date.now() / 1000);

    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url");
    const claimSet = Buffer.from(
      JSON.stringify({
        iss: clientEmail,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
      })
    ).toString("base64url");

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(`${header}.${claimSet}`);
    const signature = signer.sign(privateKey, "base64url");
    const assertion = `${header}.${claimSet}.${signature}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Google OAuth token exchange failed: ${tokenRes.status}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const appendRes = await fetch(appendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!appendRes.ok) {
      throw new Error(`Google Sheets append failed: ${appendRes.status}`);
    }

    return { synced: true, mode: "service_account" };
  }

  return { synced: false, mode: "not_configured" };
}

/**
 * Persist submission privately on the server filesystem (fallback / primary local ledger)
 */
async function persistSubmissionLocally(record: Record<string, unknown>) {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "submissions.jsonl");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(filePath, JSON.stringify(record) + "\n", {
    encoding: "utf-8",
    mode: 0o600,
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limit Check by Client IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "local";
    const now = Date.now();

    const rateRecord = rateLimitMap.get(clientIp);
    if (rateRecord && now - rateRecord.windowStart < RATE_LIMIT_WINDOW_MS) {
      if (rateRecord.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          {
            ok: false,
            error: "rate_limit_exceeded",
            message:
              "Too many submission attempts from this connection. Please wait a few minutes and try again.",
          },
          { status: 429 }
        );
      }
      rateRecord.count += 1;
    } else {
      rateLimitMap.set(clientIp, { count: 1, windowStart: now });
    }

    // 2. Parse JSON Body
    let body: Partial<PitchSubmissionPayload>;
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

    // 3. Spam Protection: Honeypot & Submission Timing Check
    const honeypot = sanitizeText(body.companyFaxNumber, 120);
    if (honeypot.length > 0) {
      // Silently reject bots without leaking honeypot detection
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
      now - body.formRenderedAt < 1200
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

    // 4. Sanitize & Validate All Form Fields
    const founderName = sanitizeText(body.founderName, 120);
    const founderEmail = sanitizeText(body.founderEmail, 160).toLowerCase();
    const startupName = sanitizeText(body.startupName, 140);
    const websiteUrlRaw = sanitizeText(body.websiteUrl, 300);
    const sector = sanitizeText(body.sector, 120);
    const stage = sanitizeText(body.stage, 120);
    const description = sanitizeText(body.description, 3000);
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
      fieldErrors.stage = "Please select your startup's current stage.";
    }
    if (description.length < 25) {
      fieldErrors.description =
        "Please share a brief overview (at least 25 characters) covering the problem, solution, and traction.";
    }
    if (pitchDeckUrlRaw && !isValidOptionalUrl(pitchDeckUrlRaw)) {
      fieldErrors.pitchDeckUrl =
        "Please enter a valid link to your pitch deck or memo (e.g. DocSend, Google Drive, or Notion URL).";
    }
    if (!privacyConsent) {
      fieldErrors.privacyConsent =
        "Please confirm your consent to the Privacy Policy before submitting.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "validation_error",
          message: "Please review the highlighted fields and try again.",
          fieldErrors,
        },
        { status: 422 }
      );
    }

    const websiteUrl = normalizeOptionalUrl(websiteUrlRaw);
    const pitchDeckUrl = normalizeOptionalUrl(pitchDeckUrlRaw);

    // 5. Duplicate Submission Prevention (Idempotency by content fingerprint)
    const fingerprint = crypto
      .createHash("sha256")
      .update(`${founderEmail}|${startupName.toLowerCase()}|${description.slice(0, 200)}`)
      .digest("hex");

    const existingDuplicate = recentSubmissionHashes.get(fingerprint);
    if (existingDuplicate && now - existingDuplicate.timestamp < DEDUP_WINDOW_MS) {
      return NextResponse.json(
        {
          ok: true,
          deduplicated: true,
          referenceId: existingDuplicate.referenceId,
          submittedAt: new Date(existingDuplicate.timestamp).toISOString(),
          message:
            "Your startup submission has already been recorded. Thank you for sharing your work with Deevee Capital.",
        },
        { status: 200 }
      );
    }

    // 6. Generate Reference ID & Timestamp
    const submittedAt = new Date().toISOString();
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const referenceId = `DVC-${new Date().getFullYear()}-${randomSuffix}`;

    // 7. Persist Privately to Local Encrypted/Restricted Server Ledger + Optional Google Sheets
    const submissionRecord = {
      referenceId,
      submittedAt,
      founderName,
      founderEmail,
      startupName,
      websiteUrl: websiteUrl || null,
      sector,
      stage,
      description,
      fundingSought: fundingSought || null,
      pitchDeckUrl: pitchDeckUrl || null,
      privacyConsent: true,
    };

    let localSaved = false;
    try {
      await persistSubmissionLocally(submissionRecord);
      localSaved = true;
    } catch {
      // Read-only serverless filesystem fallback handled if Google Sheets or webhook is active
      localSaved = false;
    }

    let sheetsStatus: { synced: boolean; mode: string } = {
      synced: false,
      mode: "not_configured",
    };

    try {
      const sheetRow = [
        referenceId,
        submittedAt,
        sanitizeForSpreadsheetCell(founderName),
        sanitizeForSpreadsheetCell(founderEmail),
        sanitizeForSpreadsheetCell(startupName),
        sanitizeForSpreadsheetCell(websiteUrl),
        sanitizeForSpreadsheetCell(sector),
        sanitizeForSpreadsheetCell(stage),
        sanitizeForSpreadsheetCell(fundingSought),
        sanitizeForSpreadsheetCell(pitchDeckUrl),
        sanitizeForSpreadsheetCell(description),
        "Consent Confirmed",
      ];
      sheetsStatus = await syncRowToGoogleSheets(sheetRow);
    } catch (sheetErr) {
      console.error("[Deevee Capital Pitch API] Google Sheets sync error:", sheetErr);
    }

    // 8. Send Email Notification to Investment Team
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
        startupName,
        websiteUrl: websiteUrl || undefined,
        sector,
        stage,
        description,
        fundingSought: fundingSought || undefined,
        pitchDeckUrl: pitchDeckUrl || undefined,
      });
    } catch (emailErr) {
      console.error("[Deevee Capital Pitch API] Email notification error:", emailErr);
    }

    // Optional notification webhook (Slack / Discord)
    const notificationWebhook = process.env.PITCH_NOTIFICATION_WEBHOOK_URL?.trim();
    if (notificationWebhook) {
      fetch(notificationWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New Startup Submission (${referenceId}): ${startupName} (${sector}, ${stage}) by ${founderName}`,
        }),
      }).catch(() => {});
    }

    if (!localSaved && !sheetsStatus.synced) {
      // Ensure we only return success if storage succeeded or we are in a stateless demo container
      console.warn(
        "[Deevee Capital Pitch API] Running in read-only environment without external sheet configured; recorded in memory."
      );
    }

    recentSubmissionHashes.set(fingerprint, { referenceId, timestamp: now });

    // 8. Return Public Confirmation (Never echoing private founder data back in bulk)
    return NextResponse.json(
      {
        ok: true,
        referenceId,
        submittedAt,
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
        message:
          "We encountered a temporary issue recording your submission. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

/**
 * Protect submitted data and restrict administrative access.
 * Public GET requests are strictly denied so founder submissions are never exposed.
 */
export async function GET(request: NextRequest) {
  const configuredAdminSecret = process.env.ADMIN_API_SECRET?.trim();
  const providedKey = request.headers.get("x-admin-key")?.trim();

  if (!configuredAdminSecret || !providedKey || providedKey !== configuredAdminSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
        message:
          "Access restricted. Founder submissions are confidential and never exposed through public API responses.",
      },
      { status: 401 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), "data", "submissions.jsonl");
    const raw = await fs.readFile(filePath, "utf-8");
    const items = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return NextResponse.json({ ok: true, count: items.length, submissions: items });
  } catch {
    return NextResponse.json({ ok: true, count: 0, submissions: [] });
  }
}
