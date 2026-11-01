import nodemailer from "nodemailer";

export interface PitchEmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface PitchEmailData {
  referenceId: string;
  submittedAt: string;
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
  pitchDeckStorageUrl?: string;
  pitchDeckFileName?: string;
  attachments?: PitchEmailAttachment[];
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
Founder Name:     ${data.founderName}
Founder Email:    ${data.founderEmail}
Founder Phone:    ${data.founderPhone || "Not provided"}
Founder LinkedIn: ${data.linkedinUrl || "Not provided"}

STARTUP OVERVIEW
----------------
Startup Name:   ${data.startupName}
Website Link:   ${data.websiteUrl || "Not provided"}
Sector:         ${data.sector}
Stage:          ${data.stage}
Funding Sought: ${data.fundingSought || "Not specified"}
Pitch Deck URL: ${data.pitchDeckUrl || "Not provided"}
${data.pitchDeckFileName ? `Attached Deck File: ${data.pitchDeckFileName}` : ""}
${data.pitchDeckStorageUrl ? `Cloud Vault Link: ${data.pitchDeckStorageUrl}` : ""}

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
    .card { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #E4E0D6; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 18px rgba(16, 26, 36, 0.06); }
    .header { background: #101A24; color: #F7F5F0; padding: 24px 30px; border-bottom: 2px solid #C6AD7A; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: Georgia, serif; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #C6AD7A; letter-spacing: 0.12em; text-transform: uppercase; }
    .content { padding: 30px; }
    .badge { display: inline-block; padding: 4px 10px; background: #F7F5F0; border: 1px solid #C6AD7A; font-size: 12px; font-family: monospace; color: #101A24; font-weight: 600; border-radius: 2px; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #77818B; margin: 24px 0 10px; border-bottom: 1px solid #ECE7DE; padding-bottom: 6px; }
    .field-row { display: flex; margin-bottom: 12px; font-size: 14px; line-height: 1.5; }
    .field-label { width: 150px; color: #77818B; font-weight: 500; flex-shrink: 0; }
    .field-val { color: #101A24; font-weight: 600; }
    .field-val a { color: #101A24; text-decoration: underline; }
    .desc-box { background: #F7F5F0; border-left: 3px solid #101A24; padding: 16px; margin: 14px 0; font-size: 14px; line-height: 1.6; color: #17191C; white-space: pre-wrap; }
    .attachment-box { background: #EBF0F5; border: 1px solid #D2DCE6; padding: 14px 18px; border-radius: 4px; margin-top: 16px; font-size: 13px; color: #101A24; }
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
      ${data.founderPhone ? `
      <div class="field-row">
        <span class="field-label">Phone / WhatsApp:</span>
        <span class="field-val"><a href="tel:${data.founderPhone}">${data.founderPhone}</a></span>
      </div>` : ""}
      ${data.linkedinUrl ? `
      <div class="field-row">
        <span class="field-label">LinkedIn Profile:</span>
        <span class="field-val"><a href="${data.linkedinUrl}" target="_blank" rel="noopener">${data.linkedinUrl}</a></span>
      </div>` : ""}

      <div class="section-title">Overview &amp; Problem Solved</div>
      <div class="desc-box">${data.description}</div>

      ${data.pitchDeckStorageUrl ? `
      <div class="attachment-box">
        <strong>Attached Pitch Deck:</strong> <a href="${data.pitchDeckStorageUrl}" target="_blank" rel="noopener">${data.pitchDeckFileName || "Download Deck PDF"}</a>
      </div>` : ""}

      ${data.pitchDeckUrl ? `
      <div style="margin-top: 14px; text-align: center;">
        <a href="${data.pitchDeckUrl}" target="_blank" rel="noopener" class="cta-btn">View External Pitch Deck / Link &rarr;</a>
      </div>` : ""}
    </div>
    <div class="footer">
      Delivered directly to Investment Team &bull; Deevee Capital &bull; <a href="https://deeveecapital.com" style="color:#77818B;">deeveecapital.com</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  // 1. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const resendAttachments = data.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content.toString("base64"),
      }));

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
          attachments: resendAttachments,
        }),
      });

      if (res.ok) {
        console.log(`[Email] Pitch notification sent via Resend with ${data.attachments?.length || 0} attachments.`);
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
      const nodemailerAttachments = data.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || "application/pdf",
      }));

      // A) Send to Investment Team (Siddharth & Ravi)
      await transporter.sendMail({
        from: fromAddress,
        to: recipients,
        replyTo: data.founderEmail,
        subject,
        text: textContent,
        html: htmlContent,
        attachments: nodemailerAttachments,
      });

      console.log(`[Email] Pitch notification sent via SMTP to ${recipients.join(", ")} with ${data.attachments?.length || 0} attachments.`);

      // B) Send Confirmation Receipt back to Founder
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: data.founderEmail,
          subject: `Submission Received: ${data.startupName} [${data.referenceId}] — Deevee Capital`,
          text: `Dear ${data.founderName},\n\nThank you for sharing ${data.startupName} with Deevee Capital. We have securely received your pitch and materials under Reference ID ${data.referenceId}.\n\nYour pitch memorandum has been attached for your records. Our investment team will review your submission.\n\nWarm regards,\nDeevee Capital Team\nhttps://deeveecapital.com`,
          html: `
            <div style="font-family:sans-serif; max-width:580px; margin:0 auto; padding:24px; color:#17191C;">
              <h2 style="font-family:Georgia,serif; color:#101A24; margin-top:0;">Deevee Capital</h2>
              <p>Dear ${data.founderName},</p>
              <p>Thank you for submitting <strong>${data.startupName}</strong>. Your materials have been securely recorded under Reference ID: <strong style="font-family:monospace; background:#F7F5F0; padding:2px 6px; border:1px solid #C6AD7A;">${data.referenceId}</strong>.</p>
              <p>An official Executive Pitch Memorandum PDF has been attached to this email for your records.</p>
              <p>Our investment team reviews submissions against our areas of interest. If there is mutual alignment, we will reach out directly.</p>
              <hr style="border:none; border-top:1px solid #ECE7DE; margin:24px 0;" />
              <p style="font-size:12px; color:#77818B;">Deevee Capital &bull; <a href="https://deeveecapital.com" style="color:#77818B;">deeveecapital.com</a><br/>Associated with Dee Vee Projects Limited (dvplindia.in)</p>
            </div>
          `,
          attachments: data.attachments?.filter((a) => a.filename.includes("Memo")),
        });
      } catch (receiptErr) {
        console.warn("[Email] Failed to send founder receipt:", receiptErr);
      }

      return { success: true, mode: "smtp" };
    } catch (smtpErr: unknown) {
      const errMsg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
      console.error(`[Email] SMTP delivery error:`, errMsg);
      return { success: false, mode: "smtp", error: errMsg };
    }
  }

  // 3. Fallback when credentials are not yet set
  console.log(`[Email] Notice: SMTP / Resend not configured in environment. Logged dispatch.`);
  console.log(`[Email] Recipients: ${recipients.join(", ")} | Attachments: ${data.attachments?.length || 0}`);
  return { success: true, mode: "logged_only" };
}
