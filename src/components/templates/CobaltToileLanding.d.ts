import * as React from "react";

export interface CobaltToileLandingProps {
  brand?: string;
  monogram?: string;
  logo?: React.ReactNode;
  nav?: Array<{ label: string; href: string }>;
  cta?: { label: string; href: string };
  hero?: {
    title?: string;
    subtitle?: string;
    action?: { label: string; href: string };
    secondaryAction?: { label: string; href: string };
    est?: string;
    edition?: string;
  };
  clients?: string[];
  clientsLabel?: string;
  about?: {
    kicker?: string;
    statement?: string;
    body?: string | string[];
    regulatoryNote?: string;
    stats?: Array<{
      value?: number;
      display?: string;
      suffix?: string;
      label: string;
    }>;
    seal?: string;
    associatedEntity?: {
      name: string;
      website?: string;
      logo?: string;
      emblem?: string;
      overview?: string;
      connectionSummary?: string;
    };
  };
  solutionsCopy?: {
    kicker?: string;
    title?: string;
    intro?: string;
  };
  solutions?: Array<{
    kicker?: string;
    title: string;
    quote: string;
    body: string;
    points?: string[];
    art?: "typewriter" | "steamer" | "monogram" | "tower";
    tone?: "paper" | "ink";
    action?: { label: string; href: string };
  }>;
  servicesCopy?: {
    kicker?: string;
    title?: string;
    intro?: string;
  };
  services?: Array<{
    title: string;
    summary: string;
    details?: string;
    deliverables?: string[];
    duration?: string;
    durationLabel?: string;
  }>;
  pressCopy?: {
    kicker?: string;
    title?: string;
    intro?: string;
  };
  press?: Array<{
    title: string;
    source: string;
    date: string;
    category?: string;
    href?: string;
  }>;
  notes?: Array<{
    title: string;
    body: string;
  }>;
  contactBand?: {
    kicker?: string;
    title?: string;
    body?: string;
    action?: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
  };
  tagline?: string;
  columns?: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  newsletter?: {
    title?: string;
    body?: string;
    placeholder?: string;
    success?: string;
  };
  socials?: Array<{
    kind: "facebook" | "x" | "instagram" | "linkedin";
    href: string;
    label?: string;
  }>;
  legal?: Array<{ label: string; href: string }>;
  copyright?: string;
  palette?: "cobalt" | "midnight" | "indigo" | "delft" | "oxblood";
  ink?: string;
  paper?: string;
  theme?: "auto" | "light" | "dark";
  paletteSwitcher?: boolean;
  intro?: boolean;
  onSubscribe?: (email: string) => Promise<void> | void;
  pitchFormSlot?: React.ReactNode;
  onOpenPrivacyPolicy?: () => void;
  height?: string;
  className?: string;
}

export declare const CobaltToileLanding: React.ComponentType<CobaltToileLandingProps>;
export declare const C: React.ComponentType<CobaltToileLandingProps>;
export default CobaltToileLanding;
