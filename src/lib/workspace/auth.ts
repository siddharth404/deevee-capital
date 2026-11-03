/**
 * DEEVEE CAPITAL — WORKSPACE AUTHENTICATION & AUTHORIZATION ENGINE
 * Enforces cryptographic session tokens, Firebase ID token verification (when enabled),
 * account status checks (active vs. deactivated), and server-side RBAC.
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getWorkspaceDb } from "./db";
import { hasPermission } from "./permissions";
import { PermissionKey, WorkspaceUser } from "./types";

export const SESSION_COOKIE_NAME = "dvc_workspace_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSessionSecret(): string {
  return (
    process.env.ADMIN_API_SECRET ||
    process.env.WORKSPACE_SESSION_SECRET ||
    "deevee-capital-workspace-hmac-secret-2026-sovereign"
  );
}

export function createSignedSessionToken(userId: string, ttlMs = SESSION_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = `${userId}.${exp}`;
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

export function verifySignedSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  if (!userId || !expStr || !sig) return null;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(`${userId}.${expStr}`)
    .digest("hex");

  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;
    return userId;
  } catch {
    return null;
  }
}

export function sanitizeUserForClient(user: WorkspaceUser): Omit<WorkspaceUser, "passwordHash"> {
  const { passwordHash: _removed, ...safeUser } = user;
  return safeUser;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<WorkspaceUser | null> {
  const db = await getWorkspaceDb();

  // 1. Check Authorization Bearer header (supports Firebase ID Token or signed token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();

    if (isFirebaseAdminConfigured()) {
      const adminAuth = getFirebaseAdminAuth();
      if (adminAuth) {
        try {
          const decoded = await adminAuth.verifyIdToken(bearerToken);
          const user = db.users.find(
            (u) =>
              u.uid === decoded.uid ||
              (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
          );
          if (user && user.status === "active") {
            return user;
          }
        } catch {
          // Fall through to HMAC token verification
        }
      }
    }

    const verifiedUserId = verifySignedSessionToken(bearerToken);
    if (verifiedUserId) {
      const user = db.users.find((u) => u.id === verifiedUserId);
      if (user && user.status === "active") {
        return user;
      }
    }
  }

  // 2. Check HTTP-only cookie
  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    const verifiedUserId = verifySignedSessionToken(cookieToken);
    if (verifiedUserId) {
      const user = db.users.find((u) => u.id === verifiedUserId);
      if (user && user.status === "active") {
        return user;
      }
    }
  }

  return null;
}

export async function requireAuthenticatedUser(
  request: NextRequest,
  requiredPermission?: PermissionKey
): Promise<
  | { ok: true; user: WorkspaceUser }
  | { ok: false; response: NextResponse }
> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "unauthenticated",
          message: "Authentication required. Please sign in to the Deevee Capital workspace.",
        },
        { status: 401 }
      ),
    };
  }

  if (user.status !== "active") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "account_deactivated",
          message: "Your workspace account has been deactivated. Contact the Super Admin.",
        },
        { status: 403 }
      ),
    };
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "forbidden",
          message: `Insufficient permissions. Required permission: '${requiredPermission}'.`,
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}
