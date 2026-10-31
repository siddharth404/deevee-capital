"use client";

/**
 * SECTION 8: CONTACT AND FOOTER
 * Contains:
 * - Deevee Capital wordmark.
 * - Short brand statement.
 * - Contact email placeholder (configured in src/config/site.ts).
 * - LinkedIn URL placeholder (configured in src/config/site.ts).
 * - Privacy Policy trigger & link.
 * - Copyright notice.
 */

import React from "react";
import { Mail, Shield, ArrowUp } from "lucide-react";
import { siteConfig } from "@/config/site";

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface FooterSectionProps {
  onOpenPrivacyPolicy: () => void;
}

export function FooterSection({ onOpenPrivacyPolicy }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      aria-labelledby="footer-heading"
      className="relative bg-navy text-ivory"
    >
      <h2 id="footer-heading" className="sr-only">
        Contact and Footer — {siteConfig.name}
      </h2>

      {/* Top Architectural Hairline Accent */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-12">
        <div className="grid grid-cols-1 gap-12 border-b border-ivory/12 pb-14 lg:grid-cols-12">
          {/* Column 1: Wordmark & Brand Statement (5 Cols) */}
          <div className="space-y-5 lg:col-span-5">
            <div className="inline-flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center border border-gold bg-charcoal font-serif text-xs font-medium tracking-wider text-gold"
              >
                DV
              </span>
              <span className="font-sans text-sm font-semibold tracking-[0.22em] text-ivory">
                {siteConfig.wordmark}
              </span>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-ivory/75 sm:text-base">
              {siteConfig.shortStatement}
            </p>

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              BIG IDEAS DESERVE A CHANCE TO BECOME BIG BUSINESSES.
            </p>
          </div>

          {/* Column 2: Navigation & Legal (3 Cols) */}
          <div className="space-y-4 lg:col-span-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
              NAVIGATION
            </p>
            <ul className="space-y-2.5 text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-ivory/75 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#pitch-form"
                  className="text-ivory/75 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Pitch Your Startup
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacyPolicy}
                  className="inline-flex items-center gap-1.5 text-left text-ivory/75 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Shield className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  <span>Privacy Policy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Social Placeholders (4 Cols) */}
          <div className="space-y-5 lg:col-span-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
              DIRECT CONTACT &amp; PRESENCE
            </p>

            <div className="space-y-4">
              {/* Contact Email Placeholder */}
              <div className="border border-ivory/12 bg-charcoal p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate">
                    <Mail className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                    <span>Contact Email</span>
                  </span>
                  {siteConfig.contact.emailIsPlaceholder && (
                    <span className="border border-gold/35 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                      Placeholder
                    </span>
                  )}
                </div>
                <p className="mt-2 font-mono text-xs text-ivory/90">
                  {siteConfig.contact.emailDisplay}
                </p>
                <p className="mt-1 text-[11px] text-slate">
                  For startup pitches, please use the{" "}
                  <a
                    href="#pitch-form"
                    className="text-gold underline underline-offset-2 hover:text-ivory"
                  >
                    Startup Submission Form
                  </a>{" "}
                  above.
                </p>
              </div>

              {/* LinkedIn URL Placeholder */}
              <div className="border border-ivory/12 bg-charcoal p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate">
                    <LinkedInIcon
                      className="h-3.5 w-3.5 text-gold"
                      aria-hidden="true"
                    />
                    <span>LinkedIn</span>
                  </span>
                  {siteConfig.contact.linkedinIsPlaceholder && (
                    <span className="border border-gold/35 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                      Placeholder
                    </span>
                  )}
                </div>
                <p className="mt-2 font-mono text-xs text-ivory/90">
                  {siteConfig.contact.linkedinDisplay}
                </p>
                <p className="mt-1 text-[11px] text-slate">
                  Configurable in{" "}
                  <code className="text-ivory/80">src/config/site.ts</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-6 text-xs text-slate sm:flex-row sm:items-center">
          <div className="space-y-1">
            <p>
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-[11px] text-slate/80">
              Information on this website is for general informational purposes
              only and does not constitute an offer to sell or a solicitation of
              an offer to buy any security or investment product.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-xs text-ivory/75 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Privacy Policy
            </button>

            <a
              href="#top"
              aria-label="Scroll back to top"
              className="inline-flex items-center gap-1.5 border border-ivory/15 bg-charcoal px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span>Top</span>
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
