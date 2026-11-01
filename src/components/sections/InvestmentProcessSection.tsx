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
        scrollMarginTop: "80px",
      }}
    >
      <style>{`
        .ctl-proc-item {
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-areas:
            "num badge"
            "title title"
            "desc desc";
          gap: 10px 16px;
          padding: 18px 6px;
          border-top: 1px solid var(--ctl-line);
          transition: background-color 0.25s ease;
        }
        .ctl-proc-item:first-child {
          border-top: none;
        }
        .ctl-proc-num-cell {
          grid-area: num;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .ctl-proc-badge-cell {
          grid-area: badge;
          text-align: right;
          align-self: center;
        }
        .ctl-proc-title-cell {
          grid-area: title;
        }
        .ctl-proc-desc-cell {
          grid-area: desc;
        }
        @media (min-width: 860px) {
          .ctl-proc-item {
            grid-template-columns: clamp(60px, 7vw, 85px) minmax(180px, 1.15fr) minmax(0, 2fr) auto;
            grid-template-areas: "num title desc badge";
            align-items: center;
            gap: clamp(16px, 2.5vw, 32px);
            padding: clamp(20px, 2.5vw, 28px) 12px;
          }
          .ctl-proc-num-cell {
            display: block;
          }
        }
      `}</style>
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
          {data.stages.map((stage) => (
            <div
              key={stage.number}
              className="ctl-proc-item group hover:bg-[var(--ctl-wash)]"
            >
              {/* Number */}
              <div className="ctl-proc-num-cell">
                <span
                  style={{
                    fontFamily: "var(--ctl-serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(22px, 2.5vw, 30px)",
                    color: "var(--ctl-ink)",
                    display: "inline-block",
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
                    display: "inline-block",
                    marginLeft: "2px",
                  }}
                >
                  Stage
                </span>
              </div>

              {/* Cadence Tag */}
              <div className="ctl-proc-badge-cell">
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px 12px",
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

              {/* Stage Name & Title */}
              <div className="ctl-proc-title-cell">
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--ctl-serif)",
                    fontSize: "clamp(20px, 2vw, 25px)",
                    lineHeight: 1.2,
                    color: "var(--ctl-text)",
                  }}
                >
                  {stage.stage}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: "3px",
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
              <div className="ctl-proc-desc-cell">
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "var(--ctl-soft)",
                    margin: 0,
                  }}
                >
                  {stage.description}
                </p>
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
            padding: "clamp(16px, 2.5vw, 24px)",
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
