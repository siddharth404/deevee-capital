"use client";

/**
 * SECTION 3: INVESTMENT PHILOSOPHY
 * Headline: "Good businesses begin with the right questions."
 * Explains interest in understanding:
 * - The problem being solved.
 * - The founders and their insight.
 * - The potential market.
 * - The business model.
 * - The ability to execute and scale.
 */

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

export function PhilosophySection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const questions = siteConfig.philosophy.questions;

  return (
    <section
      id="our-approach"
      aria-labelledby="philosophy-heading"
      className="relative scroll-mt-20 border-b border-navy/12 bg-ivory py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="grid grid-cols-1 gap-8 border-b border-navy/12 pb-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-[0.22em] text-gold">
                  {siteConfig.philosophy.index}
                </span>
                <span
                  aria-hidden="true"
                  className="h-[1px] w-8 bg-navy/25"
                />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate">
                  {siteConfig.philosophy.eyebrow}
                </span>
              </div>
              <h2
                id="philosophy-heading"
                className="mt-4 font-serif text-4xl font-normal leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-[54px]"
              >
                {siteConfig.philosophy.headline}
              </h2>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-5">
            <ScrollReveal delay={0.1}>
              <p className="text-base leading-relaxed text-charcoal/80 md:text-[17px]">
                {siteConfig.philosophy.intro}
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Interactive Editorial Ledger of the 5 Core Dimensions */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 7 Cols: Numbered Interactive Rows */}
          <div className="divide-y divide-navy/12 border-y border-navy/12 lg:col-span-7">
            {questions.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={item.number}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    "relative transition-colors duration-300",
                    isActive
                      ? "border-l-2 border-l-gold bg-white"
                      : "border-l-2 border-l-transparent bg-transparent hover:bg-white/60"
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isActive}
                    onClick={() => setActiveIndex(idx)}
                    className="flex w-full items-start justify-between gap-4 px-5 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:px-7 sm:py-7"
                  >
                    <div className="flex items-start gap-5">
                      <span
                        className={cn(
                          "mt-1 font-mono text-xs tracking-[0.2em] transition-colors",
                          isActive ? " font-semibold text-gold" : "text-slate"
                        )}
                      >
                        {item.number}
                      </span>
                      <div>
                        <h3 className="font-serif text-2xl font-normal tracking-tight text-navy sm:text-[28px]">
                          {item.dimension}
                        </h3>
                        <p className="mt-1.5 text-sm font-medium text-charcoal/85 sm:text-base">
                          {item.question}
                        </p>
                        <p
                          className={cn(
                            "mt-3 text-sm leading-relaxed text-slate transition-opacity duration-300",
                            isActive ? "block" : "hidden sm:block"
                          )}
                        >
                          {item.elaboration}
                        </p>
                      </div>
                    </div>

                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1 flex h-8 w-8 shrink-0 items-center justify-center border transition-colors duration-300",
                        isActive
                          ? "border-navy bg-navy text-gold"
                          : "border-navy/15 text-slate"
                      )}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right 5 Cols: Active Inquiry Spotlight Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 flex h-full flex-col justify-between border border-navy/15 bg-charcoal p-8 text-ivory sm:p-10">
              <div>
                <div className="flex items-center justify-between border-b border-ivory/12 pb-4">
                  <span className="font-mono text-xs tracking-[0.2em] text-gold">
                    INQUIRY DIMENSION // {questions[activeIndex].number}
                  </span>
                  <span className="font-mono text-xs text-slate">
                    0{activeIndex + 1} OF 05
                  </span>
                </div>

                <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-gold">
                  {questions[activeIndex].dimension}
                </p>

                <blockquote className="mt-3 font-serif text-3xl font-normal leading-snug text-ivory sm:text-4xl">
                  &ldquo;{questions[activeIndex].question}&rdquo;
                </blockquote>

                <p className="mt-6 text-sm leading-relaxed text-ivory/75 sm:text-base">
                  {questions[activeIndex].elaboration}
                </p>
              </div>

              <div className="mt-10 border-t border-ivory/12 pt-6">
                <p className="text-xs leading-relaxed text-slate">
                  We do not rely on a rigid or predetermined investment thesis.
                  Every startup is evaluated on the clarity of its insight and
                  the strength of its fundamentals.
                </p>
                <a
                  href="#pitch-form"
                  className="mt-5 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-gold transition-colors hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span>Share your perspective with us</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
