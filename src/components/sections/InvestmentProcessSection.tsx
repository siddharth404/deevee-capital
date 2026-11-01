"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import { ArrowRight } from "lucide-react";

export function InvestmentProcessSection() {
  const data = siteConfig.investmentProcess;

  return (
    <section
      id="process"
      data-sec="process"
      aria-labelledby="process-heading"
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
            <h2 className="ctl-h2" id="process-heading">
              A disciplined, <em>straightforward process.</em>
            </h2>
          </div>
          <p className="ctl-lede">{data.subheadline}</p>
        </div>

        {/* 5-Stage Process Ledger */}
        <div
          style={{
            borderTop: "1px solid var(--ctl-line)",
            borderBottom: "1px solid var(--ctl-line)",
          }}
        >
          {data.stages.map((stage, idx) => (
            <div
              key={stage.number}
              style={{
                display: "grid",
                gridTemplateColumns: "clamp(60px, 8vw, 90px) minmax(200px, 1.2fr) minmax(0, 2fr) clamp(130px, 15vw, 190px)",
                gap: "clamp(16px, 2.5vw, 32px)",
                alignItems: "center",
                padding: "clamp(20px, 2.5vw, 28px) 12px",
                borderTop: idx > 0 ? "1px solid var(--ctl-line)" : "none",
                transition: "background-color 0.25s ease",
              }}
              className="group hover:bg-[var(--ctl-wash)]"
            >
              {/* Number */}
              <div>
                <span
                  style={{
                    fontFamily: "var(--ctl-serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(22px, 2.5vw, 30px)",
                    color: "var(--ctl-ink)",
                    display: "block",
                  }}
                >
                  {stage.number}.
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ctl-soft)",
                    display: "block",
                    marginTop: "2px",
                  }}
                >
                  Stage
                </span>
              </div>

              {/* Stage Name & Title */}
              <div>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--ctl-serif)",
                    fontSize: "clamp(20px, 2vw, 25px)",
                    lineHeight: 1.15,
                    color: "var(--ctl-text)",
                  }}
                >
                  {stage.stage}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--ctl-ink)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {stage.title}
                </span>
              </div>

              {/* Description */}
              <div>
                <p
                  style={{
                    fontSize: "14.5px",
                    lineHeight: 1.6,
                    color: "var(--ctl-soft)",
                    margin: 0,
                  }}
                >
                  {stage.description}
                </p>
              </div>

              {/* Cadence Tag */}
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    border: "1px solid var(--ctl-line)",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--ctl-ink)",
                    background: "var(--ctl-paper)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stage.timeline}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Process Note & CTA */}
        <div
          style={{
            marginTop: "36px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            padding: "20px 24px",
            background: "var(--ctl-wash)",
            border: "1px solid var(--ctl-line)",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <span
              style={{
                fontFamily: "var(--ctl-serif)",
                fontStyle: "italic",
                fontSize: "17px",
                color: "var(--ctl-text)",
                display: "block",
              }}
            >
              Respect for Founder Velocity
            </span>
            <p
              style={{
                marginTop: "4px",
                fontSize: "13.5px",
                lineHeight: 1.55,
                color: "var(--ctl-soft)",
                margin: 0,
              }}
            >
              {data.note}
            </p>
          </div>

          <a
            href="#pitch-form"
            className="ctl-btn"
            style={{ textDecoration: "none" }}
          >
            <span>Pitch Your Startup</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
