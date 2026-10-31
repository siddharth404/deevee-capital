import nodemailer from "nodemailer";

export interface PitchEmailData {
  referenceId: string;
  submittedAt: string;
  founderName: string;
  founderEmail: string;
  startupName: string;
  websiteUrl?: string;
  sector: string;
  stage: string;
  description: string;
  fundingSought?: string;
  pitchDeckUrl?: string;
}

export const NOTIFICATION_RECIPIENTS = [
  "siddharth@deeveecapital.com",
  "ravi@deeveecapital.com",
];

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPitchNotificationEmail(data: PitchEmailData): Promise<{
  success: boolean;
  mode: "smtp" | "resend" | "logged_only";
  error?: string;
}> {
  const recipients = NOTIFICATION_RECIPIENTS;
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    `"Deevee Capital Registry" <siddharth@deeveecapital.com>`;

  const subject = `[New Startup Pitch] ${data.startupName} — ${data.founderName} (${data.referenceId})`;

  const textContent = `
NEW STARTUP PITCH SUBMISSION — DEEVEE CAPITAL
============================================
Reference ID: ${data.referenceId}
Recorded At: ${new Date(data.submittedAt).toUTCString()}

FOUNDER DETAILS
---------------
Founder Name:  ${data.founderName}
Founder Email: ${data.founderEmail}

STARTUP OVERVIEW
----------------
Startup Name:  ${data.startupName}
Website Link:  ${data.websiteUrl || "Not provided"}
Sector:        ${data.sector}
Stage:         ${data.stage}
Funding Sought: ${data.fundingSought || "Not specified"}
Pitch Deck URL: ${data.pitchDeckUrl || "Not provided"}

BUSINESS DESCRIPTION
--------------------
${data.description}

--------------------------------------------
Delivered to: ${recipients.join(", ")}
Deevee Capital (https://deeveecapital.com)
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #F7F5F0; margin: 0; padding: 24px; color: #17191C; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #E4E0D6; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 18px rgba(16, 26, 36, 0.06); }
    .header { background: #101A24; color: #F7F5F0; padding: 24px 30px; border-bottom: 2px solid #C6AD7A; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: Georgia, serif; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #C6AD7A; letter-spacing: 0.12em; text-transform: uppercase; }
    .content { padding: 30px; }
    .badge { display: inline-block; padding: 4px 10px; background: #F7F5F0; border: 1px solid #C6AD7A; font-size: 12px; font-family: monospace; color: #101A24; font-weight: 600; border-radius: 2px; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #77818B; margin: 24px 0 10px; border-bottom: 1px solid #ECE7DE; padding-bottom: 6px; }
    .field-row { display: flex; margin-bottom: 12px; font-size: 14px; line-height: 1.5; }
    .field-label { width: 140px; color: #77818B; font-weight: 500; flex-shrink: 0; }
    .field-val { color: #101A24; font-weight: 600; }
    .field-val a { color: #101A24; text-decoration: underline; }
    .desc-box { background: #F7F5F0; border-left: 3px solid #101A24; padding: 16px; margin: 14px 0; font-size: 14px; line-height: 1.6; color: #17191C; white-space: pre-wrap; }
    .cta-btn { display: inline-block; background: #101A24; color: #F7F5F0 !important; text-decoration: none; padding: 12px 22px; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 2px; margin-top: 8px; }
    .footer { background: #F7F5F0; padding: 18px 30px; font-size: 12px; color: #77818B; border-top: 1px solid #E4E0D6; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Deevee Capital</h1>
      <p>Startup Pitch Submission</p>
    </div>
    <div class="content">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <span class="badge">REF: ${data.referenceId}</span>
        <span style="font-size: 12px; color: #77818B;">${new Date(data.submittedAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} IST</span>
      </div>

      <div class="section-title">Startup Information</div>
      <div class="field-row">
        <span class="field-label">Company Name:</span>
        <span class="field-val" style="font-size: 16px;">${data.startupName}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Primary Sector:</span>
        <span class="field-val">${data.sector}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Current Stage:</span>
        <span class="field-val">${data.stage}</span>
      </div>
      ${data.websiteUrl ? `
      <div class="field-row">
        <span class="field-label">Website / Link:</span>
        <span class="field-val"><a href="${data.websiteUrl}" target="_blank" rel="noopener">${data.websiteUrl}</a></span>
      </div>` : ""}
      ${data.fundingSought ? `
      <div class="field-row">
        <span class="field-label">Funding Sought:</span>
        <span class="field-val">${data.fundingSought}</span>
      </div>` : ""}

      <div class="section-title">Founder Details</div>
      <div class="field-row">
        <span class="field-label">Founder Name:</span>
        <span class="field-val">${data.founderName}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Email Address:</span>
        <span class="field-val"><a href="mailto:${data.founderEmail}">${data.founderEmail}</a></span>
      </div>

      <div class="section-title">Overview &amp; Problem Solved</div>
      <div class="desc-box">${data.description}</div>

      ${data.pitchDeckUrl ? `
      <div style="margin-top: 20px; text-align: center;">
        <a href="${data.pitchDeckUrl}" target="_blank" rel="noopener" class="cta-btn">View Pitch Deck / Memo &rarr;</a>
      </div>` : ""}
    </div>
    <div class="footer">
      Delivered directly to Investment Team &bull; Deevee Capital &bull; <a href="https://deeveecapital.com" style="color:#77818B;">deeveecapital.com</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  // 1. Try Resend if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Deevee Capital <pitches@deeveecapital.com>",
          to: recipients,
          reply_to: data.founderEmail,
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        console.log(`[Email] Pitch notification sent via Resend to ${recipients.join(", ")}`);
        return { success: true, mode: "resend" };
      }
      const errBody = await res.text();
      console.warn(`[Email] Resend API error: ${errBody}`);
    } catch (err: unknown) {
      console.warn(`[Email] Resend delivery failed:`, err);
    }
  }

  // 2. Try standard SMTP / Google Workspace SMTP (Nodemailer)
  const transporter = createSmtpTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: recipients,
        replyTo: data.founderEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email] Pitch notification sent via SMTP to ${recipients.join(", ")}`);
      return { success: true, mode: "smtp" };
    } catch (smtpErr: unknown) {
      const errMsg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
      console.error(`[Email] SMTP delivery error:`, errMsg);
      return { success: false, mode: "smtp", error: errMsg };
    }
  }

  // 3. Fallback when credentials are not yet set
  console.log(`[Email] Notice: SMTP / Resend not configured yet. Email dispatch simulated.`);
  console.log(`[Email] Target Recipients: ${recipients.join(", ")}`);
  console.log(`[Email] Subject: ${subject}`);
  return { success: true, mode: "logged_only" };
}
