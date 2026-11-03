"use client";

/**
 * SECTION 5: ABOUT DEEVEE CAPITAL
 * Headline: "Curious about what comes next."
 * Carefully explains that Deevee Capital is exploring promising early-stage businesses
 * and building relationships with entrepreneurs, noting its entrepreneurial business
 * background associated with Dee Vee Projects Limited without implying a regulated
 * investment fund or guaranteed capital.
 */

import React from "react";
import { Building2, Handshake, ShieldAlert } from "lucide-react";
import { siteConfig } from "@/config/site";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative scroll-mt-20 overflow-hidden border-b border-navy/12 bg-ivory py-20 md:py-28 lg:py-32"
    >
      {/* 21st.dev DotPattern Subtle Architectural Texture */}
      <DotPattern
        width={28}
        height={28}
        cr={0.8}
        className="opacity-45 [mask-image:radial-gradient(650px_circle_at_80%_30%,white,transparent)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left 5 Columns: Section Title & Architectural Heritage Card */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <ScrollReveal>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-[0.22em] text-gold">
                  {siteConfig.about.index}
                </span>
                <span
                  aria-hidden="true"
                  className="h-[1px] w-8 bg-navy/25"
                />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate">
                  {siteConfig.about.eyebrow}
                </span>
              </div>

              <h2
                id="about-heading"
                className="mt-4 font-serif text-4xl font-normal leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-[54px]"
              >
                {siteConfig.about.headline}
              </h2>

              <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-slate">
                EMERGING INITIATIVE · LONG-TERM PERSPECTIVE
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="mt-10 border border-navy/15 bg-white p-7 sm:p-8">
                <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
                  <Building2
                    className="h-4 w-4 text-gold"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-navy">
                    ENTREPRENEURIAL HERITAGE
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-charcoal/85">
                  Associated with the entrepreneurial business background of{" "}
                  <a
                    href={siteConfig.associatedEntity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-navy underline decoration-gold underline-offset-4 hover:text-slate"
                  >
                    {siteConfig.associatedEntity.name}
                  </a>{" "}
                  (
                  <a
                    href={siteConfig.associatedEntity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-slate hover:text-navy"
                  >
                    dvplindia.in
                  </a>
                  )
                  —bringing respect for real-world execution, operational rigor,
                  and patient company-building to early-stage conversations.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right 7 Columns: Editorial Narrative & Transparent Institutional Boundary */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <ScrollReveal delay={0.1}>
              <div className="space-y-6 border-l border-navy/15 pl-6 sm:pl-10">
                {siteConfig.about.paragraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "font-serif text-2xl leading-relaxed text-navy sm:text-3xl"
                        : "text-base leading-relaxed text-charcoal/85 sm:text-lg"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollReveal>

            {/* Two Key Principles Row */}
            <ScrollReveal delay={0.2}>
              <div className="mt-10 grid grid-cols-1 gap-6 border-t border-navy/12 pt-8 sm:grid-cols-2">
                <div className="border border-navy/12 bg-white/80 p-6">
                  <div className="flex items-center gap-2.5">
                    <Handshake
                      className="h-4 w-4 text-gold"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy">
                      Relationship-Driven
                    </h3>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate">
                    We value candid, direct conversations with founders who are
                    deeply committed to their craft and customers.
                  </p>
                </div>

                <div className="border border-navy/12 bg-white/80 p-6">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert
                      className="h-4 w-4 text-gold"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy">
                      Clear &amp; Transparent Scope
                    </h3>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate">
                    We state plainly what we are: an emerging initiative
                    exploring early-stage opportunities—without overstated claims.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Important Information Box */}
            <ScrollReveal delay={0.28}>
              <div
                role="note"
                aria-label="Important Information"
                className="mt-8 border border-navy/15 bg-navy/[0.03] p-5 sm:p-6"
              >
                <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-navy">
                  Important Information
                </p>
                <p className="text-xs leading-relaxed text-charcoal/75">
                  {siteConfig.about.regulatoryNote}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
