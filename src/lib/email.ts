import nodemailer, { Transporter } from "nodemailer";

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

let pooledTransporter: Transporter | null = null;

export function getSmtpTransporter(forceRecreate = false): Transporter | null {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  if (pooledTransporter && !forceRecreate) {
    return pooledTransporter;
  }

  if (forceRecreate && pooledTransporter) {
    try {
      pooledTransporter.close();
    } catch {
      // ignore
    }
    pooledTransporter = null;
  }

  pooledTransporter = nodemailer.createTransport({
    pool: true,
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    maxConnections: 1,    // Single persistent TLS connection to eliminate repeated login attempts
    maxMessages: 100,     // Stream up to 100 emails over one connection session
    rateDelta: 1000,      // Socket-level throttle (1 message/sec)
    rateLimit: 1,
    auth: {
      user,
      pass,
    },
  });

  return pooledTransporter;
}

function createSmtpTransporter() {
  return getSmtpTransporter();
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

export interface RecruitmentAssessmentEmailData {
  to: string;
  subject: string;
  candidateName: string;
  candidateCode: string;
  candidateEmail: string;
  password?: string;
  directLink: string;
  sampleTestLink?: string;
  portalInviteUrl?: string;
  deadline?: string;
  rawBodyText?: string;
  isTestSend?: boolean;
}

export function sanitizeOriginLink(url?: string, fallback: string = "https://deeveecapital.com"): string {
  if (!url) return fallback;
  return url
    .replace(/https?:\/\/0\.0\.0\.0(?::\d+)?/gi, "https://deeveecapital.com")
    .replace(/https?:\/\/127\.0\.0\.1(?::\d+)?/gi, "https://deeveecapital.com")
    .replace(/https?:\/\/localhost(?::\d+)?/gi, "https://deeveecapital.com");
}

export async function sendRecruitmentAssessmentEmail(data: RecruitmentAssessmentEmailData): Promise<{
  success: boolean;
  mode: "smtp" | "logged_only";
  messageId?: string;
  error?: string;
}> {
  const transporter = createSmtpTransporter();
  const fromAddress =
    process.env.SMTP_FROM ||
    `"Siddharth Kaushik (Deevee Capital)" <siddharth@deeveecapital.com>`;

  const directLink = sanitizeOriginLink(data.directLink, "https://deeveecapital.com/candidate");
  const sampleTestLink = sanitizeOriginLink(
    data.sampleTestLink,
    "https://deeveecapital.com/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com"
  );
  const password = data.password || "Deevee@2026";
  let deadline = data.deadline;
  if (!deadline && data.rawBodyText) {
    const match = data.rawBodyText.match(/Submission Window:\s*([^\n\r]+)/i);
    if (match && match[1]) {
      deadline = match[1].trim();
    }
  }
  if (!deadline) {
    deadline = "As specified in your Candidate Assessment Portal";
  }

  const rawCleaned = data.rawBodyText
    ? sanitizeOriginLink(data.rawBodyText)
        .replace(/48-hour window/gi, `Deadline: ${deadline}`)
        .replace(/Within 48 hours of (?:receipt|receiving this invitation)/gi, deadline)
    : null;
  const textContent =
    rawCleaned ||
    `
Dear ${data.candidateName},

Thank you for your interest in the Investment Research & Startup Sourcing Intern role at Deevee Capital.

Your application (${data.candidateCode}) has been shortlisted to complete Stage 1B: The 45-Minute Proctored AI Interview & Virtual Startup Data Room Assessment.

============================================================
YOUR CANDIDATE ACCESS CREDENTIALS
============================================================
Candidate ID (Username): ${data.candidateCode}
Registered Email:        ${data.candidateEmail}
Portal Password/Passkey: ${password}
Direct 1-Click Link:     ${directLink}

============================================================
PRACTICE / SAMPLE TEST SANDBOX (RECOMMENDED BEFORE STARTING)
============================================================
If you wish to test your camera, microphone, and screen share in advance, you may access the sandbox here:
${sampleTestLink}
(Sandbox Credentials: Username: DVC-SAMPLE-001 | Password: DVC@Sample2026)

============================================================
MANDATORY TECHNICAL & PROCTORING GUIDELINES
============================================================
1. LAPTOP OR DESKTOP COMPUTER ONLY: Mobile devices and tablets are strictly blocked by the portal.
2. CONTINUOUS HARDWARE PROCTORING: Webcam video, microphone audio, and Entire Screen sharing are mandatory.
3. SANCTUARY ANTI-CHEAT: Locked fullscreen mode; tab switching and external clipboard copy-paste (Ctrl+V) are disabled.
4. ASSESSMENT DURATION: 45 Minutes timed.

Access Your Assessment:
${directLink}

Deadline: ${deadline}

Warm regards,
Siddharth Kaushik
Managing Partner | Deevee Capital
siddharth@deeveecapital.com
https://deeveecapital.com
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${data.subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#070B14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#E2E8F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#070B14; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:620px; background-color:#0D1527; border:1px solid #1E293B; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- HEADER -->
          <tr>
            <td style="padding:28px 32px 20px 32px; background:linear-gradient(180deg, #101B33 0%, #0D1527 100%); border-bottom:1px solid #1E293B;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#38BDF8;">
                      Deevee Capital &bull; Investment OS
                    </div>
                    <h1 style="margin:6px 0 0 0; font-size:20px; font-weight:700; color:#FFFFFF;">
                      Investment Research Internship Assessment
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block; padding:4px 10px; background-color:#1E293B; border:1px solid #334155; border-radius:20px; font-size:11px; font-weight:600; color:#94A3B8;">
                      45 Mins Timed
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px 32px; font-size:14px; line-height:1.6; color:#CBD5E1;">
              <p style="margin-top:0;">Dear <strong style="color:#FFFFFF;">${data.candidateName}</strong>,</p>
              
              <p>
                Thank you for applying for the <strong>Investment Research & Startup Sourcing Intern</strong> role at Deevee Capital.
                Your profile has been shortlisted to complete Stage 1B: the <strong>45-Minute Proctored AI Interview & Virtual Startup Data Room Simulation</strong>.
              </p>

              <!-- CREDENTIALS BOX -->
              <div style="margin:24px 0; padding:20px; background-color:#070B14; border:1px solid #2563EB; border-radius:12px;">
                <div style="font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#60A5FA; margin-bottom:12px;">
                  Your Secure Candidate Credentials
                </div>
                <table role="presentation" width="100%" style="font-size:13px; line-height:1.8;">
                  <tr>
                    <td style="color:#94A3B8; width:170px;">Candidate ID (Username):</td>
                    <td style="color:#FFFFFF; font-family:monospace; font-weight:700; font-size:14px;">${data.candidateCode}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Registered Email:</td>
                    <td style="color:#FFFFFF; font-family:monospace;">${data.candidateEmail}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Portal Password / Passkey:</td>
                    <td style="color:#FCD34D; font-family:monospace; font-weight:700; font-size:14px; letter-spacing:0.5px;">${password}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Submission Deadline:</td>
                    <td style="color:#38BDF8; font-weight:700; font-size:13px;">${deadline}</td>
                  </tr>
                </table>
              </div>

              <!-- MAIN CTA BUTTON -->
              <div style="text-align:center; margin:28px 0;">
                <a href="${directLink}" target="_blank" style="display:inline-block; padding:14px 32px; background-color:#2563EB; color:#FFFFFF; font-weight:700; font-size:14px; text-decoration:none; border-radius:10px; box-shadow:0 4px 14px rgba(37,99,235,0.4);">
                  Launch 45-Minute Proctored Assessment &rarr;
                </a>
                <div style="font-size:11px; color:#64748B; margin-top:8px;">
                  Direct 1-click auto-authentication link
                </div>
              </div>

              <!-- SAMPLE TEST SANDBOX CALLOUT -->
              <div style="margin:24px 0; padding:16px; background-color:#0A1224; border:1px solid #1E293B; border-radius:10px;">
                <div style="font-size:12px; font-weight:600; color:#38BDF8; margin-bottom:6px;">
                  🧪 Optional: Practice in Sample Sandbox Mode
                </div>
                <p style="margin:0 0 10px 0; font-size:12px; color:#94A3B8;">
                  Test your camera, microphone, and screen share before starting your official timed evaluation:
                </p>
                <a href="${sampleTestLink}" target="_blank" style="display:inline-block; font-size:12px; color:#60A5FA; font-weight:600; text-decoration:none;">
                  Open Sandbox Practice Mode &rarr;
                </a>
              </div>

              <!-- GUIDELINES -->
              <div style="margin-top:24px; padding-top:20px; border-top:1px solid #1E293B;">
                <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:#94A3B8; letter-spacing:0.8px; margin-bottom:8px;">
                  Mandatory Hardware & Proctoring Rules:
                </div>
                <ul style="margin:0; padding-left:18px; font-size:12px; color:#94A3B8; line-height:1.7;">
                  <li><strong>Laptop or Desktop Computer Only:</strong> Mobile phones and tablets are blocked.</li>
                  <li><strong>Active Camera, Microphone & Screen Share:</strong> Required throughout all 3 phases.</li>
                  <li><strong>Sanctuary Anti-Cheat Mode:</strong> Locked fullscreen; external clipboard paste is blocked; tab switching will lower your integrity score.</li>
                  <li><strong>Submission Window / Deadline:</strong> ${deadline}.</li>
                </ul>
              </div>

              <!-- SIGNATURE -->
              <div style="margin-top:32px; padding-top:20px; border-top:1px solid #1E293B; font-size:13px; color:#94A3B8;">
                <strong style="color:#FFFFFF;">Siddharth Kaushik</strong><br/>
                Managing Partner &bull; Deevee Capital<br/>
                <a href="mailto:siddharth@deeveecapital.com" style="color:#38BDF8; text-decoration:none;">siddharth@deeveecapital.com</a> &bull;
                <a href="https://deeveecapital.com" style="color:#38BDF8; text-decoration:none;">deeveecapital.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  let activeTransporter = transporter;
  if (activeTransporter) {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const info = await activeTransporter.sendMail({
          from: fromAddress,
          to: data.to,
          replyTo: "siddharth@deeveecapital.com",
          subject: data.subject,
          text: textContent,
          html: htmlContent,
        });

        console.log(`[Email] Recruitment assessment email sent via SMTP to ${data.to} (MessageId: ${info.messageId}) [attempt ${attempt}]`);
        return {
          success: true,
          mode: "smtp",
          messageId: info.messageId,
        };
      } catch (err: unknown) {
        lastErr = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[Email] SMTP delivery attempt ${attempt} to ${data.to} failed: ${errMsg}`);
        if (attempt < 2) {
          // Pause and refresh pooled transporter on failure
          await new Promise((r) => setTimeout(r, 3000));
          activeTransporter = getSmtpTransporter(true);
          if (!activeTransporter) break;
        }
      }
    }

    const errMsg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    console.error(`[Email] SMTP delivery error to ${data.to}:`, errMsg);
    return {
      success: false,
      mode: "smtp",
      error: errMsg,
    };
  }

  console.log(`[Email] SMTP transporter unavailable. Logged dispatch to ${data.to}.`);
  return {
    success: true,
    mode: "logged_only",
  };
}

