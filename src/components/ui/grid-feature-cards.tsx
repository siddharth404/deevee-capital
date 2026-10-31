"use client";

/**
 * 21st.dev Component: @efferd/components/grid-feature-cards
 * Source: https://21st.dev/@efferd/components/grid-feature-cards
 * Adapted for Deevee Capital's Section 4: What We Look For, featuring architectural
 * SVG blueprint GridPattern overlays and deterministic coordinates.
 */

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface GridFeatureItem {
  id: string;
  index: string;
  title: string;
  summary: string;
  detail: string;
  coordinates: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  squares?: [number, number][];
}

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: string | number;
  y?: string | number;
  squares?: [number, number][];
}

export function GridPattern({
  width = 24,
  height = 24,
  x = -12,
  y = 4,
  squares,
  className,
  ...props
}: GridPatternProps) {
  const rawId = useId();
  const patternId = `grid-pattern-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg aria-hidden="true" className={className} {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], index) => (
            <rect
              key={`${sx}-${sy}-${index}`}
              strokeWidth="0"
              width={width + 1}
              height={height + 1}
              x={sx * width}
              y={sy * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

const DEFAULT_SQUARES: [number, number][][] = [
  [
    [8, 1],
    [10, 2],
    [12, 1],
    [9, 4],
  ],
  [
    [7, 2],
    [11, 1],
    [9, 3],
    [13, 2],
  ],
  [
    [8, 3],
    [10, 1],
    [12, 3],
    [7, 1],
  ],
  [
    [9, 1],
    [11, 3],
    [8, 2],
    [13, 1],
  ],
];

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  feature: GridFeatureItem;
  cardIndex?: number;
}

export function FeatureCard({
  feature,
  cardIndex = 0,
  className,
  ...props
}: FeatureCardProps) {
  const squares =
    feature.squares ?? DEFAULT_SQUARES[cardIndex % DEFAULT_SQUARES.length];
  const Icon = feature.icon;

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden bg-ivory p-8 transition-colors duration-500 hover:bg-white md:p-10",
        className
      )}
      {...props}
    >
      {/* 21st.dev Architectural GridPattern Overlay */}
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-16 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-r from-navy/[0.04] to-gold/[0.08] opacity-100 transition-opacity duration-500 group-hover:opacity-100 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
          <GridPattern
            width={24}
            height={24}
            x="-12"
            y="4"
            squares={squares}
            className="absolute inset-0 h-full w-full fill-gold/15 stroke-navy/15"
          />
        </div>
      </div>

      {/* Top Metadata Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-navy/10 pb-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.2em] text-slate">
            0{cardIndex + 1} / {feature.index}
          </span>
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-gold"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate">
            {feature.coordinates}
          </span>
        </div>
        <div className="flex h-10 w-10 items-center justify-center border border-navy/15 bg-ivory text-navy transition-colors duration-300 group-hover:border-gold group-hover:bg-navy group-hover:text-gold">
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mt-10 space-y-4">
        <h3 className="font-serif text-2xl font-normal tracking-tight text-navy md:text-3xl">
          {feature.title}
        </h3>
        <p className="text-base font-medium leading-relaxed text-charcoal">
          {feature.summary}
        </p>
        <p className="pt-2 text-sm leading-relaxed text-slate">
          {feature.detail}
        </p>
      </div>

      {/* Bottom Subtle Gold Indicator */}
      <div className="relative z-10 mt-8 flex items-center justify-between pt-4">
        <span className="h-[1px] w-8 bg-gold transition-[width] duration-500 group-hover:w-16" />
        <span className="font-mono text-[11px] tracking-[0.18em] text-slate transition-colors duration-300 group-hover:text-navy">
          AREA OF INTEREST
        </span>
      </div>
    </article>
  );
}
