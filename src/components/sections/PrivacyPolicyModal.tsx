"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ open, onClose }: PrivacyPolicyModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-gold/40 bg-ivory p-6 text-charcoal shadow-2xl sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-navy/15 pb-5">
          <div className="flex items-center gap-3">
            <ShieldCheck
              className="h-5 w-5 text-navy"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
                DEEVEE CAPITAL // LEGAL &amp; PRIVACY
              </p>
              <h2
                id="privacy-modal-title"
                className="mt-1 font-serif text-2xl font-normal text-navy sm:text-3xl"
              >
                Privacy Policy &amp; Submission Terms
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close privacy policy dialog"
            className="inline-flex h-9 w-9 items-center justify-center border border-navy/20 bg-white text-navy transition-colors hover:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-charcoal/85">
          <p className="border-l-2 border-gold bg-white p-4 font-medium text-navy">
            {siteConfig.privacyPolicy.summary}
          </p>

          {siteConfig.privacyPolicy.sections.map((sec) => (
            <div key={sec.title} className="space-y-1.5">
              <h3 className="font-sans text-sm font-semibold text-navy">
                {sec.title}
              </h3>
              <p className="text-sm leading-relaxed text-charcoal/80">
                {sec.body}
              </p>
            </div>
          ))}

          <p className="border-t border-navy/12 pt-4 font-mono text-xs text-slate">
            Last updated: {siteConfig.privacyPolicy.lastUpdated}
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-navy bg-navy px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
