import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy and startup submission terms for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ivory px-5 py-16 text-charcoal sm:px-8 md:py-24">
      <div className="mx-auto max-w-3xl border border-navy/15 bg-white p-8 sm:p-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-navy transition-colors hover:text-slate"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to {siteConfig.wordmark}</span>
        </Link>

        <div className="mt-8 flex items-center gap-3 border-b border-navy/12 pb-6">
          <ShieldCheck
            className="h-6 w-6 text-gold"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate">
              LEGAL &amp; PRIVACY
            </p>
            <h1 className="mt-1 font-serif text-3xl font-normal text-navy sm:text-4xl">
              Privacy Policy &amp; Submission Terms
            </h1>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-charcoal/85">
          <p className="border-l-2 border-gold bg-ivory p-5 font-medium text-navy">
            {siteConfig.privacyPolicy.summary}
          </p>

          {siteConfig.privacyPolicy.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold text-navy">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-charcoal/80 sm:text-base">
                {section.body}
              </p>
            </section>
          ))}

          <p className="border-t border-navy/12 pt-6 font-mono text-xs text-slate">
            Last updated: {siteConfig.privacyPolicy.lastUpdated}
          </p>
        </div>
      </div>
    </main>
  );
}
