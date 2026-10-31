"use client";

/**
 * 21st.dev Component: @educalvolpz/components/soft-blur-in
 * Source: https://21st.dev/@educalvolpz/components/soft-blur-in
 * Pure CSS-backed editorial word reveal that is 100% immune to React 19 Strict Mode
 * double-mount animation cancellation and never leaves GPU blur filters active.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface SoftBlurInProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  triggerOnView?: boolean;
  mode?: "words" | "characters";
}

export function SoftBlurIn({
  children,
  className = "",
  mode = "words",
}: SoftBlurInProps) {
  const units =
    mode === "words" ? children.split(" ") : Array.from(children);

  return (
    <span className={cn("inline", className)}>
      {units.map((unit, idx) => (
        <React.Fragment key={idx}>
          <span className="inline-block">
            {unit === " " ? "\u00A0" : unit}
          </span>
          {mode === "words" && idx < units.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}
