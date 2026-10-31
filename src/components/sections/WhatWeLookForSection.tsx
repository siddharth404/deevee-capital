"use client";

/**
 * SECTION 4: WHAT WE LOOK FOR
 * Uses adapted 21st.dev @efferd/components/grid-feature-cards (FeatureCard & GridPattern)
 * to present the four areas of interest with architectural precision.
 */

import React from "react";
import { Users, Compass, TrendingUp, Hourglass, Plus } from "lucide-react";
import { siteConfig } from "@/config/site";
import { FeatureCard, type GridFeatureItem } from "@/components/ui/grid-feature-cards";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const ICONS = [Users, Compass, TrendingUp, Hourglass];

export function WhatWeLookForSection() {
  const features: GridFeatureItem[] = siteConfig.whatWeLookFor.blocks.map(
    (block, idx) => ({
      ...block,
      icon: ICONS[idx % ICONS.length],
    })
  );

  return (
    <section
      id="what-we-look-for"
      aria-labelledby="look-for-heading"
      className="relative scroll-mt-20 border-b border-navy/12 bg-ivory py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Editorial Section Header */}
        <div className="grid grid-cols-1 gap-8 pb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-[0.22em] text-gold">
                  {siteConfig.whatWeLookFor.index}
                </span>
                <span
                  aria-hidden="true"
                  className="h-[1px] w-8 bg-navy/25"
                />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate">
                  {siteConfig.whatWeLookFor.eyebrow}
                </span>
              </div>

              <h2
                id="look-for-heading"
                className="mt-4 font-serif text-4xl font-normal leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-[54px]"
              >
                {siteConfig.whatWeLookFor.headline}
              </h2>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-5">
            <ScrollReveal delay={0.1}>
              <p className="border-l-2 border-gold pl-4 text-sm leading-relaxed text-slate sm:text-base">
                {siteConfig.whatWeLookFor.disclaimer}
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* 21st.dev Architectural Grid Feature Cards */}
        <ScrollReveal delay={0.15}>
          <div className="relative grid grid-cols-1 divide-y divide-navy/15 border border-navy/15 md:grid-cols-2 md:divide-x md:divide-y">
            <Plus
              aria-hidden="true"
              strokeWidth={1.25}
              className="pointer-events-none absolute -top-2.5 -left-2.5 z-20 h-5 w-5 text-navy/45"
            />
            <Plus
              aria-hidden="true"
              strokeWidth={1.25}
              className="pointer-events-none absolute -top-2.5 -right-2.5 z-20 h-5 w-5 text-navy/45"
            />
            <Plus
              aria-hidden="true"
              strokeWidth={1.25}
              className="pointer-events-none absolute -bottom-2.5 -left-2.5 z-20 h-5 w-5 text-navy/45"
            />
            <Plus
              aria-hidden="true"
              strokeWidth={1.25}
              className="pointer-events-none absolute -right-2.5 -bottom-2.5 z-20 h-5 w-5 text-navy/45"
            />
            {features.map((feature, idx) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                cardIndex={idx}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
