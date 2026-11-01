"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function InvestmentMandateSection() {
  const data = siteConfig.mandate;

  return (
    <section
      id="mandate"
      data-sec="mandate"
      aria-labelledby="mandate-heading"
      className="ctl-sec"
      style={{
        borderBottom: "1px solid var(--ctl-line)",
        background: "var(--ctl-paper)",
      }}
    >
      <div className="ctl-wrap">
        {/* Section Header */}
        <div className="ctl-sechead">
          <div>
            <span className="ctl-kicker">
              {data.index} · {data.eyebrow}
            </span>
            <h2 className="ctl-h2" id="mandate-heading">
              Open to Ideas. <em>Focused on Potential.</em>
            </h2>
          </div>
          <p className="ctl-lede">{data.description}</p>
        </div>

        {/* 5 Core Parameters Ledger Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "16px",
            marginBottom: "44px",
          }}
        >
          {data.parameters.map((param, pIdx) => (
            <div
              key={param.label}
              style={{
                border: "1px solid var(--ctl-line)",
                background: "var(--ctl-wash)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--ctl-ink)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {pIdx + 1 < 10 ? `0${pIdx + 1}` : pIdx + 1} · {param.label}
                </span>
                <strong
                  style={{
                    fontFamily: "var(--ctl-serif)",
                    fontSize: "clamp(20px, 2vw, 24px)",
                    lineHeight: 1.15,
                    color: "var(--ctl-text)",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  {param.value}
                </strong>
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  lineHeight: 1.5,
                  color: "var(--ctl-soft)",
                  margin: 0,
                }}
              >
                {param.note}
              </p>
            </div>
          ))}
        </div>

        {/* Sector-Agnostic Positioning Card */}
        <div
          style={{
            border: "1px solid var(--ctl-line)",
            background: "var(--ctl-paper)",
            padding: "clamp(24px, 3.5vw, 40px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--ctl-line)",
            }}
          >
            <div>
              <span className="ctl-kicker">SECTOR-AGNOSTIC POSITIONING</span>
              <h3
                style={{
                  fontFamily: "var(--ctl-serif)",
                  fontWeight: 400,
                  fontSize: "clamp(24px, 2.8vw, 34px)",
                  color: "var(--ctl-text)",
                  marginTop: "6px",
                }}
              >
                {data.positioningHeadline}
              </h3>
            </div>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--ctl-soft)",
                maxWidth: "520px",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {data.positioningStatement}
            </p>
          </div>

          {/* Open Architecture Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "16px",
            }}
          >
            {data.openPillars.map((pillar) => (
              <div
                key={pillar.name}
                style={{
                  padding: "18px",
                  border: "1px solid var(--ctl-line)",
                  background: "var(--ctl-wash)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: "var(--ctl-ink)" }}
                    aria-hidden="true"
                  />
                  <strong
                    style={{
                      fontFamily: "var(--ctl-serif)",
                      fontSize: "17px",
                      color: "var(--ctl-text)",
                    }}
                  >
                    {pillar.name}
                  </strong>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.55,
                    color: "var(--ctl-soft)",
                    margin: 0,
                    paddingLeft: "22px",
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid var(--ctl-line)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              fontSize: "12px",
              color: "var(--ctl-soft)",
            }}
          >
            <span>
              * Indicative ticket size up to ₹1 Crore per startup across any industry. Submissions do not imply a guaranteed investment commitment or formal endorsement.
            </span>
            <a
              href="#pitch-form"
              style={{
                color: "var(--ctl-ink)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                textDecoration: "none",
              }}
            >
              <span>Submit Startup</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
