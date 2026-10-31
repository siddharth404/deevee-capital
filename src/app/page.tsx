"use client";

import React, { useState } from "react";
import { CobaltToileLanding } from "@/components/templates/CobaltToileLanding";
import { PitchFormSection } from "@/components/sections/PitchFormSection";
import { PrivacyPolicyModal } from "@/components/sections/PrivacyPolicyModal";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <>
      <CobaltToileLanding
        brand={siteConfig.wordmark}
        monogram="D"
        palette="cobalt"
        paletteSwitcher={true}
        intro={false}
        nav={[
          { label: "Our Approach", href: "#services" },
          { label: "What We Look For", href: "#solutions" },
          { label: "About", href: "#about" },
          { label: "DVPL Background", href: "#dvpl-heritage" },
          { label: "Contact", href: "#pitch-form" },
        ]}
        cta={{
          label: "Pitch Your Startup",
          href: "#pitch-form",
        }}
        hero={{
          title: "Big ideas deserve a chance\nto become big businesses.",
          subtitle:
            "We are interested in ambitious founders building scalable businesses and solving meaningful problems.",
          action: {
            label: "Pitch Your Startup",
            href: "#pitch-form",
          },
          secondaryAction: {
            label: "Our Approach",
            href: "#services",
          },
          est: "DEEVEE CAPITAL",
          edition: "EARLY-STAGE INITIATIVE",
        }}
        clientsLabel="Areas of enduring interest"
        clients={[
          "Exceptional Founders",
          "Meaningful Problems",
          "Scalable Models",
          "Long-Term Potential",
          "Enterprise Software & SaaS",
          "Applied AI & Data",
          "Fintech Infrastructure",
          "Industrial & DeepTech",
        ]}
        about={{
          kicker: "03 · About Deevee Capital",
          statement:
            "Curious about *what comes next* — exploring early-stage businesses and building relationships with *ambitious entrepreneurs*.",
          body: [...siteConfig.about.paragraphs],
          regulatoryNote: siteConfig.about.regulatoryNote,
          associatedEntity: siteConfig.associatedEntity,
          seal: "Deevee Capital · Early-Stage Initiative · ",
          stats: [
            {
              display: "I.",
              label: "First-Principles Inquiry — Every pitch reviewed directly",
            },
            {
              display: "II.",
              label: "Early-Stage Focus — Exploring pre-seed & seed builders",
            },
            {
              display: "III.",
              label:
                "Entrepreneurial Roots — Associated with Dee Vee Projects Limited (dvplindia.in)",
            },
            {
              display: "IV.",
              label: "Direct Founder Review — Reviewed by Investment Team",
            },
          ],
        }}
        solutionsCopy={{
          kicker: "02 · What We Look For",
          title: "Four areas of *enduring interest*.",
          intro:
            "Pull an engraved bookmark from the shelf. These represent areas of interest as we explore early-stage opportunities, rather than fixed or guaranteed investment criteria.",
        }}
        solutions={[
          {
            kicker: "Founders",
            title: "Exceptional Founders",
            quote:
              "Conviction earned from listening closely to real customers.",
            body: "People who understand their customers and demonstrate conviction and execution ability—combining clarity of thought, intellectual honesty, and the resilience to iterate in the real world.",
            points: [
              "Earned founder-problem insight",
              "Direct customer understanding",
              "Disciplined execution & adaptability",
            ],
            art: "typewriter",
            tone: "paper",
            action: {
              label: "Pitch Your Startup",
              href: "#pitch-form",
            },
          },
          {
            kicker: "Problems",
            title: "Meaningful Problems",
            quote:
              "Tangible customer utility outlasts every passing hype cycle.",
            body: "Businesses addressing genuine customer needs—where the friction is deeply felt, existing alternatives fall short, and customers clearly value what is being built.",
            points: [
              "Genuine, acute customer need",
              "Clear gap in existing alternatives",
              "Solutions anchored in real utility",
            ],
            art: "steamer",
            tone: "ink",
            action: {
              label: "Pitch Your Startup",
              href: "#pitch-form",
            },
          },
          {
            kicker: "Models",
            title: "Scalable Models",
            quote:
              "Sound unit economics earn a business the right to compound.",
            body: "Products and services with credible potential to grow—supported by thoughtful distribution, repeatable customer acquisition, and structural leverage as the company expands.",
            points: [
              "Credible path to repeatable growth",
              "Thoughtful distribution wedge",
              "Sustainable unit economics",
            ],
            art: "monogram",
            tone: "paper",
            action: {
              label: "Pitch Your Startup",
              href: "#pitch-form",
            },
          },
          {
            kicker: "Horizon",
            title: "Long-Term Potential",
            quote: "Build the foundations first; every storey after is stronger.",
            body: "Opportunities where sustained value creation is possible—built with defensible positioning, operational discipline, and patient compounding for the next decade.",
            points: [
              "Sustained value creation over time",
              "Defensible product & market position",
              "Enduring enterprise mindset",
            ],
            art: "tower",
            tone: "ink",
            action: {
              label: "Pitch Your Startup",
              href: "#pitch-form",
            },
          },
        ]}
        servicesCopy={{
          kicker: "01 · Investment Philosophy",
          title: "Good businesses begin with *the right questions*.",
          intro:
            "Rather than starting with rigid preconditions or formulaic checklists, we begin every conversation with curiosity and first-principles inquiry across five foundational dimensions.",
        }}
        services={siteConfig.philosophy.questions.map((q) => ({
          title: q.dimension,
          summary: q.question,
          details: q.elaboration,
          deliverables: [
            `Dimension ${q.number}`,
            "First-Principles Inquiry",
            "Founder Dialogue",
          ],
          durationLabel: "Core question · ",
          duration: q.question,
        }))}
        pressCopy={{
          kicker: "Founder Notebook",
          title: "Perspectives",
          intro: "",
        }}
        press={[
          {
            title:
              "Why we begin every founder conversation with questions rather than a rigid checklist",
            source: "First Principles",
            date: "6 min read",
            category: "Philosophy",
            href: "/perspectives/first-principles-inquiry",
          },
          {
            title:
              "What sets exceptional early-stage founders apart when navigating a new market",
            source: "Founder Insight",
            date: "7 min read",
            category: "Founders",
            href: "/perspectives/exceptional-founders",
          },
          {
            title:
              "Separating genuine customer utility and meaningful problems from short-lived market noise",
            source: "Real Utility",
            date: "5 min read",
            category: "Problems",
            href: "/perspectives/real-utility-vs-hype",
          },
          {
            title:
              "How real-world operational discipline informs our appreciation for scalable business models",
            source: "Enterprise Scale",
            date: "8 min read",
            category: "Scale",
            href: "/perspectives/operational-discipline-scale",
          },
          {
            title:
              "How to share your startup, product link, and story directly with the Deevee Capital team",
            source: "Founder Guide",
            date: "4 min read",
            category: "Pitch",
            href: "/perspectives/founder-submission-guide",
          },
        ]}
        notes={[
          {
            title: "Exceptional Founders",
            body: "People who understand their customers deeply and demonstrate conviction, clarity, and execution ability.",
          },
          {
            title: "Meaningful Problems",
            body: "Businesses addressing genuine customer needs with tangible utility rather than passing hype.",
          },
          {
            title: "Scalable Models",
            body: "Products and services with sound unit economics and credible potential to grow sustainably.",
          },
          {
            title: "Long-Term Potential",
            body: "Opportunities where sustained value creation and enduring enterprise building are possible.",
          },
        ]}
        contactBand={{
          kicker: "04 · For Founders",
          title: "Building something *worth believing in*?",
          body: "If you're working on an ambitious business, tell us what you're building. We'd like to learn about the problem, the team and the opportunity.",
          action: {
            label: "Share Your Startup",
            href: "#pitch-form",
          },
          secondary: {
            label: "Our Approach",
            href: "#services",
          },
        }}
        pitchFormSlot={
          <PitchFormSection
            onOpenPrivacyPolicy={() => setPrivacyModalOpen(true)}
          />
        }
        onOpenPrivacyPolicy={() => setPrivacyModalOpen(true)}
        tagline={siteConfig.shortStatement}
        contact={{
          email: siteConfig.contact.primaryEmail,
          location:
            "Early-Stage Venture Initiative · Associated with Dee Vee Projects Limited",
        }}
        columns={[
          {
            title: "Navigation",
            links: [
              { label: "Our Approach", href: "#services" },
              { label: "What We Look For", href: "#solutions" },
              { label: "About Deevee Capital", href: "#about" },
              { label: "DVPL Background", href: "#dvpl-heritage" },
              { label: "Pitch Your Startup", href: "#pitch-form" },
            ],
          },
          {
            title: "Areas of Interest",
            links: [
              { label: "Exceptional Founders", href: "#solutions" },
              { label: "Meaningful Problems", href: "#solutions" },
              { label: "Scalable Models", href: "#solutions" },
              { label: "Long-Term Potential", href: "#solutions" },
            ],
          },
          {
            title: "Enterprise Background",
            links: [
              { label: "Dee Vee Projects Ltd", href: "https://dvplindia.in/" },
              { label: "Infrastructure Heritage", href: "#dvpl-heritage" },
              { label: "Privacy Policy", href: "#privacy" },
              { label: "Full Privacy Notice", href: "/privacy" },
            ],
          },
        ]}
        newsletter={{
          title: "Founder Dispatches",
          body: "Share your email to receive occasional notes and insights as Deevee Capital's early-stage initiative evolves.",
          placeholder: "founder@company.com",
          success: "Recorded. Thank you for connecting with Deevee Capital.",
        }}
        socials={[
          {
            kind: "linkedin",
            href: siteConfig.contact.linkedinUrlPlaceholder,
            label: "LinkedIn",
          },
        ]}
        legal={[
          { label: "Privacy Policy", href: "#privacy" },
          { label: "Dee Vee Projects Ltd (dvplindia.in)", href: "https://dvplindia.in/" },
          { label: "Submit Your Startup", href: "#pitch-form" },
        ]}
        copyright={`© ${new Date().getFullYear()} Deevee Capital (deeveecapital.com). All rights reserved. An emerging initiative exploring early-stage startup opportunities, associated with the entrepreneurial background of Dee Vee Projects Limited.`}
      />

      <PrivacyPolicyModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </>
  );
}
