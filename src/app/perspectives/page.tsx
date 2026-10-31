import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Clock, Calendar } from "lucide-react";
import { PERSPECTIVES } from "@/data/perspectives";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Founder Perspectives & Essays — Deevee Capital",
  description:
    "Explore our complete essays and perspectives on first-principles inquiry, founder conviction, real customer utility, scalable business models, and startup submissions.",
  alternates: {
    canonical: "https://deeveecapital.com/perspectives",
  },
};

export default function PerspectivesIndexPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#17191C] selection:bg-[#C6AD7A] selection:text-[#101A24]">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#101A24]/12 bg-[#F7F5F0]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 font-serif text-xl tracking-tight text-[#101A24] transition-opacity hover:opacity-80"
          >
            <span className="font-bold tracking-widest text-[#101A24]">DEEVEE CAPITAL</span>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/#services"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[#17191C]/75 transition-colors hover:text-[#101A24]"
            >
              Our Approach
            </Link>
            <Link
              href="/#solutions"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[#17191C]/75 transition-colors hover:text-[#101A24]"
            >
              What We Look For
            </Link>
            <Link
              href="/#about"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[#17191C]/75 transition-colors hover:text-[#101A24]"
            >
              About
            </Link>
          </nav>

          <Link
            href="/#pitch-form"
            className="inline-flex items-center gap-2 border border-[#101A24] bg-[#101A24] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5F0] transition-colors hover:bg-[#17191C]"
          >
            <span>Pitch Your Startup</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 md:py-20">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#77818B] transition-colors hover:text-[#101A24]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#101A24]/12 pb-10">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#101A24]">
            FOUNDER NOTEBOOK
          </span>
          <h1 className="mt-4 font-serif text-4xl font-normal tracking-tight text-[#101A24] sm:text-6xl">
            Perspectives &amp; Inquiry
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#17191C]/75 sm:text-lg">
            Complete essays on first-principles thinking, founder conviction, real customer utility,
            and the operational stamina required to build enduring enterprises.
          </p>
        </div>

        {/* Article Cards Grid */}
        <div className="mt-12 space-y-8">
          {PERSPECTIVES.map((post, idx) => (
            <article
              key={post.slug}
              className="group border border-[#101A24]/15 bg-white p-6 transition-all hover:border-[#101A24] hover:shadow-md sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#101A24]">
                  {post.category}
                </span>
                <span className="text-xs text-[#77818B]">•</span>
                <span className="inline-flex items-center gap-1 font-mono text-xs text-[#77818B]">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
                <span className="text-xs text-[#77818B]">•</span>
                <span className="font-mono text-xs text-[#77818B]">{post.date}</span>
              </div>

              <h2 className="mt-4 font-serif text-2xl font-normal leading-snug text-[#101A24] transition-colors group-hover:text-[#101A24] sm:text-3xl">
                <Link href={`/perspectives/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#17191C]/75 sm:text-base">
                {post.subtitle}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-[#101A24]/8 pt-4">
                <span className="font-mono text-xs text-[#77818B]">
                  By {post.author.name}
                </span>

                <Link
                  href={`/perspectives/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#101A24] underline decoration-[#C6AD7A] underline-offset-4 group-hover:text-[#101A24]"
                >
                  <span>Read Full Essay</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Pitch CTA Card */}
        <div className="mt-16 border border-[#101A24] bg-[#101A24] p-8 text-center text-[#F7F5F0] sm:p-12">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#C6AD7A]">
            FOR FOUNDERS
          </span>
          <h2 className="mt-3 font-serif text-3xl font-normal sm:text-4xl">
            Have an ambitious startup to share?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#F7F5F0]/80 sm:text-base">
            Tell us about your problem, your team, and the opportunity. All submissions are reviewed
            directly by our investment team.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/#pitch-form"
              className="inline-flex items-center gap-2 border border-[#F7F5F0] bg-[#F7F5F0] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#101A24] transition-colors hover:bg-white"
            >
              <span>Submit Startup Pitch</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#101A24]/12 bg-[#F7F5F0] py-10 text-center text-xs text-[#77818B]">
        <div className="mx-auto max-w-5xl px-5">
          <p>
            © {new Date().getFullYear()} Deevee Capital (deeveecapital.com). All rights reserved.
          </p>
          <p className="mt-2 text-[11px] text-[#77818B]/80">
            Associated with the entrepreneurial background of Dee Vee Projects Limited (dvplindia.in).
          </p>
        </div>
      </footer>
    </div>
  );
}
