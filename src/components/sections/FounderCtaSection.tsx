"use client";

/**
 * SECTION 6: FOUNDER CALL TO ACTION
 * Headline: "Building something worth believing in?"
 * Supporting copy: "If you're working on an ambitious business, tell us what you're building. We'd like to learn about the problem, the team and the opportunity."
 * Primary CTA: "Share Your Startup"
 * Uses adapted 21st.dev @efferd/components/cta-3 and @kokonutd/components/background-paths.
 */

import React from "react";
import { siteConfig } from "@/config/site";
import { ArchitecturalCta } from "@/components/ui/cta-3";
import { BackgroundPathsOverlay } from "@/components/ui/background-paths";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FounderCtaSection() {
  return (
    <section
      aria-labelledby="founder-cta-heading"
      className="relative overflow-hidden border-b border-gold/20 bg-navy py-20 text-ivory md:py-28 lg:py-32"
    >
      {/* 21st.dev Dark Variant Background Paths */}
      <BackgroundPathsOverlay variant="dark" className="opacity-70" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <ScrollReveal>
          <div id="founder-cta-heading" className="sr-only">
            {siteConfig.founderCta.headline}
          </div>
          <ArchitecturalCta
            index={siteConfig.founderCta.index}
            eyebrow={siteConfig.founderCta.eyebrow}
            headline={siteConfig.founderCta.headline}
            supportingCopy={siteConfig.founderCta.supportingCopy}
            primaryCtaLabel={siteConfig.founderCta.primaryCta.label}
            primaryCtaHref={siteConfig.founderCta.primaryCta.href}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
