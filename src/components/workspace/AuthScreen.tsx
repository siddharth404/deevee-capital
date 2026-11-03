"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  UserPlus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles,
} from "lucide-react";
import { UserRole } from "@/lib/workspace/types";

interface DemoAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  accessScope: string;
  title?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accessScope: string;
  inviteCode: string;
  invitedByName: string;
  expiresAt: string;
}

interface AuthScreenProps {
  availableAccounts?: DemoAccount[];
  pendingInvitations: PendingInvite[];
  onAuthenticated: () => void;
}

export function AuthScreen({
  pendingInvitations,
  onAuthenticated,
}: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "invite" | "bootstrap">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(
    pendingInvitations[0]?.inviteCode || ""
  );
  const [inviteName, setInviteName] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [bootstrapEmail, setBootstrapEmail] = useState("siddharth@deeveecapital.com");
  const [bootstrapName, setBootstrapName] = useState("Siddharth Kaushik");
  const [bootstrapPassword, setBootstrapPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workspace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Authentication failed.");
      } else {
        onAuthenticated();
      }
    } catch {
      setError("Network error while signing in.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workspace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept_invitation",
          inviteCode,
          name: inviteName,
          password: invitePassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Failed to accept invitation.");
      } else {
        onAuthenticated();
      }
    } catch {
      setError("Network error while accepting invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/workspace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bootstrap_admin",
          adminSecret,
          email: bootstrapEmail,
          name: bootstrapName,
          password: bootstrapPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Bootstrap failed.");
      } else {
        setMessage("Super Admin credentials updated. Redirecting...");
        onAuthenticated();
      }
    } catch {
      setError("Network error during bootstrap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D151E] text-[#F7F5F0] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#C6AD7A] text-[#101A24] flex items-center justify-center font-serif font-bold text-lg">
            D
          </div>
          <div>
            <span className="font-serif tracking-widest text-sm uppercase font-semibold text-white">
              DEEVEE CAPITAL
            </span>
            <span className="block text-[11px] font-mono text-[#C6AD7A] uppercase tracking-wider">
              Internal Investment &amp; Research OS
            </span>
          </div>
        </div>
        <a
          href="/"
          className="text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-[#C6AD7A] transition-colors"
        >
          &larr; Public Website (deeveecapital.com)
        </a>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Authentication & Invitation Onboarding */}
        <div className="lg:col-span-6 bg-[#131F2C] border border-white/15 rounded-lg p-7 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`px-3.5 py-2 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === "login"
                  ? "bg-[#C6AD7A] text-[#101A24] font-semibold"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Team Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("invite");
                setError("");
              }}
              className={`px-3.5 py-2 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === "invite"
                  ? "bg-[#C6AD7A] text-[#101A24] font-semibold"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Accept Invitation
              {pendingInvitations.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {pendingInvitations.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("bootstrap");
                setError("");
              }}
              className={`px-3.5 py-2 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === "bootstrap"
                  ? "bg-[#C6AD7A] text-[#101A24] font-semibold"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Admin Bootstrap
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-3.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h1 className="text-xl font-serif font-semibold text-white">
                  Sign in to Deevee Capital Workspace
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Authorised access only. Public signup is disabled; accounts require a Super Admin invitation.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#0D151E] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C6AD7A]"
                  placeholder="name@deeveecapital.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#0D151E] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C6AD7A]"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded bg-[#C6AD7A] hover:bg-[#d4bc8b] text-[#101A24] font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === "invite" && (
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div>
                <h2 className="text-xl font-serif font-semibold text-white">
                  Complete Team Invitation Setup
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the invitation code issued by your Super Admin to activate your account and role permissions.
                </p>
              </div>

              {pendingInvitations.length > 0 && (
                <div className="p-3 rounded bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#C6AD7A] block">
                    Active Pending Invitations (Click to autofill):
                  </span>
                  {pendingInvitations.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => {
                        setInviteCode(inv.inviteCode);
                        setInviteName(inv.name);
                      }}
                      className="w-full text-left p-2 rounded bg-[#0D151E] hover:border-[#C6AD7A] border border-white/10 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-white">{inv.name}</span>{" "}
                        <span className="text-slate-400">({inv.email})</span>
                      </div>
                      <span className="font-mono text-[#C6AD7A]">{inv.inviteCode}</span>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Invitation Code *
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#0D151E] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#C6AD7A]"
                  placeholder="DVC-INV-XXXXXX"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#0D151E] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C6AD7A]"
                  placeholder="Confirm your display name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Set Account Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#0D151E] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C6AD7A]"
                  placeholder="Create a strong password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded bg-[#C6AD7A] hover:bg-[#d4bc8b] text-[#101A24] font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? "Activating Account..." : "Activate Account & Enter Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === "bootstrap" && (
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div>
                <h2 className="text-xl font-serif font-semibold text-white">
                  Initial Super Admin Bootstrap
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Requires the server-side <code className="text-[#C6AD7A]">ADMIN_API_SECRET</code> environment variable to provision or reset the root Super Admin account.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  ADMIN_API_SECRET Token *
                </label>
                <input
                  type="password"
                  required
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#0D151E] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#C6AD7A]"
                  placeholder="Enter ADMIN_API_SECRET from .env"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Super Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={bootstrapEmail}
                    onChange={(e) => setBootstrapEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#0D151E] border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bootstrapName}
                    onChange={(e) => setBootstrapName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#0D151E] border border-white/15 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  New Super Admin Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#0D151E] border border-white/15 text-sm text-white"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded bg-[#C6AD7A] hover:bg-[#d4bc8b] text-[#101A24] font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? "Bootstrapping..." : "Verify Secret & Bootstrap Super Admin"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Institutional Operating System Overview */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#131F2C]/80 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-2 text-[#C6AD7A] text-xs font-mono uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Private Investment Operating System</span>
            </div>
            <h2 className="text-lg font-serif font-semibold text-white">
              Startup Deal Flow, Diligence &amp; Team Collaboration
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              This workspace is restricted to authorised Deevee Capital partners, investment leads, reviewers, and research analysts. All actions are logged to an immutable audit ledger.
            </p>

            <div className="mt-5 space-y-3">
              <div className="p-3.5 rounded bg-[#0D151E] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">
                    1. Unified Deal Flow &amp; Website Intake
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C6AD7A]/15 text-[#C6AD7A]">
                    CRM
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Inbound founder submissions from deeveecapital.com and intern-discovered startups flow into a single pipeline with automatic duplicate detection.
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#0D151E] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">
                    2. Cited 9-Section Diligence &amp; Review Workflow
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">
                    RESEARCH
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces source citations, bottom-up TAM calculation methodology, 4-tier financial data classification, and multi-analyst peer review.
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#0D151E] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">
                    3. 10-Dimension Scorecard &amp; Investment Decisions
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                    DECISIONS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Structured sector-agnostic evaluation framework and human-confirmed investment committee decision ledger.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#131F2C]/50 border border-white/10 rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-[#C6AD7A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Sector-Agnostic Mandate</strong>
                <span className="text-slate-400">
                  Evaluates opportunities across all industries up to ₹1 Crore per startup without predetermined sector filters.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C6AD7A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Live Website Integration</strong>
                <span className="text-slate-400">
                  Connected directly to the public founder pitch form at deeveecapital.com (#pitch-form).
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Deevee Capital &bull; Internal Investment Operations &amp; Research Platform
      </footer>
    </div>
  );
}
