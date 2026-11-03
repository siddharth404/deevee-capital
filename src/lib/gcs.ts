import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "deeveecapital-site-vault";
const DOWNLOAD_SECRET =
  process.env.ADMIN_API_SECRET ||
  process.env.CAPTCHA_SECRET ||
  "deevee-capital-private-vault-secret-98124";

/**
 * Create a cryptographically signed download URL for a private attachment
 */
export function createSignedDownloadUrl(
  filename: string,
  ttlMs = 7 * 24 * 60 * 60 * 1000 // Default 7 days
): string {
  const sanitized = filename.replace(/(\.\.[\/\\])+/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  const exp = String(Date.now() + ttlMs);
  const sig = crypto
    .createHmac("sha256", DOWNLOAD_SECRET)
    .update(`${sanitized}:${exp}`)
    .digest("hex");
  return `/api/pitch/download?file=${encodeURIComponent(sanitized)}&exp=${exp}&sig=${sig}`;
}

/**
 * Verify a signed download request
 */
export function verifySignedDownloadToken(
  filename: string,
  exp: string | null,
  sig: string | null
): boolean {
  if (!filename || !exp || !sig) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || Date.now() > expNum) return false;

  const sanitized = filename.replace(/(\.\.[\/\\])+/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  const expectedSig = crypto
    .createHmac("sha256", DOWNLOAD_SECRET)
    .update(`${sanitized}:${exp}`)
    .digest("hex");

  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Obtain GCP Access Token from Cloud Run metadata service if running on GCP
 */
async function getGcpAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        headers: { "Metadata-Flavor": "Google" },
        signal: AbortSignal.timeout(1500),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.access_token || null;
    }
  } catch {
    // Not running on GCP or metadata server not accessible
  }
  return null;
}

function getPrivateLocalUploadsDir(): string {
  return path.join(os.tmpdir(), "deevee-capital-private-vault", "pitches");
}

/**
 * Uploads a buffer to private Google Cloud Storage bucket or private local storage outside public/
 */
export async function uploadPitchAttachment(
  filename: string,
  buffer: Buffer,
  contentType = "application/pdf"
): Promise<{ url: string; storageType: "gcs" | "local"; sanitizedName: string }> {
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const token = await getGcpAccessToken();

  if (token) {
    try {
      const encodedName = encodeURIComponent(sanitizedName);
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=pitches/${encodedName}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType,
        },
        body: new Uint8Array(buffer),
      });

      if (res.ok) {
        const signedPath = createSignedDownloadUrl(sanitizedName, 30 * 24 * 60 * 60 * 1000);
        console.log(`[Storage] Uploaded ${sanitizedName} to private GCS bucket ${BUCKET_NAME}`);
        return { url: signedPath, storageType: "gcs", sanitizedName };
      } else {
        const err = await res.text();
        console.warn(`[Storage] GCS upload HTTP ${res.status}: ${err}`);
      }
    } catch (gcsErr) {
      console.warn("[Storage] GCS upload error, falling back to private local vault:", gcsErr);
    }
  }

  // Private local fallback outside public/ directory
  const uploadsDir = getPrivateLocalUploadsDir();
  await fs.mkdir(uploadsDir, { recursive: true, mode: 0o700 });
  const localPath = path.join(uploadsDir, sanitizedName);
  await fs.writeFile(localPath, buffer, { mode: 0o600 });
  const signedPath = createSignedDownloadUrl(sanitizedName, 30 * 24 * 60 * 60 * 1000);
  console.log(`[Storage] Saved ${sanitizedName} to private local vault`);
  return { url: signedPath, storageType: "local", sanitizedName };
}

/**
 * Retrieves an attachment buffer from private Google Cloud Storage or private local fallback
 */
export async function getPitchAttachmentBuffer(filename: string): Promise<Buffer | null> {
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const token = await getGcpAccessToken();

  if (token) {
    try {
      const encodedName = encodeURIComponent(sanitizedName);
      const getUrl = `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o/pitches%2F${encodedName}?alt=media`;

      const res = await fetch(getUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    } catch (err) {
      console.warn("[Storage] Failed to retrieve attachment from GCS:", err);
    }
  }

  // Private local fallback lookup
  try {
    const uploadsDir = getPrivateLocalUploadsDir();
    const files = await fs.readdir(uploadsDir);
    const match = files.find((f) => f === sanitizedName || f.endsWith(sanitizedName));
    if (match) {
      return await fs.readFile(path.join(uploadsDir, match));
    }
  } catch {
    // Ignore local lookup failure
  }

  return null;
}