export interface WorkspaceTeamInvitationEmailData {
  to: string;
  name: string;
  role: string;
  accessScope?: string;
  inviteCode: string;
  invitedByName?: string;
  workspaceUrl?: string;
  expiresAt?: string;
}

export async function sendWorkspaceTeamInvitationEmail(data: WorkspaceTeamInvitationEmailData): Promise<{
  success: boolean;
  mode: "smtp" | "logged_only";
  messageId?: string;
  error?: string;
}> {
  const transporter = createSmtpTransporter();
  const fromAddress =
    process.env.SMTP_FROM ||
    `"Siddharth Kaushik (Deevee Capital)" <siddharth@deeveecapital.com>`;

  const baseUrl = sanitizeOriginLink(data.workspaceUrl, "https://deeveecapital.com/workspace");
  const workspaceInviteUrl = `${baseUrl.split("?")[0]}?invite=${encodeURIComponent(data.inviteCode)}`;
  const expiresAtFormatted = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "7 days from issuance";

  const textContent = `
Dear ${data.name},

${data.invitedByName || "Siddharth Kaushik"} has invited you to join the Deevee Capital Internal Investment Management Platform as ${data.role}.

============================================================
YOUR WORKSPACE ONBOARDING INVITATION
============================================================
• Invited Member:       ${data.name}
• Assigned Role:        ${data.role}
• Access Scope:         ${data.accessScope === "all" ? "All Startup Records" : "Assigned Records Only"}
• One-Time Invite Code: ${data.inviteCode}
• Invitation Expiration: ${expiresAtFormatted}

============================================================
HOW TO ACTIVATE YOUR ACCESS
============================================================
1. Open the secure registration link:
   ${workspaceInviteUrl}
2. Your Invite Code (${data.inviteCode}) and registered email (${data.to}) will be pre-filled.
3. Set your private account password to activate your workspace access.

Direct Onboarding Link:
${workspaceInviteUrl}

Warm regards,
Siddharth Kaushik
Managing Partner | Deevee Capital
siddharth@deeveecapital.com
https://deeveecapital.com
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invitation to Deevee Capital Workspace</title>
</head>
<body style="margin:0; padding:0; background-color:#070B14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#E2E8F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#070B14; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px; background-color:#0D1527; border:1px solid #1E293B; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- HEADER -->
          <tr>
            <td style="padding:28px 32px 20px 32px; background:linear-gradient(180deg, #101B33 0%, #0D1527 100%); border-bottom:1px solid #1E293B;">
              <div style="font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#38BDF8;">
                Deevee Capital &bull; Investment OS
              </div>
              <h1 style="margin:6px 0 0 0; font-size:20px; font-weight:700; color:#FFFFFF;">
                Team Member Workspace Invitation
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px 32px; font-size:14px; line-height:1.6; color:#CBD5E1;">
              <p style="margin-top:0;">Dear <strong style="color:#FFFFFF;">${data.name}</strong>,</p>
              
              <p>
                <strong>${data.invitedByName || "Siddharth Kaushik"}</strong> has invited you to join the internal Deevee Capital investment platform as <strong>${data.role}</strong>.
              </p>

              <!-- CREDENTIALS BOX -->
              <div style="margin:24px 0; padding:20px; background-color:#070B14; border:1px solid #C6AD7A; border-radius:12px;">
                <div style="font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#C6AD7A; margin-bottom:12px;">
                  Your Secure Invitation Details
                </div>
                <table role="presentation" width="100%" style="font-size:13px; line-height:1.8;">
                  <tr>
                    <td style="color:#94A3B8; width:150px;">Invited Member:</td>
                    <td style="color:#FFFFFF; font-weight:600;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Work Email:</td>
                    <td style="color:#FFFFFF; font-family:monospace;">${data.to}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Role & Scope:</td>
                    <td style="color:#38BDF8; font-weight:600;">${data.role} (${data.accessScope === "all" ? "All Records" : "Assigned Records"})</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Invite Code:</td>
                    <td style="color:#FCD34D; font-family:monospace; font-weight:700; font-size:15px; letter-spacing:1px;">${data.inviteCode}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Validity:</td>
                    <td style="color:#94A3B8;">Valid until ${expiresAtFormatted}</td>
                  </tr>
                </table>
              </div>

              <!-- MAIN CTA BUTTON -->
              <div style="text-align:center; margin:28px 0;">
                <a href="${workspaceInviteUrl}" target="_blank" style="display:inline-block; padding:14px 32px; background-color:#C6AD7A; color:#070B14; font-weight:700; font-size:14px; text-decoration:none; border-radius:10px; box-shadow:0 4px 14px rgba(198,173,122,0.4);">
                  Accept Invitation & Set Up Account &rarr;
                </a>
                <div style="font-size:11px; color:#64748B; margin-top:8px;">
                  Opens pre-filled registration screen on deeveecapital.com
                </div>
              </div>

              <!-- SIGNATURE -->
              <div style="margin-top:32px; padding-top:20px; border-top:1px solid #1E293B; font-size:13px; color:#94A3B8;">
                <strong style="color:#FFFFFF;">Siddharth Kaushik</strong><br/>
                Managing Partner &bull; Deevee Capital<br/>
                <a href="mailto:siddharth@deeveecapital.com" style="color:#38BDF8; text-decoration:none;">siddharth@deeveecapital.com</a> &bull;
                <a href="https://deeveecapital.com" style="color:#38BDF8; text-decoration:none;">deeveecapital.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: data.to,
        replyTo: "siddharth@deeveecapital.com",
        subject: `Invitation: Join Deevee Capital Workspace as ${data.role} (${data.inviteCode})`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email] Workspace team invitation sent via SMTP to ${data.to} (MessageId: ${info.messageId})`);
      return {
        success: true,
        mode: "smtp",
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Email] Workspace invitation delivery error to ${data.to}:`, errMsg);
      return {
        success: false,
        mode: "smtp",
        error: errMsg,
      };
    }
  }

  console.log(`[Email] SMTP transporter unavailable. Logged workspace invite to ${data.to}.`);
  return {
    success: true,
    mode: "logged_only",
  };
}

export interface AssessmentContinuationEmailData {
  to: string;
  candidateName: string;
  candidateCode: string;
  candidateEmail: string;
  password?: string;
  directLink: string;
  currentPhaseAndQuestion: string;
  answeredQuestionsCount: number;
  totalQuestionsCount: number;
  deadline?: string;
}

export async function sendAssessmentContinuationEmail(
  data: AssessmentContinuationEmailData
): Promise<{
  success: boolean;
  mode: "smtp" | "logged_only";
  messageId?: string;
  error?: string;
}> {
  const transporter = createSmtpTransporter();
  const fromAddress =
    process.env.SMTP_FROM ||
    `"Siddharth Kaushik (Deevee Capital)" <siddharth@deeveecapital.com>`;

  const directLink = sanitizeOriginLink(data.directLink, "https://deeveecapital.com/candidate");
  const password = data.password || "Deevee@2026";
  const deadline = data.deadline || "Tuesday, Nov 10, 2026 at 11:59 PM IST";
  const subject = `Resume & Complete Your Deevee Capital Assessment [${data.candidateCode}] — Progress Saved`;

  const textContent = `
