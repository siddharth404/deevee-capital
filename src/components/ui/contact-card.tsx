"use client";

/**
 * 21st.dev Component: @efferd/components/contact-card
 * Source: https://21st.dev/@efferd/components/contact-card
 * Adapted for Deevee Capital Section 7: Startup Submission Form, featuring
 * corner Plus crosshairs, left founder guidance column, and right pitch form chamber.
 */

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactInfoItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  subvalue?: string;
}

export interface ContactCardProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description: string;
  contactInfo?: ContactInfoItem[];
  guidanceSteps?: { step: string; title: string; detail: string }[];
  formSectionClassName?: string;
  children: React.ReactNode;
}

export function ContactCard({
  eyebrow = "05 // STARTUP SUBMISSION",
  title,
  description,
  contactInfo,
  guidanceSteps,
  className,
  formSectionClassName,
  children,
  ...props
}: ContactCardProps) {
  return (
    <div
      className={cn(
        "relative grid w-full border border-navy/15 bg-white lg:grid-cols-12",
        className
      )}
      {...props}
    >
      {/* 21st.dev Corner Crosshairs */}
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 -left-3 z-10 h-6 w-6 text-navy/60"
        strokeWidth={1}
      />
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 -right-3 z-10 h-6 w-6 text-navy/60"
        strokeWidth={1}
      />
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3 -left-3 z-10 h-6 w-6 text-navy/60"
        strokeWidth={1}
      />
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -bottom-3 z-10 h-6 w-6 text-navy/60"
        strokeWidth={1}
      />

      {/* Left Column: Editorial Guidance & Process */}
      <div className="flex flex-col justify-between bg-navy p-8 text-ivory md:p-12 lg:col-span-5">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 border border-gold/30 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-gold">
              {eyebrow}
            </span>
          </div>

          <h2 className="font-serif text-3xl font-normal leading-tight tracking-tight text-ivory md:text-4xl lg:text-[42px]">
            {title}
          </h2>

          <p className="text-sm leading-relaxed text-ivory/75 md:text-base">
            {description}
          </p>

          {guidanceSteps && guidanceSteps.length > 0 && (
            <div className="mt-8 space-y-5 border-t border-ivory/15 pt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                HOW WE REVIEW SUBMISSIONS
              </p>
              <ol className="space-y-4">
                {guidanceSteps.map((item) => (
                  <li key={item.step} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-gold/40 font-mono text-[11px] text-gold">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ivory">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ivory/65">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {contactInfo && contactInfo.length > 0 && (
          <div className="mt-10 space-y-4 border-t border-ivory/15 pt-8">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-ivory/15 bg-charcoal text-gold">
                    <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate">
                      {info.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-ivory">
                      {info.value}
                    </p>
                    {info.subvalue && (
                      <p className="mt-0.5 text-xs text-ivory/60">
                        {info.subvalue}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Form Chamber */}
      <div
        className={cn(
          "flex h-full w-full flex-col justify-center bg-white p-6 sm:p-10 md:p-12 lg:col-span-7",
          formSectionClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
