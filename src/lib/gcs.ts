import fs from "fs/promises";
import path from "path";

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "deeveecapital-site-vault";

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

/**
 * Uploads a buffer to Google Cloud Storage or falls back to local storage
 */
export async function uploadPitchAttachment(
  filename: string,
  buffer: Buffer,
  contentType = "application/pdf"
): Promise<{ url: string; storageType: "gcs" | "local" }> {
  const token = await getGcpAccessToken();

  if (token) {
    try {
      const sanitizedName = encodeURIComponent(filename.replace(/[^a-zA-Z0-9._-]/g, "_"));
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=pitches/${sanitizedName}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType,
        },
        body: new Uint8Array(buffer),
      });

      if (res.ok) {
        const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/pitches/${sanitizedName}`;
        console.log(`[Storage] Uploaded ${filename} to GCS bucket ${BUCKET_NAME}`);
        return { url: publicUrl, storageType: "gcs" };
      } else {
        const err = await res.text();
        console.warn(`[Storage] GCS upload HTTP ${res.status}: ${err}`);
      }
    } catch (gcsErr) {
      console.warn("[Storage] GCS upload error, falling back to local:", gcsErr);
    }
  }

  // Local fallback for local dev or when GCS is unreachable
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pitches");
  await fs.mkdir(uploadsDir, { recursive: true });
  const sanitizedName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const localPath = path.join(uploadsDir, sanitizedName);
  await fs.writeFile(localPath, buffer);
  const localUrl = `/uploads/pitches/${sanitizedName}`;
  console.log(`[Storage] Saved ${filename} locally to ${localUrl}`);
  return { url: localUrl, storageType: "local" };
}
