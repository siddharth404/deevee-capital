"use client";

/**
 * 21st.dev Component: @dillionverma/components/interactive-hover-button
 * Source: https://21st.dev/@dillionverma/components/interactive-hover-button
 * Refined in Pass 1 & 2 for Deevee Capital: inline gold indicator dot that stays
 * proportionally aligned with the button text across compact navbar and full-width mobile buttons.
 */

import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  href?: string;
  variant?: "primary-dark" | "primary-gold" | "outline-ivory";
  iconType?: "right" | "up-right";
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text = "Pitch Your Startup",
      href,
      variant = "primary-dark",
      iconType = "up-right",
      className,
      ...props
    },
    ref
  ) => {
    const Icon = iconType === "up-right" ? ArrowUpRight : ArrowRight;

    const variantStyles = {
      "primary-dark": {
        base: "border-navy bg-navy text-ivory",
        hoverText: "text-navy",
        dot: "bg-gold",
        hoverFill: "bg-gold",
      },
      "primary-gold": {
        base: "border-gold bg-gold text-navy",
        hoverText: "text-ivory",
        dot: "bg-navy",
        hoverFill: "bg-navy",
      },
      "outline-ivory": {
        base: "border-navy/25 bg-ivory text-navy",
        hoverText: "text-ivory",
        dot: "bg-navy",
        hoverFill: "bg-navy",
      },
    }[variant];

    const sharedClasses = cn(
      "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden border px-7 py-3.5 text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
      variantStyles.base,
      className
    );

    const innerContent = (
      <>
        {/* Background sliding fill layer */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-0",
            variantStyles.hoverFill
          )}
        />

        {/* Default state: aligned indicator dot + text */}
        <span className="relative z-10 inline-flex items-center justify-center gap-2.5 transition-[transform,opacity] duration-300 motion-reduce:transition-none group-hover:translate-x-8 group-hover:opacity-0">
          <span
            aria-hidden="true"
            className={cn("h-2 w-2 shrink-0 rounded-full", variantStyles.dot)}
          />
          <span>{text}</span>
        </span>

        {/* Hover state: sliding text + directional arrow */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex h-full w-full -translate-x-6 items-center justify-center gap-2 opacity-0 transition-[transform,opacity] duration-300 motion-reduce:transition-none group-hover:translate-x-0 group-hover:opacity-100",
            variantStyles.hoverText
          )}
        >
          <span>{text}</span>
          <Icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </>
    );

    if (href) {
      return (
        <a href={href} className={sharedClasses}>
          {innerContent}
        </a>
      );
    }

    return (
      <button ref={ref} className={sharedClasses} {...props}>
        {innerContent}
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";