Dear ${data.candidateName},

We noticed that your Deevee Capital Investment Research & Startup Sourcing Intern Assessment (${data.candidateCode}) is currently in progress (${data.currentPhaseAndQuestion}) and has not yet been finally submitted.

============================================================
IMPORTANT REASSURANCE — YOUR TEST IS NOT CANCELLED
============================================================
• If you experienced an internet disconnection, browser refresh, camera/screen-share interruption, or saw a proctoring alert, please do NOT worry — your assessment is NOT cancelled.
• All of your completed responses (${data.answeredQuestionsCount} of ${data.totalQuestionsCount} interview turns) are safely saved.
• Simply click your direct resume link below (or press F5 / Cmd+R to refresh your open browser tab) to continue directly from where you left off and submit your final Phase 3 Deal Triage Worksheet.

============================================================
1-CLICK RESUME LINK & CREDENTIALS
============================================================
Resume Directly Here:    ${directLink}
Candidate ID (Username): ${data.candidateCode}
Registered Email:        ${data.candidateEmail}
Portal Password/Passkey: ${password}
Saved Progress:          ${data.currentPhaseAndQuestion}
Submission Deadline:     ${deadline}

Please make sure to click "Submit Deal Triage & Complete Proctored Assessment" at the bottom of Phase 3 so your final evaluation is locked and recorded.

