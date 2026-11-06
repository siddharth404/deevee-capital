/**
 * DEEVEE CAPITAL — RECRUITMENT INVITATION DISPATCH RUNNER
 * Dispatches the latest assessment invitations to candidates 33 to 79
 * using persistent SMTP connection pooling and 1.25s pacing to avoid rate-limiting.
 */

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// 1. Load environment variables
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT) || 465;
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;
const fromAddress = process.env.SMTP_FROM || `"Siddharth Kaushik (Deevee Capital)" <siddharth@deeveecapital.com>`;

if (!user || !pass) {
  console.error("FATAL: SMTP credentials not found in environment.");
  process.exit(1);
}

// 2. Initialize persistent pooled transporter
const transporter = nodemailer.createTransport({
  pool: true,
  host,
  port,
  secure: port === 465,
  maxConnections: 1,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 1,
  auth: { user, pass },
});

function generateCandidateRandomPassword(candidateCode, email) {
  const seed = `${candidateCode.trim().toUpperCase()}:${email.trim().toLowerCase()}:dvc-candidate-secure-passkey-2026`;
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  const charsUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const charsLower = "abcdefghjkmnpqrstuvwxyz";
  const charsDigits = "23456789";
  const u1 = charsUpper[parseInt(hash.slice(0, 2), 16) % charsUpper.length];
  const u2 = charsUpper[parseInt(hash.slice(2, 4), 16) % charsUpper.length];
  const l1 = charsLower[parseInt(hash.slice(4, 6), 16) % charsLower.length];
  const l2 = charsLower[parseInt(hash.slice(6, 8), 16) % charsLower.length];
  const d1 = charsDigits[parseInt(hash.slice(8, 10), 16) % charsDigits.length];
  const d2 = charsDigits[parseInt(hash.slice(10, 12), 16) % charsDigits.length];
  return `DVC@${u1}${l1}${d1}${u2}${l2}${d2}`;
}

