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
  tagline: "Backing Ambition. Building Enduring Businesses.",
  shortStatement:
    "An emerging, promoter-backed initiative exploring early-stage startup investments of up to ₹1 crore.",
  description:
    "Deevee Capital is an emerging, promoter-backed early-stage investment initiative taking a sector-agnostic approach. We partner with ambitious founders building scalable, enduring businesses across industries, considering investment opportunities of up to ₹1 crore.",
  
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
      "Deevee Capital is backed by one of the promoters of Dee Vee Projects Limited, drawing inspiration from this multi-decade legacy of physical execution, foundational operational discipline, and long-horizon enterprise building, while operating as an independent exploratory early-stage investment initiative.",
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
    { name: "Beyond Capital", href: "#beyond-capital" },
    { name: "Process", href: "#process" },
    { name: "What We Look For", href: "#solutions" },
    { name: "About", href: "#about" },
    { name: "DVPL Background", href: "#dvpl-heritage" },
    { name: "Pitch Your Startup", href: "#pitch-form" },
  ],

  hero: {
    eyebrow: "EARLY-STAGE INVESTMENT INITIATIVE",
    headline: "Backing Ambition.\nBuilding Enduring Businesses.",
    supportingCopy:
      "We partner with ambitious founders building scalable businesses. Through thoughtful capital deployment, strategic guidance and meaningful partnerships, we aim to help exceptional businesses realise their potential.",
    primaryCta: {
      label: "Pitch Your Startup",
      href: "#pitch-form",
    },
    secondaryCta: {
      label: "Explore Our Approach",
      href: "#services",
    },
  },

  /**
   * Investment Mandate — Sector-Agnostic Approach
   */
  mandate: {
    index: "01",
    eyebrow: "INVESTMENT MANDATE",
    headline: "Open to Ideas. Focused on Potential.",
    description:
      "We are open to exploring promising businesses across industries and sectors. Rather than following a fixed industry mandate, we focus on the strength of the founding team, the problem being addressed, market opportunity, business fundamentals and potential for long-term growth.",
    parameters: [
      {
        label: "Stage",
        value: "Pre-Seed and Seed",
        note: "Early-stage opportunities with high conviction and strong execution momentum.",
      },
      {
        label: "Investment Capacity",
        value: "Up to ₹1 Crore",
        note: "Per startup, subject to opportunity evaluation, diligence, and investment decision.",
      },
      {
        label: "Geography",
        value: "India-Focused",
        note: "Backing founders solving meaningful problems for India and global markets.",
      },
      {
        label: "Sector Approach",
        value: "Sector-Agnostic",
        note: "Open to high-potential businesses across diverse industries and business models.",
      },
      {
        label: "Partnership Approach",
        value: "Selective & Long-Term",
        note: "High-engagement, patient capital focused on sustainable value creation.",
      },
    ],
    positioningHeadline: "Broad Horizon. Selective Conviction.",
    positioningStatement:
      "Deevee Capital takes a sector-agnostic approach to early-stage opportunities. We are interested in founders building meaningful, scalable businesses across industries, guided by conviction in the problem, strength of execution and potential for long-term value creation.",
    openPillars: [
      {
        name: "Open to All Industries",
        description:
          "From technology and manufacturing to healthcare, consumer, agriculture, climate, and infrastructure—we evaluate every business on its intrinsic merits rather than sector quotas.",
      },
      {
        name: "First-Principles Inquiry",
        description:
          "We examine the gravity of the customer problem, pricing power, unit economics, and operational leverage rather than transient category narratives.",
      },
      {
        name: "Execution & Resilience",
        description:
          "Great businesses are built on operational discipline and stamina. We back determined teams who understand their customers and execute with precision.",
      },
      {
        name: "Active, Patient Partnership",
        description:
          "Capital is only the foundation. We provide strategic direction, financial modelling, and pragmatic operational guidance tailored to each founder's journey.",
      },
    ],
  },

  /**
   * Founder Support Proposition — Beyond Capital
   */
  beyondCapital: {
    index: "02",
    eyebrow: "FOUNDER PARTNERSHIP",
    headline: "Beyond Capital",
    subheadline:
      "Building a successful business requires far more than financial resources. We aim to work alongside founders, offering thoughtful perspectives, strategic guidance and practical support as they navigate the challenges of building and scaling their businesses.",
    pillars: [
      {
        number: "01",
        title: "Strategic Direction",
        summary:
          "Helping founders clarify vision, refine business models, and establish enduring market positioning.",
        points: [
          "Business model refinement & differentiation",
          "Go-to-market and growth strategy",
          "Competitive market positioning",
          "Multi-year strategic planning",
        ],
      },
      {
        number: "02",
        title: "Financial & Business Understanding",
        summary:
          "Instilling disciplined capital allocation and foundational unit economics from day one.",
        points: [
          "Financial planning & runway modeling",
          "Unit economics & pricing architecture",
          "Capital allocation & cash-flow discipline",
          "Preparation for future institutional rounds",
        ],
      },
      {
        number: "03",
        title: "Operational Support",
        summary:
          "Sharing practical execution stamina drawn from complex physical and organizational delivery.",
        points: [
          "Process improvement & execution planning",
          "Operational efficiency & bottleneck removal",
          "Key performance metrics & dashboarding",
          "Pragmatic business development guidance",
        ],
      },
      {
        number: "04",
        title: "Network & Connections",
        summary:
          "Opening doors to trusted enterprise relationships, potential customers, and business allies.",
        points: [
          "Relevant enterprise & industry introductions",
          "Potential commercial customer connections",
          "Strategic partnership opportunities",
          "Access to multi-industry business networks",
        ],
      },
      {
        number: "05",
        title: "Founder Partnership",
        summary:
          "A steady, high-trust sounding board through every phase of company-building.",
        points: [
          "Thoughtful, candid problem-solving sessions",
          "Navigating unpredictable business challenges",
          "Founder resilience & decision support",
          "Patient, long-term relationship building",
        ],
      },
    ],
    disclaimer:
      "Note: These represent areas where we aim to provide active guidance and support. We collaborate closely with founders without guaranteeing third-party commercial outcomes.",
  },

  /**
   * Investment Process
   */
  investmentProcess: {
    index: "03",
    eyebrow: "INVESTMENT PROCESS",
    headline: "A straightforward, disciplined process.",
    subheadline:
      "We respect founders' time and prioritize transparent, constructive communication at every step of our evaluation.",
    stages: [
      {
        number: "01",
        stage: "Startup Submission",
        title: "Materials & Thesis Submission",
        description:
          "Founders share their company overview, customer insight, and pitch deck through our secure portal.",
        timeline: "Direct Review",
      },
      {
        number: "02",
        stage: "Initial Screening",
        title: "Opportunity & Team Assessment",
        description:
          "We review the business model, problem gravity, market opportunity, and founder conviction against our areas of interest.",
        timeline: "First-Principles Review",
      },
      {
        number: "03",
        stage: "Founder Discussion",
        title: "Direct Strategic Dialogue",
        description:
          "We connect with shortlisted founders to discuss their insight, product journey, operational hurdles, and growth ambitions.",
        timeline: "In-Depth Conversation",
      },
      {
        number: "04",
        stage: "Detailed Evaluation",
        title: "Commercial & Operational Due Diligence",
        description:
          "We undertake appropriate business, financial, technical, and legal diligence in collaborative partnership with the founders.",
        timeline: "Collaborative Diligence",
      },
      {
        number: "05",
        stage: "Investment Decision",
        title: "Decision & Partnership Formation",
        description:
          "Suitable opportunities proceed through formal investment approval, documentation, and the start of our long-term support.",
        timeline: "Formal Documentation",
      },
    ],
    note: "We do not enforce rigid bureaucratic approval cycles, allowing us to move at a pace respectful of founder momentum.",
  },

  philosophy: {
    index: "04",
    eyebrow: "INVESTMENT PHILOSOPHY",
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
    index: "05",
    eyebrow: "WHAT WE LOOK FOR",
    headline: "Four areas of enduring interest.",
    disclaimer:
      "We approach opportunities with an open mind, without limiting ourselves to predefined industries. Our interest lies in identifying exceptional founders building meaningful businesses with the potential to scale and create lasting value.",
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
    index: "06",
    eyebrow: "ABOUT DEEVEE CAPITAL",
    headline: "Curious about what comes next.",
    paragraphs: [
      "Deevee Capital is an emerging, promoter-backed early-stage investment initiative exploring promising startup opportunities and building thoughtful, long-term relationships with ambitious founders across industries.",
      "We believe that conversations with founders are best approached with openness, respect for the craft of company-building, and a willingness to listen carefully before drawing conclusions.",
      "The initiative draws inspiration from the entrepreneurial and engineering heritage of Dee Vee Projects Limited (dvplindia.in)—an Indian infrastructure enterprise founded in 1989 with operations spanning over 13 states. This background instills an appreciation for physical execution stamina, foundational operational discipline, and long-horizon enterprise building.",
    ],
    regulatoryNote:
      "Important Note: Deevee Capital is an exploratory initiative backed by one of the promoters of Dee Vee Projects Limited. Our association with the entrepreneurial background of Dee Vee Projects Limited does not imply that Dee Vee Projects Limited is a regulated investment fund, that specific venture investments have been made to date, or that submitting information guarantees capital or an investment commitment.",
  },

  founderCta: {
    index: "07",
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
    index: "08",
    eyebrow: "STARTUP SUBMISSION",
    headline: "Share what you are building.",
    subheadline:
      "Tell us about your company in your own words. Submissions are reviewed directly by our investment team.",
    fundingBrackets: [
      "Up to ₹25 Lakhs",
      "₹25 Lakhs - ₹50 Lakhs",
      "₹50 Lakhs - ₹1 Crore (Primary Focus)",
      "₹1 Crore - ₹2 Crore",
      "Above ₹2 Crore",
      "Undisclosed / Discussion Stage",
    ],
    sectors: [
      "Technology & Software",
      "Manufacturing & Industrial",
      "Consumer & Retail",
      "Healthcare & Life Sciences",
      "Financial Services & FinTech",
      "Infrastructure & Real Assets",
      "Agriculture & Rural Economy",
      "Climate & Clean Energy",
      "Education & Knowledge",
      "Logistics & Supply Chain",
      "Media, Entertainment & Gaming",
      "Other / Emerging Sector",
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