Warm regards,
Siddharth Kaushik
Managing Partner | Deevee Capital
https://deeveecapital.com
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#070B14; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#E2E8F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#070B14; padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; background-color:#0D1527; border:1px solid #1E293B; border-radius:16px; overflow:hidden;">
          <tr>
            <td style="padding:24px 28px; background:linear-gradient(135deg, #0F1A30 0%, #091020 100%); border-bottom:1px solid #1E293B;">
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#38BDF8; margin-bottom:4px;">
                Deevee Capital &bull; Assessment Continuation Notice
              </div>
              <div style="font-size:20px; font-weight:700; color:#FFFFFF;">
                Your Progress Is Saved — Resume &amp; Complete Your Assessment
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 28px; font-size:14px; line-height:1.65; color:#CBD5E1;">
              <p style="margin:0 0 14px 0; color:#FFFFFF; font-size:15px;">
                Dear <strong>${data.candidateName}</strong>,
              </p>
              <p style="margin:0 0 16px 0;">
                We noticed your Deevee Capital assessment session (<strong>${data.candidateCode}</strong>) is currently at <strong style="color:#38BDF8;">${data.currentPhaseAndQuestion}</strong> and awaits final submission.
              </p>

              <div style="background-color:#064E3B; border:1px solid #10B981; border-radius:12px; padding:16px 18px; margin:18px 0;">
                <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#6EE7B7; margin-bottom:6px;">
                  &#10003; Reassurance: Your Exam Is Active &amp; Not Cancelled
                </div>
                <div style="font-size:13px; color:#ECFDF5; line-height:1.55;">
                  If you lost internet connectivity, experienced a browser/hardware glitch, or saw a proctoring flag, <strong>your test has NOT been cancelled</strong>. All your completed answers (${data.answeredQuestionsCount}/${data.totalQuestionsCount} interview questions) are safely preserved. Simply refresh your page (<strong>F5 / Cmd+R</strong>) or click the button below to continue from where you left off.
                </div>
              </div>

              <div style="background-color:#070B14; border:1px solid #334155; border-radius:12px; padding:16px 18px; margin:18px 0;">
                <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; margin-bottom:10px;">
                  Saved Session &amp; Access Credentials
                </div>
                <table role="presentation" width="100%" style="font-size:13px; line-height:1.75;">
                  <tr>
                    <td style="color:#94A3B8; width:155px;">Candidate ID:</td>
                    <td style="color:#38BDF8; font-family:monospace; font-weight:700;">${data.candidateCode}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Registered Email:</td>
                    <td style="color:#F8FAFC; font-family:monospace;">${data.candidateEmail}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Portal Passkey:</td>
                    <td style="color:#FCD34D; font-family:monospace; font-weight:700;">${password}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Current Stage:</td>
                    <td style="color:#6EE7B7; font-weight:600;">${data.currentPhaseAndQuestion}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Submission Deadline:</td>
                    <td style="color:#F8FAFC;">${deadline}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align:center; margin:24px 0;">
                <a href="${directLink}" target="_blank" style="display:inline-block; padding:14px 28px; background:linear-gradient(90deg, #2563EB 0%, #4F46E5 100%); color:#FFFFFF; font-weight:700; font-size:14px; text-decoration:none; border-radius:10px;">
                  Resume Assessment From Where You Left Off &rarr;
                </a>
              </div>

              <p style="font-size:12px; color:#94A3B8; margin:16px 0 0 0;">
                <strong>Note for Phase 3:</strong> Once you reach Phase 3 (Virtual Startup Data Room), please complete the 3 tasks on the right-hand worksheet and click <em>&ldquo;Submit Deal Triage &amp; Complete Proctored Assessment&rdquo;</em> to lock in your final submission.
              </p>

              <div style="margin-top:24px; padding-top:16px; border-top:1px solid #1E293B; font-size:12px; color:#94A3B8;">
                <strong style="color:#FFFFFF;">Siddharth Kaushik</strong> &bull; Managing Partner, Deevee Capital<br/>
                <a href="mailto:siddharth@deeveecapital.com" style="color:#38BDF8; text-decoration:none;">siddharth@deeveecapital.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: data.to,
        replyTo: "siddharth@deeveecapital.com",
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[Email] Continuation reminder sent to ${data.to} (${data.candidateCode}) - MessageId: ${info.messageId}`);
      return { success: true, mode: "smtp", messageId: info.messageId };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Email] Continuation reminder failed for ${data.to}:`, errMsg);
      return { success: false, mode: "smtp", error: errMsg };
    }
  }

  return { success: true, mode: "logged_only" };
}

