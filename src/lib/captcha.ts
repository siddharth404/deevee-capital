import crypto from "crypto";

const CAPTCHA_SECRET =
  process.env.ADMIN_API_SECRET ||
  process.env.CAPTCHA_SECRET ||
  "deevee-capital-secure-captcha-salt-98124";

// Token replay prevention cache (10 minute expiry)
const usedCaptchaIds = new Set<string>();

export interface CaptchaChallenge {
  id: string;
  token: string;
  svg: string;
  prompt: string;
}

/**
 * Generate a mathematical security challenge rendered as a brand-styled SVG
 */
export function generateCaptchaChallenge(): CaptchaChallenge {
  const id = crypto.randomBytes(8).toString("hex");
  const a = Math.floor(Math.random() * 20) + 7; // 7 to 26
  const b = Math.floor(Math.random() * 15) + 3; // 3 to 17
  const answer = String(a + b);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Compute HMAC signature for the answer
  const sig = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(`${id}:${answer}:${expiresAt}`)
    .digest("hex");

  const payload = {
    id,
    expiresAt,
    sig,
  };

  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  // Generate SVG with subtle noise & brand styling
  const svgText = `${a} + ${b} = ?`;
  
  // Random security line coordinates
  const l1y = Math.floor(Math.random() * 20) + 10;
  const l2y = Math.floor(Math.random() * 20) + 15;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="130" height="42" viewBox="0 0 130 42" style="background:#101A24; border-radius:2px; user-select:none;">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C6AD7A" />
          <stop offset="100%" stop-color="#E5D3AF" />
        </linearGradient>
      </defs>
      <!-- Background subtle grid -->
      <line x1="0" y1="14" x2="130" y2="14" stroke="#1A2836" stroke-width="1" />
      <line x1="0" y1="28" x2="130" y2="28" stroke="#1A2836" stroke-width="1" />
      <!-- Noise security lines -->
      <line x1="5" y1="${l1y}" x2="125" y2="${38 - l1y}" stroke="#3A4A58" stroke-width="1.2" stroke-dasharray="3,3" />
      <line x1="10" y1="${l2y}" x2="120" y2="${l1y}" stroke="#4D3F28" stroke-width="0.8" />
      <!-- Math Question Text -->
      <text x="65" y="27" font-family="Georgia, serif" font-size="19" font-weight="600" fill="url(#g)" text-anchor="middle" letter-spacing="2">
        ${svgText}
      </text>
    </svg>
  `.trim();

  return {
    id,
    token,
    svg: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    prompt: `Security verification: calculate ${a} + ${b}`,
  };
}

/**
 * Deterministic client-challenge checksum so instant challenges cannot be forged without solving a + b
 */
export function computeInstantChecksum(id: string, a: number, b: number, expiresAt: number): string {
  const raw = `${id}:${a}:${b}:${expiresAt}:dvc-instant-v1`;
  let h1 = 0xdeadbeef ^ raw.length;
  let h2 = 0x41c6ce57 ^ raw.length;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

/**
 * Verify a user's answer against the signed captcha token
 */
export function verifyCaptcha(token: string | undefined, answer: string | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!token || !answer) {
    return { valid: false, error: "Please complete the security verification challenge." };
  }

  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(raw);

    if (!payload.id || !payload.expiresAt) {
      return { valid: false, error: "Invalid security verification token." };
    }

    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: "Security code expired. Please click refresh for a new code." };
    }

    if (usedCaptchaIds.has(payload.id)) {
      return { valid: false, error: "Security code already used. Please refresh for a new code." };
    }

    const cleanAnswer = answer.trim();

    // Branch 1: Instant client-initialized challenge token
    if (payload.mode === "instant" && typeof payload.a === "number" && typeof payload.b === "number" && typeof payload.chk === "string") {
      if (payload.a < 2 || payload.a > 50 || payload.b < 2 || payload.b > 50) {
        return { valid: false, error: "Invalid security challenge parameters." };
      }
      const expectedChk = computeInstantChecksum(payload.id, payload.a, payload.b, payload.expiresAt);
      if (payload.chk !== expectedChk) {
        return { valid: false, error: "Invalid security verification token." };
      }
      if (cleanAnswer === String(payload.a + payload.b)) {
        usedCaptchaIds.add(payload.id);
        if (usedCaptchaIds.size > 1000) {
          const first = usedCaptchaIds.values().next().value;
          if (first) usedCaptchaIds.delete(first);
        }
        return { valid: true };
      } else {
        return { valid: false, error: "Incorrect security code. Please try again." };
      }
    }

    // Branch 2: Server HMAC-signed challenge token
    if (!payload.sig) {
      return { valid: false, error: "Invalid security verification token." };
    }

    const expectedSig = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(`${payload.id}:${cleanAnswer}:${payload.expiresAt}`)
      .digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(payload.sig, "hex"), Buffer.from(expectedSig, "hex"))) {
      usedCaptchaIds.add(payload.id);
      if (usedCaptchaIds.size > 1000) {
        const first = usedCaptchaIds.values().next().value;
        if (first) usedCaptchaIds.delete(first);
      }
      return { valid: true };
    } else {
      return { valid: false, error: "Incorrect security code. Please try again." };
    }
  } catch {
    return { valid: false, error: "Security verification failed. Please try again." };
  }
}
