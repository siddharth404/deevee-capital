"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import { Compass, TrendingUp, Cpu, Network, Handshake } from "lucide-react";

const PILLAR_ICONS = [
  Compass,
  TrendingUp,
  Cpu,
  Network,
  Handshake,
];

export function BeyondCapitalSection() {
  const data = siteConfig.beyondCapital;

  return (
    <section
      id="beyond-capital"
      data-sec="beyond-capital"
      aria-labelledby="beyond-capital-heading"
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
            <h2 className="ctl-h2" id="beyond-capital-heading">
              Beyond <em>Capital.</em>
            </h2>
          </div>
          <p className="ctl-lede">{data.subheadline}</p>
        </div>

        {/* 5 Founder Support Pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "24px",
            marginTop: "16px",
          }}
        >
          {data.pillars.map((pillar, idx) => {
            const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length];
            return (
              <div
                key={pillar.number}
                style={{
                  border: "1px solid var(--ctl-line)",
                  background: "var(--ctl-wash)",
                  padding: "clamp(24px, 3.2vw, 36px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  transition: "border-color 0.3s ease, transform 0.3s ease",
                }}
              >
                <div>
                  {/* Top Bar with Number & Icon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid var(--ctl-line)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--ctl-serif)",
                        fontStyle: "italic",
                        fontSize: "20px",
                        color: "var(--ctl-ink)",
                      }}
                    >
                      {pillar.number}.
                    </span>
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "var(--ctl-ink)", opacity: 0.85 }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "var(--ctl-serif)",
                      fontWeight: 400,
                      fontSize: "clamp(22px, 2.2vw, 28px)",
                      lineHeight: 1.15,
                      color: "var(--ctl-text)",
                      marginBottom: "12px",
                    }}
                  >
                    {pillar.title}
                  </h3>

                  {/* Summary */}
                  <p
                    style={{
                      fontSize: "14.5px",
                      lineHeight: 1.6,
                      color: "var(--ctl-soft)",
                      marginBottom: "20px",
                    }}
                  >
                    {pillar.summary}
                  </p>

                  {/* Bullets */}
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      borderTop: "1px solid var(--ctl-line)",
                      paddingTop: "16px",
                    }}
                  >
                    {pillar.points.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "10px",
                          fontSize: "13px",
                          lineHeight: 1.5,
                          color: "var(--ctl-text)",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--ctl-ink)",
                            fontSize: "14px",
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          —
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Note */}
        <div
          style={{
            marginTop: "32px",
            padding: "16px 20px",
            border: "1px solid var(--ctl-line)",
            background: "var(--ctl-paper)",
            fontSize: "12.5px",
            lineHeight: 1.6,
            color: "var(--ctl-soft)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--ctl-serif)",
              fontStyle: "italic",
              fontSize: "16px",
              color: "var(--ctl-ink)",
              flexShrink: 0,
            }}
          >
            Philosophy
          </span>
          <span>{data.disclaimer}</span>
        </div>
      </div>
    </section>
  );
}
