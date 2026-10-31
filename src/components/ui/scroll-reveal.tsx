"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  duration?: number;
  immediate?: boolean;
}

/**
 * Clean structural wrapper that renders children immediately at 100% opacity
 * without creating transform/opacity GPU compositing traps or hydration delays.
 */
export function ScrollReveal({
  children,
  className,
}: ScrollRevealProps) {
  return <div className={cn(className)}>{children}</div>;
}
