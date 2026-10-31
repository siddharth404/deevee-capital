/**
 * Centralized Site & Brand Configuration for DEEVEE CAPITAL
 *
 * Domain: deeveecapital.com
 * Primary Contact: siddharth@deeveecapital.com
 * Form Submission Recipients: siddharth@deeveecapital.com, ravi@deeveecapital.com
 * Associated Enterprise: Dee Vee Projects Limited (https://dvplindia.in/)
 */

export const siteConfig = {
  name: "Deevee Capital",
  wordmark: "DEEVEE CAPITAL",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "https://deeveecapital.com",
  tagline: "Big ideas deserve a chance to become big businesses.",
  shortStatement:
    "An emerging initiative exploring early-stage startup investment opportunities and inviting founders to share promising businesses.",
  description:
    "Deevee Capital is an emerging initiative exploring early-stage startup investment opportunities. We are interested in ambitious founders building scalable businesses and solving meaningful problems.",
  
  /**
   * Associated Industrial & Infrastructure Background
   * Dee Vee Projects Limited (dvplindia.in)
   */
  associatedEntity: {
    name: "Dee Vee Projects Limited",
    website: "https://dvplindia.in/",
    founded: "1989",
    logo: "/images/dvpl-logo.png",
    emblem: "/images/dvpl-emblem.jpg",
    overview:
      "Founded in 1989, Dee Vee Projects Limited (DVPL) is an established Indian infrastructure development and civil engineering enterprise operating across more than 13 states in India. DVPL has executed landmark national infrastructure works including the New Legislative Assembly in Nava Raipur, the All India Institute of Ayurveda in Goa, the Civil Aviation Research Organization (CARO) Complex in Hyderabad, major highways, bridges, railways, and institutional campuses.",
    connectionSummary:
      "Deevee Capital draws inspiration from this multi-decade legacy of physical execution, foundational operational discipline, and long-horizon enterprise building, while operating as an independent exploratory early-stage initiative.",
  },

  /**
   * Contact & Form Notification Recipients
   */
  contact: {
    primaryEmail: "siddharth@deeveecapital.com",
    notificationRecipients: [
      "siddharth@deeveecapital.com",
      "ravi@deeveecapital.com",
    ],
    emailDisplay: "siddharth@deeveecapital.com",
    emailIsPlaceholder: false,
    linkedinUrlPlaceholder: "https://www.linkedin.com/company/deevee-capital",
    linkedinDisplay: "linkedin.com/company/deevee-capital",
    linkedinIsPlaceholder: false,
  },

  navigation: [
    { name: "Our Approach", href: "#services" },
    { name: "What We Look For", href: "#solutions" },
    { name: "About", href: "#about" },
    { name: "DVPL Background", href: "#dvpl-heritage" },
    { name: "Contact", href: "#pitch-form" },
  ],

  hero: {
    eyebrow: "EARLY-STAGE VENTURE INITIATIVE",
    headline: "Big ideas deserve a chance to become big businesses.",
    supportingCopy:
      "We are interested in ambitious founders building scalable businesses and solving meaningful problems.",
    primaryCta: {
      label: "Pitch Your Startup",
      href: "#pitch-form",
    },
    secondaryCta: {
      label: "Our Approach",
      href: "#services",
    },
  },

  philosophy: {
    index: "01",
    eyebrow: "OUR APPROACH",
    headline: "Good businesses begin with the right questions.",
    intro:
      "Rather than starting with rigid preconditions or formulaic checklists, we begin every conversation with curiosity and first-principles inquiry across five foundational dimensions:",
    questions: [
      {
        number: "01",
        dimension: "The Problem Being Solved",
        question: "Why does this problem matter now, and how acutely is it felt?",
        elaboration:
          "We look at the real-world friction customers experience today, the cost of inaction, and why existing alternatives fall short.",
      },
      {
        number: "02",
        dimension: "The Founders & Their Insight",
        question: "What earned perspective or conviction sets this team apart?",
        elaboration:
          "Great companies are often built around a non-obvious insight—something the founders understand about their customers or industry through direct experience.",
      },
      {
        number: "03",
        dimension: "The Potential Market",
        question: "How large and durable can this opportunity become over time?",
        elaboration:
          "We explore whether the initial wedge opens into a meaningful market or creates new behaviour as adoption compounds.",
      },
      {
        number: "04",
        dimension: "The Business Model",
        question: "How does value created for customers translate into sound unit economics?",
        elaboration:
          "We examine pricing power, margin structure, capital efficiency, and how the business earns the right to grow sustainably.",
      },
      {
        number: "05",
        dimension: "The Ability to Execute & Scale",
        question: "What does it take to move from an early product to an enduring enterprise?",
        elaboration:
          "Ideas are the starting line. We pay close attention to operational discipline, customer velocity, and the practical path to scale.",
      },
    ],
  },

  whatWeLookFor: {
    index: "02",
    eyebrow: "WHAT WE LOOK FOR",
    headline: "Four areas of enduring interest.",
    disclaimer:
      "These represent areas of interest as we explore early-stage opportunities, rather than fixed or guaranteed investment criteria.",
    blocks: [
      {
        id: "exceptional-founders",
        index: "I",
        title: "Exceptional Founders",
        summary:
          "People who understand their customers and demonstrate conviction and execution ability.",
        detail:
          "Clarity of thought, intellectual honesty, and the resilience to iterate closely with real users.",
        coordinates: "FOCUS // FOUNDER DEPTH",
      },
      {
        id: "meaningful-problems",
        index: "II",
        title: "Meaningful Problems",
        summary: "Businesses addressing genuine customer needs.",
        detail:
          "Solutions anchored in tangible utility rather than fleeting hype cycles—where customers clearly value what is being built.",
        coordinates: "FOCUS // REAL UTILITY",
      },
      {
        id: "scalable-models",
        index: "III",
        title: "Scalable Models",
        summary: "Products and services with credible potential to grow.",
        detail:
          "Thoughtful distribution, repeatable customer acquisition, and structural leverage as the business expands.",
        coordinates: "FOCUS // GROWTH ARCHITECTURE",
      },
      {
        id: "long-term-potential",
        index: "IV",
        title: "Long-Term Potential",
        summary:
          "Opportunities where sustained value creation is possible.",
        detail:
          "Defensible positioning and patient compounding built for the next decade, not just the next quarter.",
        coordinates: "FOCUS // LONG HORIZON",
      },
    ],
  },

  about: {
    index: "03",
    eyebrow: "ABOUT DEEVEE CAPITAL",
    headline: "Curious about what comes next.",
    paragraphs: [
      "Deevee Capital is an emerging initiative exploring promising early-stage businesses and building thoughtful, long-term relationships with entrepreneurs.",
      "We believe that conversations with ambitious founders are best approached with openness, respect for the craft of company-building, and a willingness to listen carefully before drawing conclusions.",
      "The initiative draws on an entrepreneurial business background associated with Dee Vee Projects Limited (dvplindia.in)—an Indian infrastructure and civil construction enterprise founded in 1989 with operations spanning over 13 states. This background brings an appreciation for foundational execution, operational stamina, and long-horizon enterprise building to our startup discovery efforts.",
    ],
    regulatoryNote:
      "Important Note: Deevee Capital is an exploratory initiative. Our association with the entrepreneurial background of Dee Vee Projects Limited does not imply that Dee Vee Projects Limited is a regulated investment fund, that specific venture investments have been made to date, or that submitting information guarantees capital or an investment commitment.",
  },

  founderCta: {
    index: "04",
    eyebrow: "FOR FOUNDERS",
    headline: "Building something worth believing in?",
    supportingCopy:
      "If you're working on an ambitious business, tell us what you're building. We'd like to learn about the problem, the team and the opportunity.",
    primaryCta: {
      label: "Share Your Startup",
      href: "#pitch-form",
    },
  },

  form: {
    index: "05",
    eyebrow: "STARTUP SUBMISSION",
    headline: "Share what you are building.",
    subheadline:
      "Tell us about your company in your own words. Submissions are reviewed directly by our investment team.",
    sectors: [
      "Enterprise Software & SaaS",
      "Artificial Intelligence & Data",
      "Fintech & Financial Infrastructure",
      "Consumer Products & Brands",
      "Industrial Tech, Infra & Supply Chain",
      "Climate, Energy & Sustainability",
      "Healthcare & Life Sciences",
      "EdTech & Future of Work",
      "DeepTech & Hardware",
      "Other / Cross-Sector",
    ],
    stages: [
      "Idea / Concept Stage",
      "Prototype / MVP Built",
      "Early Traction / Pilot Customers",
      "Pre-Seed / Early Revenue",
      "Seed & Scaling",
    ],
  },

  privacyPolicy: {
    lastUpdated: "November 2026",
    summary:
      "Deevee Capital respects founder confidentiality. Information submitted through our startup pitch form is transmitted securely and reviewed directly by our founding team.",
    sections: [
      {
        title: "1. Information We Collect",
        body: "When you voluntarily submit the Startup Submission Form, we collect the founder name, email address, startup name, sector, stage, business description, and any optional links (website, funding sought, pitch deck URL) you choose to provide, along with basic technical metadata for spam prevention.",
      },
      {
        title: "2. How We Use Your Information",
        body: "Submitted materials are delivered directly to siddharth@deeveecapital.com and ravi@deeveecapital.com to evaluate potential alignment, understand what you are building, and contact you if we have follow-up questions. We never sell, rent, or publicly disclose founder submissions.",
      },
      {
        title: "3. Data Security & Access",
        body: "Submissions are transmitted over encrypted TLS connections, stored in access-restricted server storage, and routed via secure notification channels. Public API endpoints never expose submitted pitches.",
      },
      {
        title: "4. Non-Confidentiality & No Commitment Disclaimer",
        body: "Important Note: Deevee Capital is an exploratory initiative. Our association with the entrepreneurial background of Dee Vee Projects Limited does not imply that Dee Vee Projects Limited is a regulated investment fund, that specific venture investments have been made to date, or that submitting information guarantees capital or an investment commitment.",
      },
      {
        title: "5. Contact & Deletion Requests",
        body: "Founders may request updates or deletion of their submitted information at any time by contacting us directly at siddharth@deeveecapital.com.",
      },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
