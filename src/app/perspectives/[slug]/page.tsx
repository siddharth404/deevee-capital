import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar, ArrowUpRight, Share2, BookmarkCheck } from "lucide-react";
import { PERSPECTIVES } from "@/data/perspectives";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PERSPECTIVES.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = PERSPECTIVES.find((p) => p.slug === slug);
  if (!post) return { title: "Perspective Not Found" };

  const url = `https://deeveecapital.com/perspectives/${post.slug}`;

  return {
    title: `${post.title} — Deevee Capital`,
    description: post.subtitle || post.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.subtitle || post.summary,
      siteName: siteConfig.name,
      publishedTime: "2026-11-01T00:00:00.000Z",
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.subtitle || post.summary,
    },
  };
}

export default async function PerspectivePage({ params }: PageProps) {
  const { slug } = await params;
  const post = PERSPECTIVES.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const currentIndex = PERSPECTIVES.findIndex((p) => p.slug === slug);
  const nextPost = PERSPECTIVES[(currentIndex + 1) % PERSPECTIVES.length];
  const prevPost = PERSPECTIVES[(currentIndex - 1 + PERSPECTIVES.length) % PERSPECTIVES.length];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#17191C] selection:bg-[#C6AD7A] selection:text-[#101A24]">
      {/* Editorial Sticky Navigation Bar */}
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
              href="/perspectives"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[#101A24] underline decoration-[#C6AD7A] underline-offset-4"
            >
              Perspectives
            </Link>
          </nav>

          <Link
            href="/#pitch-form"
            className="relative inline-flex items-center justify-center gap-2 border border-[#101A24] bg-[#101A24] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5F0] transition-colors hover:bg-[#17191C]"
          >
            <span>Pitch Your Startup</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 md:py-20">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/perspectives"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#77818B] transition-colors hover:text-[#101A24]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Perspectives</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="border-b border-[#101A24]/12 pb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#101A24]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#101A24]"></span>
              {post.category}
            </span>
            <span className="text-xs text-[#77818B]">•</span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-[#77818B]">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
            <span className="text-xs text-[#77818B]">•</span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-[#77818B]">
              <Calendar className="h-3.5 w-3.5" />
              {post.date}
            </span>
          </div>

          <h1 className="mt-5 font-serif text-3xl font-normal leading-[1.12] tracking-tight text-[#101A24] sm:text-5xl md:text-5xl">
            {post.title}
          </h1>

          <p className="mt-5 font-serif text-lg leading-relaxed text-[#17191C]/80 italic sm:text-xl">
            {post.subtitle}
          </p>

          {/* Author Byline */}
          <div className="mt-8 flex items-center justify-between border-t border-[#101A24]/10 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[#101A24] bg-[#101A24] text-sm font-serif font-bold text-[#F7F5F0]">
                DC
              </div>
              <div>
                <p className="text-sm font-semibold text-[#101A24]">{post.author.name}</p>
                <p className="text-xs text-[#77818B]">{post.author.role} • deeveecapital.com</p>
              </div>
            </div>

            <Link
              href="/#pitch-form"
              className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#101A24] underline decoration-[#C6AD7A] underline-offset-4 hover:text-[#77818B] sm:inline-block"
            >
              Share Your Thoughts &rarr;
            </Link>
          </div>
        </header>

        {/* Lead Callout / Summary */}
        <div className="my-10 border-l-2 border-[#101A24] bg-[#F7F5F0] p-6 shadow-xs">
          <p className="font-serif text-lg leading-relaxed text-[#101A24]">
            {post.summary}
          </p>
        </div>

        {/* Article Body Sections */}
        <div className="space-y-12">
          {post.sections.map((section, sIdx) => (
            <section key={sIdx} className="space-y-5">
              {section.heading && (
                <h2 className="font-serif text-2xl font-normal text-[#101A24] sm:text-3xl">
                  {section.heading}
                </h2>
              )}

              {section.quote && (
                <blockquote className="my-6 border-y border-[#101A24]/15 py-6 text-center font-serif text-xl italic leading-snug text-[#101A24] sm:text-2xl">
                  &ldquo;{section.quote}&rdquo;
                </blockquote>
              )}

              {section.paragraphs.map((pText, pIdx) => (
                <p
                  key={pIdx}
                  className="text-base leading-relaxed text-[#17191C]/85 sm:text-lg"
                >
                  {pText}
                </p>
              ))}

              {section.bullets && (
                <ul className="my-4 space-y-3 pl-2">
                  {section.bullets.map((bullet, bIdx) => {
                    const [bTitle, ...bRest] = bullet.split(":");
                    return (
                      <li key={bIdx} className="flex items-start gap-3 text-base sm:text-lg">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#101A24]"></span>
                        <div>
                          {bRest.length > 0 ? (
                            <>
                              <strong className="font-serif text-[#101A24]">{bTitle}:</strong>
                              <span className="text-[#17191C]/85">{bRest.join(":")}</span>
                            </>
                          ) : (
                            <span className="text-[#17191C]/85">{bullet}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Key Takeaways Card */}
        {post.takeaways && post.takeaways.length > 0 && (
          <div className="mt-14 border border-[#101A24] bg-[#FFFFFF] p-8 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#101A24]/10 pb-4">
              <BookmarkCheck className="h-5 w-5 text-[#101A24]" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#101A24]">
                Key Takeaways for Founders
              </h3>
            </div>
            <ul className="mt-6 space-y-3.5">
              {post.takeaways.map((takeaway, tIdx) => (
                <li key={tIdx} className="flex items-start gap-3">
                  <span className="font-serif text-base font-bold italic text-[#101A24]">
                    {tIdx + 1}.
                  </span>
                  <span className="text-sm leading-relaxed text-[#17191C]/85 sm:text-base">
                    {takeaway}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next / Previous Article Navigation */}
        <div className="mt-14 grid grid-cols-1 gap-4 border-t border-[#101A24]/12 pt-8 sm:grid-cols-2">
          {prevPost && (
            <Link
              href={`/perspectives/${prevPost.slug}`}
              className="group border border-[#101A24]/15 bg-white p-5 transition-colors hover:border-[#101A24]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#77818B]">
                &larr; Previous Perspective
              </span>
              <p className="mt-1 font-serif text-base text-[#101A24] transition-colors group-hover:text-[#77818B]">
                {prevPost.title}
              </p>
            </Link>
          )}

          {nextPost && (
            <Link
              href={`/perspectives/${nextPost.slug}`}
              className="group border border-[#101A24]/15 bg-white p-5 text-right transition-colors hover:border-[#101A24]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#77818B]">
                Next Perspective &rarr;
              </span>
              <p className="mt-1 font-serif text-base text-[#101A24] transition-colors group-hover:text-[#77818B]">
                {nextPost.title}
              </p>
            </Link>
          )}
        </div>

        {/* Bottom CTA to Pitch Startup */}
        <div className="mt-16 border border-[#101A24] bg-[#101A24] p-8 text-center text-[#F7F5F0] sm:p-12">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#C6AD7A]">
            FOR FOUNDERS
          </span>
          <h2 className="mt-3 font-serif text-3xl font-normal sm:text-4xl">
            Building something worth believing in?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#F7F5F0]/80 sm:text-base">
            If you are an ambitious founder building a scalable business, share what you are working on.
            Submissions are reviewed directly by our investment team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#pitch-form"
              className="inline-flex items-center gap-2 border border-[#F7F5F0] bg-[#F7F5F0] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#101A24] transition-colors hover:bg-white"
            >
              <span>Share Your Startup</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[#F7F5F0]/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F5F0] transition-colors hover:border-[#F7F5F0]"
            >
              <span>Return Home</span>
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
            An emerging initiative exploring early-stage opportunities, associated with the entrepreneurial background of Dee Vee Projects Limited (dvplindia.in).
          </p>
        </div>
      </footer>
    </div>
  );
}
