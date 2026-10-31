"use client";

/**
 * 21st.dev Component: @efferd/components/cta-3
 * Source: https://21st.dev/@efferd/components/cta-3
 * Adapted for Deevee Capital Section 6: Founder Call to Action, featuring
 * architectural corner Plus crosshairs, extended drafting hairlines, and direct scroll to pitch form.
 */

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export interface ArchitecturalCtaProps {
  index?: string;
  eyebrow: string;
  headline: string;
  supportingCopy: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryNote?: string;
  className?: string;
}

export function ArchitecturalCta({
  index = "04",
  eyebrow,
  headline,
  supportingCopy,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryNote = "Takes 3 minutes · Direct founder-to-team review",
  className,
}: ArchitecturalCtaProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-5xl flex-col justify-between gap-y-8 border-y border-gold/30 bg-[radial-gradient(45%_85%_at_50%_0%,rgba(198,173,122,0.14),transparent)] px-6 py-14 md:px-14 md:py-20",
        className
      )}
    >
      {/* 21st.dev Corner Crosshairs */}
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute top-[-12px] left-[-12px] z-10 h-6 w-6 text-gold"
        strokeWidth={1}
      />
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute top-[-12px] right-[-12px] z-10 h-6 w-6 text-gold"
        strokeWidth={1}
      />
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-12px] left-[-12px] z-10 h-6 w-6 text-gold"
        strokeWidth={1}
      />
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12px] bottom-[-12px] z-10 h-6 w-6 text-gold"
        strokeWidth={1}
      />

      {/* Extended Vertical Architectural Drafting Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none -inset-y-8 absolute left-0 w-px border-l border-gold/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none -inset-y-8 absolute right-0 w-px border-r border-gold/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-full border-l border-dashed border-ivory/[0.06]"
      />

      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <div className="inline-flex items-center gap-2.5 border border-gold/30 bg-navy/80 px-3.5 py-1.5">
          <span className="font-mono text-[11px] tracking-[0.22em] text-gold">
            {index} // {eyebrow}
          </span>
        </div>

        <h2 className="font-serif text-4xl font-normal leading-[1.12] tracking-tight text-ivory sm:text-5xl md:text-6xl">
          {headline}
        </h2>

        <p className="mx-auto max-w-xl text-base leading-relaxed text-ivory/80 md:text-lg">
          {supportingCopy}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 pt-2">
        <InteractiveHoverButton
          text={primaryCtaLabel}
          href={primaryCtaHref}
          variant="primary-gold"
          iconType="right"
          className="min-w-[230px]"
        />
        {secondaryNote && (
          <p className="font-mono text-xs tracking-[0.14em] text-slate">
            {secondaryNote}
          </p>
        )}
      </div>
    </div>
  );
}
