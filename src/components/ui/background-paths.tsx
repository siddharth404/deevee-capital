"use client";

/**
 * 21st.dev Component: @kokonutd/components/background-paths
 * Source: https://21st.dev/@kokonutd/components/background-paths
 * Adapted for Deevee Capital brand tokens (#101A24 Midnight Navy & #C6AD7A Champagne Gold),
 * using lightweight native SVG rendering for zero GPU tile drops across all browsers.
 */

import React from "react";
import { cn } from "@/lib/utils";

interface FloatingPathsProps {
  position: number;
  variant?: "light" | "dark";
}

function FloatingPaths({ position, variant = "light" }: FloatingPathsProps) {
  const paths = React.useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.45 + i * 0.025,
        isGold: i % 5 === 0,
      })),
    [position]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        aria-hidden="true"
        className="animate-contour-pulse h-full w-full"
        viewBox="0 0 696 316"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <title>Architectural Contour Paths</title>
        {paths.map((path) => {
          const strokeColor = path.isGold
            ? "#C6AD7A"
            : variant === "dark"
              ? "#F7F5F0"
              : "#101A24";

          const baseOpacity = path.isGold
            ? 0.16 + path.id * 0.008
            : variant === "dark"
              ? 0.045 + path.id * 0.005
              : 0.04 + path.id * 0.005;

          return (
            <path
              key={path.id}
              d={path.d}
              stroke={strokeColor}
              strokeWidth={path.width}
              strokeOpacity={baseOpacity}
              className={cn(path.id > 10 && "hidden md:block")}
            />
          );
        })}
      </svg>
    </div>
  );
}

export interface BackgroundPathsOverlayProps {
  className?: string;
  variant?: "light" | "dark";
}

export function BackgroundPathsOverlay({
  className,
  variant = "light",
}: BackgroundPathsOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <FloatingPaths position={1} variant={variant} />
      <FloatingPaths position={-1} variant={variant} />
    </div>
  );
}
