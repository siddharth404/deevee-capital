"use client";

/**
 * SECTION 2: HERO
 * Uses 21st.dev @kokonutd/components/background-paths, @educalvolpz/components/soft-blur-in,
 * and @dillionverma/components/interactive-hover-button alongside a bespoke architectural
 * venture compass focal piece.
 */

import React from "react";
import { ArrowDownRight, Compass, Layers, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { BackgroundPathsOverlay } from "@/components/ui/background-paths";
import { SoftBlurIn } from "@/components/ui/soft-blur-in";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function HeroSection() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-navy/12 bg-ivory pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32"
    >
      {/* 21st.dev Subtle Animated Background Paths */}
      <BackgroundPathsOverlay variant="light" className="opacity-85" />

      {/* Subtle Architectural Grid Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mx-auto max-w-7xl border-x border-navy/[0.06]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Editorial Headline, Supporting Copy & Dual CTAs */}
          <div className="lg:col-span-7">
            <ScrollReveal immediate>
              <div className="inline-flex items-center gap-3 border border-navy/15 bg-white px-3.5 py-1.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-gold"
                />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-navy">
                  {siteConfig.hero.eyebrow}
                </span>
              </div>
            </ScrollReveal>

            <h1
              id="hero-heading"
              className="mt-7 max-w-[16ch] font-serif text-[42px] font-normal leading-[1.06] tracking-[-0.02em] text-navy sm:text-6xl lg:text-[66px] xl:text-[72px]"
            >
              <SoftBlurIn
                mode="words"
                stagger={28}
                duration={0.48}
                triggerOnView={false}
              >
                {siteConfig.hero.headline}
              </SoftBlurIn>
            </h1>

            <ScrollReveal immediate delay={0.12}>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-charcoal/85 sm:text-xl md:leading-[1.65]">
                {siteConfig.hero.supportingCopy}
              </p>
            </ScrollReveal>

            {/* Primary & Secondary CTAs */}
            <ScrollReveal immediate delay={0.2}>
              <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <InteractiveHoverButton
                  text={siteConfig.hero.primaryCta.label}
                  href={siteConfig.hero.primaryCta.href}
                  variant="primary-dark"
                  iconType="up-right"
                  className="px-8 py-4 text-sm"
                />

                <a
                  href={siteConfig.hero.secondaryCta.href}
                  className="group inline-flex items-center justify-center gap-2.5 border border-navy/25 bg-ivory/90 px-7 py-4 text-sm font-medium tracking-wide text-navy transition-colors duration-300 hover:border-navy hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <span>{siteConfig.hero.secondaryCta.label}</span>
                  <ArrowDownRight
                    aria-hidden="true"
                    className="h-4 w-4 text-slate transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-navy"
                  />
                </a>
              </div>
            </ScrollReveal>

            {/* Editorial Orientation Strip */}
            <ScrollReveal immediate delay={0.26}>
              <div className="mt-14 grid grid-cols-1 gap-6 border-t border-navy/12 pt-8 sm:grid-cols-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate">
                    ORIENTATION
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-navy">
                    Early-Stage Discovery
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate">
                    PERSPECTIVE
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-navy">
                    Founder-First &amp; Patient
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate">
                    CONVERSATIONS
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-navy">
                    Direct Pitch Submissions
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Refined Visual Focal Point — Architectural Venture Horizon */}
          <div className="lg:col-span-5">
            <ScrollReveal immediate delay={0.16}>
              <div className="relative border border-navy/15 bg-navy p-7 text-ivory shadow-[0_24px_60px_-20px_rgba(16,26,36,0.28)] sm:p-9">
                {/* Corner Architectural Hairline Accents */}
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-3 h-3 w-3 border-t border-l border-gold/60"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-3 right-3 h-3 w-3 border-t border-r border-gold/60"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-gold/60"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-3 bottom-3 h-3 w-3 border-r border-b border-gold/60"
                />

                {/* Top Header */}
                <div className="flex items-center justify-between border-b border-ivory/12 pb-4">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-gold">
                    DEEVEE CAPITAL // BRIEF
                  </span>
                  <span className="font-mono text-[11px] text-slate">
                    FIG. 01
                  </span>
                </div>

                {/* Abstract Architectural Geometric Illustration */}
                <div className="relative my-6 flex items-center justify-center overflow-hidden border border-ivory/12 bg-charcoal py-8">
                  <svg
                    role="img"
                    aria-label="Abstract geometric diagram illustrating how a founder's core insight expands into a scalable, enduring enterprise"
                    viewBox="0 0 360 190"
                    className="h-44 w-full max-w-[340px]"
                    fill="none"
                  >
                    {/* Fine grid coordinates */}
                    <line
                      x1="20"
                      y1="95"
                      x2="340"
                      y2="95"
                      stroke="#F7F5F0"
                      strokeOpacity="0.16"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="180"
                      y1="15"
                      x2="180"
                      y2="175"
                      stroke="#F7F5F0"
                      strokeOpacity="0.16"
                      strokeDasharray="3 3"
                    />

                    {/* Concentric compounding rings */}
                    <circle
                      cx="180"
                      cy="95"
                      r="72"
                      stroke="#F7F5F0"
                      strokeOpacity="0.2"
                      strokeWidth="1"
                    />
                    <circle
                      cx="180"
                      cy="95"
                      r="50"
                      stroke="#C6AD7A"
                      strokeOpacity="0.45"
                      strokeWidth="1"
                    />
                    <circle
                      cx="180"
                      cy="95"
                      r="28"
                      stroke="#C6AD7A"
                      strokeOpacity="0.82"
                      strokeWidth="1.35"
                    />

                    {/* Architectural trajectory arc */}
                    <path
                      d="M 45 148 Q 145 140 180 95 T 315 36"
                      stroke="#C6AD7A"
                      strokeWidth="1.75"
                      fill="none"
                    />

                    {/* Key milestone nodes */}
                    <circle cx="82" cy="138" r="3.5" fill="#F7F5F0" />
                    <circle cx="180" cy="95" r="5.5" fill="#C6AD7A" />
                    <circle cx="282" cy="52" r="4" fill="#F7F5F0" />

                    {/* Labels */}
                    <text
                      x="48"
                      y="164"
                      fill="#77818B"
                      fontSize="8"
                      fontFamily="monospace"
                      letterSpacing="1.5"
                    >
                      01. INSIGHT
                    </text>
                    <text
                      x="146"
                      y="116"
                      fill="#C6AD7A"
                      fontSize="8"
                      fontFamily="monospace"
                      letterSpacing="1.5"
                    >
                      02. CONVICTION
                    </text>
                    <text
                      x="248"
                      y="34"
                      fill="#F7F5F0"
                      fontSize="8"
                      fontFamily="monospace"
                      letterSpacing="1.5"
                    >
                      03. SCALE
                    </text>
                  </svg>
                </div>

                {/* Three Pillar Notes Inside the Focal Card */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 border-b border-ivory/10 pb-3.5">
                    <Compass
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory">
                        Curiosity First
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ivory/70">
                        We listen to how founders define the problem before
                        applying any predetermined lens.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 border-b border-ivory/10 pb-3.5">
                    <Layers
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory">
                        Real-World Grounding
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ivory/70">
                        Informed by an entrepreneurial business background that
                        values durable fundamentals.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Sparkles
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory">
                        Open Door for Founders
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ivory/70">
                        No warm introduction required. Share what you are
                        building directly through our submission form.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