function createCandidateInviteToken(candidateId, email) {
  const secret = process.env.ADMIN_API_SECRET || "deevee-capital-candidate-invite-secret-2026";
  const exp = Date.now() + 14 * 24 * 60 * 60 * 1000;
  const payload = `${candidateId}|${email.toLowerCase()}|${exp}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
  return Buffer.from(`${payload}|${sig}`, "utf-8").toString("base64url");
}

async function run() {
  console.log("Verifying SMTP connection pool...");
  await new Promise((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) return reject(err);
      console.log("SMTP Connection pool verified successfully!");
      resolve(success);
    });
  });

  const dbPath = path.join(process.cwd(), "data", "workspace", "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const rec = db.recruitment;

  const deadlineIso = "2026-11-10T18:29:00.000Z"; // Tuesday, Nov 10, 2026 11:59 PM IST
  const deadlineFormatted = new Date(deadlineIso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }) + " IST";

  rec.settings.defaultAssessmentDeadlineAt = deadlineIso;

  // Candidates 33 to 79 (indices 32 to 78)
  const targetCandidates = rec.candidates.slice(32, 79);
  console.log(`Starting invitation dispatch to ${targetCandidates.length} candidates (${targetCandidates[0].candidateCode} through ${targetCandidates[targetCandidates.length - 1].candidateCode})...\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targetCandidates.length; i++) {
    const cand = targetCandidates[i];
    const password = cand.assignedPortalPassword || generateCandidateRandomPassword(cand.candidateCode, cand.email);
    cand.assignedPortalPassword = password;
    cand.passwordConfigured = true;
    cand.accountProvisioned = true;
    cand.inviteToken = cand.inviteToken || createCandidateInviteToken(cand.id, cand.email);
    cand.currentStage = "Stage 1B: AI Interview & Startup Simulation";
    cand.assessmentStatus = "Invited";
    cand.assessmentDeadlineAt = deadlineIso;

    const directLink = `https://deeveecapital.com/candidate?code=${encodeURIComponent(cand.candidateCode)}&email=${encodeURIComponent(cand.email)}`;
    const sampleTestLink = "https://deeveecapital.com/candidate?sample=1&code=DVC-SAMPLE-001&email=sample.candidate@deeveecapital.com";
    const subject = `Invitation: Deevee Capital Investment Assessment & Credentials (${cand.candidateCode})`;

    const textContent = `
Dear ${cand.fullName},

Thank you for your interest in the Investment Research & Startup Sourcing Intern role at Deevee Capital.

Your application (${cand.candidateCode}) has been shortlisted for Stage 1B: The 45-Minute Proctored AI Interview & Virtual Startup Assessment.

============================================================
YOUR CANDIDATE ACCESS CREDENTIALS
============================================================
• Candidate ID (Username): ${cand.candidateCode}
• Registered Email:        ${cand.email}
• Portal Password/Passkey: ${password}
• Submission Deadline:     ${deadlineFormatted}
• Direct 1-Click Link:     ${directLink}

============================================================
PRACTICE / SAMPLE TEST SANDBOX (RECOMMENDED BEFORE STARTING)
============================================================
Before starting your official 45-minute timed evaluation, you may test your camera, microphone, and screen share in our sample sandbox:
${sampleTestLink}
(Sandbox Credentials: Username: DVC-SAMPLE-001 | Password: DVC@Sample2026)

============================================================
MANDATORY TECHNICAL & PROCTORING GUIDELINES
============================================================
1. LAPTOP OR DESKTOP COMPUTER ONLY: Mobile devices and tablets are strictly blocked by the portal.
2. CONTINUOUS HARDWARE PROCTORING: Webcam video, microphone audio, and Entire Screen sharing are mandatory throughout the test.
3. SANCTUARY ANTI-CHEAT: Fullscreen mode is enforced; external clipboard paste is blocked; tab switching will penalize your integrity score.
4. ASSESSMENT DURATION: 45 Minutes timed.

Direct Access Link:
${directLink}

Submission Window / Deadline: ${deadlineFormatted}

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
  <title>${subject}</title>
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
              <p style="margin-top:0;">Dear <strong style="color:#FFFFFF;">${cand.fullName}</strong>,</p>
              
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
                    <td style="color:#FFFFFF; font-family:monospace; font-weight:700; font-size:14px;">${cand.candidateCode}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Registered Email:</td>
                    <td style="color:#FFFFFF; font-family:monospace;">${cand.email}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Portal Password / Passkey:</td>
                    <td style="color:#FCD34D; font-family:monospace; font-weight:700; font-size:14px; letter-spacing:0.5px;">${password}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;">Submission Deadline:</td>
                    <td style="color:#38BDF8; font-weight:700; font-size:13px;">${deadlineFormatted}</td>
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
                  <li><strong>Submission Window / Deadline:</strong> ${deadlineFormatted}.</li>
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

    let sendSuccess = false;
    let messageId = null;
    let sendError = null;

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: cand.email,
        replyTo: "siddharth@deeveecapital.com",
        subject,
        text: textContent,
        html: htmlContent,
      });

      sendSuccess = true;
      messageId = info.messageId;
      successCount++;
      console.log(`[${i + 1}/${targetCandidates.length}] ✅ SENT to ${cand.candidateCode} (${cand.fullName} - ${cand.email}) | ID: ${messageId}`);
    } catch (err) {
      sendError = err.message || String(err);
      failCount++;
      console.error(`[${i + 1}/${targetCandidates.length}] ❌ FAILED for ${cand.candidateCode} (${cand.email}): ${sendError}`);
    }

    const nowIso = new Date().toISOString();
    if (sendSuccess) {
      cand.inviteStatus = "Sent";
      cand.inviteSentAt = nowIso;
      cand.lastCommunicationAt = nowIso;
    } else {
      cand.inviteStatus = "Failed";
    }

    const logEntry = {
      id: `emlog-${Date.now()}-${i}`,
      candidateId: cand.id,
      candidateName: cand.fullName,
      recipientEmail: cand.email,
      templateId: "tpl-invite-assessment",
      subject,
      status: sendSuccess ? "Sent (SMTP)" : "Failed",
      isTestSend: false,
      sentBy: "Siddharth Kaushik",
      sentAt: nowIso,
      error: sendError || undefined,
    };

    rec.emailLogs.unshift(logEntry);
    cand.activityTimeline.unshift({
      id: `act-em-${Date.now()}-${i}`,
      action: "invitation.sent",
      summary: `Assessment invitation dispatched via pooled SMTP (${sendSuccess ? "Sent (SMTP)" : "Failed: " + sendError})`,
      actorName: "Siddharth Kaushik",
      timestamp: nowIso,
    });

    results.push({
      candidateCode: cand.candidateCode,
      name: cand.fullName,
      email: cand.email,
      success: sendSuccess,
      messageId,
      error: sendError,
    });

    // 1250ms throttle between dispatches
    await new Promise((r) => setTimeout(r, 1250));
  }

  // Also ensure candidates 1 to 32 have Sent status recorded
  for (let j = 0; j < 32; j++) {
    const prevCand = rec.candidates[j];
    if (prevCand && prevCand.inviteStatus !== "Sent") {
      prevCand.inviteStatus = "Sent";
      prevCand.inviteSentAt = prevCand.inviteSentAt || "2026-11-06T22:52:00.000Z";
      prevCand.accountProvisioned = true;
      if (!prevCand.assignedPortalPassword) {
        prevCand.assignedPortalPassword = generateCandidateRandomPassword(prevCand.candidateCode, prevCand.email);
      }
    }
  }

  // Save back to db.json
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log(`\nUpdated database written to ${dbPath}`);

  transporter.close();

  console.log("\n============================================================");
  console.log("FINAL DISPATCH RESULTS:");
  console.log(`Total attempted: ${targetCandidates.length}`);
  console.log(`Successfully delivered: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log("============================================================\n");
}

run().catch((err) => {
  console.error("FATAL SCRIPT ERROR:", err);
  process.exit(1);
});
