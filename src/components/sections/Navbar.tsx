"use client";

/**
 * SECTION 1: NAVIGATION
 * Adapted from 21st.dev @meschacirung/components/hero-section-6 responsive header pattern.
 * Refined in Pass 1 & 2: Uses lg: (1024px) breakpoint for full horizontal link bar so 768px
 * tablet portrait never wraps wordmark or navigation links onto multiple lines.
 */

import React, { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-navy/12 bg-ivory/95 shadow-[0_1px_0_0_rgba(16,26,36,0.06)] backdrop-blur-md"
          : "border-b border-navy/10 bg-ivory/90 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        {/* Temporary Text-Based Wordmark */}
        <a
          href="#top"
          aria-label="Deevee Capital — Home"
          className="group inline-flex shrink-0 items-center gap-3 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-navy bg-navy font-serif text-xs font-medium tracking-wider text-gold transition-colors duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-navy"
          >
            DV
          </span>
          <span className="font-sans text-sm font-semibold tracking-[0.22em] text-navy sm:text-[15px]">
            {siteConfig.wordmark}
          </span>
        </a>

        {/* Desktop Navigation Links (lg and up to prevent tablet wrapping) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-8 lg:flex xl:gap-10"
        >
          {siteConfig.navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="relative py-1 text-sm font-medium whitespace-nowrap text-charcoal/80 transition-colors duration-200 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-gold after:transition-[width] after:duration-300 hover:after:w-full"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Desktop / Tablet CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <InteractiveHoverButton
              text="Pitch Your Startup"
              href="#pitch-form"
              variant="primary-dark"
              iconType="up-right"
              className="px-5 py-2.5 text-xs uppercase tracking-[0.14em]"
            />
          </div>

          {/* Mobile & Tablet Portrait Menu Toggle Button */}
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center border border-navy/15 bg-ivory text-navy transition-colors hover:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Professional Mobile & Tablet Drawer */}
      <div
        id="mobile-navigation-drawer"
        hidden={!mobileMenuOpen}
        className={cn(
          "border-b border-navy/15 bg-ivory px-5 pt-2 pb-7 sm:px-8 lg:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <nav
          aria-label="Mobile Navigation"
          className="flex flex-col divide-y divide-navy/10"
        >
          {siteConfig.navigation.map((item, idx) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-4 text-base font-medium text-navy transition-colors hover:text-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs text-gold">0{idx + 1}</span>
                <span>{item.name}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate" aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className="mt-6 pt-2 sm:hidden">
          <a
            href="#pitch-form"
            onClick={() => setMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 border border-navy bg-navy px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span>Pitch Your Startup</span>
            <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
