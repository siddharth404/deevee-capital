import { NextRequest, NextResponse } from "next/server";
import { getPitchAttachmentBuffer, verifySignedDownloadToken } from "@/lib/gcs";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");
  const exp = searchParams.get("exp");
  const sig = searchParams.get("sig");

  if (!file || typeof file !== "string") {
    return NextResponse.json({ ok: false, error: "missing_filename" }, { status: 400 });
  }

  // Prevent directory traversal
  const sanitized = file.replace(/(\.\.[\/\\])+/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");

  // Enforce cryptographic signature & expiration so uploaded files are never publicly accessible
  if (!verifySignedDownloadToken(sanitized, exp, sig)) {
    return NextResponse.json(
      { ok: false, error: "forbidden", message: "Access denied. Valid authorization signature required." },
      { status: 403 }
    );
  }

  const buffer = await getPitchAttachmentBuffer(sanitized);

  if (!buffer) {
    return NextResponse.json({ ok: false, error: "not_found", message: "File not found or expired." }, { status: 404 });
  }

  const isPdf = sanitized.toLowerCase().endsWith(".pdf");
  const contentType = isPdf ? "application/pdf" : "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${sanitized}"`,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
