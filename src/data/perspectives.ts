/**
 * Complete Editorial Perspectives & Founder Notebook for DEEVEE CAPITAL
 *
 * Each perspective is a full-length, thoughtful essay reflecting Deevee Capital's
 * first-principles investment philosophy, founder-first orientation, and appreciation
 * for foundational execution.
 */

export interface PerspectiveArticle {
  slug: string;
  title: string;
  subtitle: string;
  category: "Philosophy" | "Founders" | "Problems" | "Scale" | "Pitch";
  date: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
  };
  summary: string;
  sections: Array<{
    heading?: string;
    paragraphs: string[];
    quote?: string;
    bullets?: string[];
  }>;
  takeaways: string[];
}

export const PERSPECTIVES: PerspectiveArticle[] = [
  {
    slug: "first-principles-inquiry",
    title: "Why We Begin Every Founder Conversation with Questions Rather than a Rigid Checklist",
    subtitle:
      "The best early-stage discussions are exploratory rather than transactional. Why formulaic criteria obscure what first-principles inquiry reveals.",
    category: "Philosophy",
    date: "November 2026",
    readingTime: "6 min read",
    author: {
      name: "Deevee Capital Team",
      role: "Deevee Capital",
    },
    summary:
      "Standard institutional venture checklists often filter for yesterday's patterns. At Deevee Capital, we treat every pitch as an inquiry into first principles—exploring the problem, the insight, and the structural unit economics with curiosity rather than bureaucratic preconditions.",
    sections: [
      {
        heading: "The Limits of the Standard Venture Checklist",
        paragraphs: [
          "Most early-stage founders are familiar with the mechanical interrogation that defines conventional pitch meetings: What is your current monthly recurring revenue? What is your customer acquisition cost to lifetime value ratio? Which competitor quadrant do you occupy? What tier-one university did your engineering team attend?",
          "While financial and operational metrics are indispensable once a business matures, demanding formulaic answers at the seed or pre-seed stage often produces misleading theater. It incentivizes founders to present polished projections rather than honest observations about real customer friction.",
          "Early-stage company-building is fundamentally an exercise in navigating uncertainty. When an entrepreneur is doing something genuinely new, the past offers very few neat benchmarks. If you measure an unprecedented idea against a conventional template, you will invariably dismiss the most promising opportunities because they appear messy, non-standard, or uncomfortably early.",
        ],
        quote:
          "If you measure an unprecedented idea against a conventional template, you will invariably dismiss the most promising opportunities because they appear non-standard.",
      },
      {
        heading: "Five Foundational Dimensions of Inquiry",
        paragraphs: [
          "Rather than imposing a rigid 20-point rubric, we structure our conversations around five foundational dimensions. These are not hurdles to jump over, but open inquiries designed to understand the fundamental physics of the business:",
        ],
        bullets: [
          "The Problem Being Solved: Why does this friction exist in the world today? What is the human or financial cost of leaving it unaddressed, and why have incumbent alternatives failed to resolve it?",
          "The Founders & Their Insight: What earned secret or lived experience gives this team a unique vantage point? What do they see that others in the industry routinely overlook?",
          "The Potential Market: Is this an opportunity that can expand as adoption compounds? Does solving this initial wedge create an entirely new category of behavior?",
          "The Business Model: How does the value created for the customer translate into resilient pricing power, sustainable gross margins, and healthy unit economics?",
          "The Ability to Execute & Scale: How does the team translate ambition into operational rhythm? Do they possess the stamina to iterate relentlessly when real-world conditions diverge from the spreadsheet?",
        ],
      },
      {
        heading: "Listening as an Investment Discipline",
        paragraphs: [
          "Good questions require the discipline to listen carefully before drawing conclusions. Too many investors enter pitch meetings eager to prove they are the smartest person in the room—offering hasty diagnoses before fully understanding the customer problem.",
          "Our approach is deliberately grounded in humility and intellectual honesty. The founder who spends sixteen hours a day inside a specific problem will almost always know more about their customer than an investor who read a 15-page market report the night before.",
          "By approaching founder dialogues as collaborative inquiries, we create an environment where entrepreneurs can speak openly about what is working, what remains unproven, and where the critical leverage points lie.",
        ],
      },
      {
        heading: "Building for the Decades Ahead",
        paragraphs: [
          "When we evaluate a business, we are not looking for short-term vanity metrics that can be dressed up for the next funding round. We are interested in enterprises that have the potential to build enduring value over ten, fifteen, or twenty years.",
          "This patience shapes how we ask questions. We want to understand whether the company is building foundations that get sturdier with scale, or whether growth will introduce hidden fragility. That distinction cannot be captured in a generic checklist—it can only be discovered through deep, open, and thoughtful dialogue.",
        ],
      },
    ],
    takeaways: [
      "Rigid venture checklists incentivize polished projection theater over genuine customer truth.",
      "Inquiry across problem, insight, market, model, and execution reveals structural potential far better than vanity metrics.",
      "Great founders possess earned insights from direct proximity to customer pain points.",
      "Patience and intellectual humility are essential to identifying non-consensus winners before the market catches on.",
    ],
  },
  {
    slug: "exceptional-founders",
    title: "What Sets Exceptional Early-Stage Founders Apart When Navigating a New Market",
    subtitle:
      "Beyond pedigree and polish: conviction earned from customer proximity, intellectual honesty, and rapid iteration in the real world.",
    category: "Founders",
    date: "November 2026",
    readingTime: "7 min read",
    author: {
      name: "Deevee Capital Team",
      role: "Deevee Capital",
    },
    summary:
      "When evaluating early-stage teams, pedigree and charisma are poor substitutes for earned conviction. We examine the specific traits that distinguish founders who build resilient, category-defining enterprises from those who merely ride fleeting trends.",
    sections: [
      {
        heading: "The Fallacy of the Polished Persona",
        paragraphs: [
          "In the tech ecosystem, there is an enduring myth of the charismatic visionary: an orator who commands the room, delivers flawless keynote presentations, and appears destined for leadership. Yet in practice, some of the most resilient companies are built by founders whose quiet intensity and obsessive focus on customers make them look very different from the Silicon Valley stereotype.",
          "Exceptional company-builders are rarely distinguished by how well they pitch. They are distinguished by how deeply they understand their customers, how candidly they confront hard realities, and how quickly they convert feedback into working software and sound operations.",
        ],
        quote:
          "Exceptional company-builders are rarely distinguished by how well they pitch. They are distinguished by how deeply they understand their customers and how candidly they confront hard realities.",
      },
      {
        heading: "1. The Earned Secret: Insights from the Trenches",
        paragraphs: [
          "The most promising founders almost always possess what Peter Thiel termed an 'earned secret'—an observation about how a market or workflow actually functions that cannot be gleaned from secondary research or industry analyst decks.",
          "An earned secret comes from having lived the friction. It is the logistics founder who spent eighteen months riding in freight trucks to observe loading dock delays, or the healthcare technologist who sat beside hospital billers watching claim rejections unfold in real time.",
          "When a founder describes a problem with tactile granularity, it becomes immediately apparent whether they are repeating conventional wisdom or speaking from first-hand battle experience.",
        ],
      },
      {
        heading: "2. Intellectual Honesty and Reality Testing",
        paragraphs: [
          "Building a startup involves confronting a relentless sequence of disconfirming data. Early hypotheses about user behavior, pricing sensitivity, and distribution channels frequently turn out to be wrong.",
          "Average founders double down on their original narrative, blaming the customer or the market for failing to appreciate their genius. Exceptional founders exhibit radical intellectual honesty. They separate their self-worth from their initial assumptions. When customer feedback contradicts their thesis, they adjust with velocity and clarity.",
        ],
      },
      {
        heading: "3. Operational Stamina: The Craft of Execution",
        paragraphs: [
          "Ideas are abundant; sustained execution over multiple years is extraordinarily rare. We pay close attention to operational rhythm: Does the team ship updates weekly? Do they follow up with customers immediately after a complaint? Do they know their unit economics down to the last rupee?",
          "This stamina is not about working 100-hour weeks in a state of chaotic frenzy. It is about steady, compounding discipline—the daily commitment to removing friction, improving code quality, tightening margins, and serving users with excellence.",
        ],
        bullets: [
          "Customer Obsession: Speaking with active users daily and viewing product iterations through their eyes.",
          "High Signal-to-Noise Ratio: The ability to prioritize the single bottleneck that matters today and ignore peripheral distractions.",
          "Capital Mindfulness: Treating investor capital as fuel for deliberate compounding rather than an excuse for profligate burn.",
          "Attracting Rare Talent: Inspiring top-tier engineers and operators to leave comfortable jobs to solve a hard, meaningful problem.",
        ],
      },
      {
        heading: "What We Look For at Deevee Capital",
        paragraphs: [
          "When we speak with founders at Deevee Capital, we do not require a flawless resume or previous venture-backed exits. We are drawn to individuals who demonstrate authentic conviction, intellectual clarity, and the courage to tackle real-world utility.",
          "If you are a founder who understands your customer deeply and is executing with relentless discipline, we invite you to share what you are building with us.",
        ],
      },
    ],
    takeaways: [
      "Customer proximity creates earned secrets that cannot be replicated by desktop research.",
      "Intellectual honesty allows founders to pivot rapidly in response to disconfirming evidence.",
      "Execution stamina compounds over years into unassailable structural moats.",
      "Authentic conviction rooted in customer empathy outlasts artificial marketing polish.",
    ],
  },
  {
    slug: "real-utility-vs-hype",
    title: "Separating Genuine Customer Utility and Meaningful Problems from Market Noise",
    subtitle:
      "Technology waves create noisy hype cycles. Enduring businesses solve acute, unglamorous friction that customers gladly pay for.",
    category: "Problems",
    date: "November 2026",
    readingTime: "5 min read",
    author: {
      name: "Deevee Capital Team",
      role: "Deevee Capital",
    },
    summary:
      "Every major shift in technology brings a wave of superficial applications searching for problems. We explore why Deevee Capital focuses on unglamorous, high-utility problems where customer willingness to pay is evident from day one.",
    sections: [
      {
        heading: "The Siren Song of Technology-First Solutions",
        paragraphs: [
          "Whenever a foundational technology emerges—whether it was cloud infrastructure in 2008, mobile in 2011, or generative artificial intelligence today—a familiar pattern repeats. Hundreds of startups emerge touting the technology itself as the value proposition, rather than the problem being solved.",
          "Founders build sophisticated wrappers, impressive technical demonstrations, and viral demos. Yet within 18 to 24 months, many of these companies struggle with devastating churn, margin erosion, and customer fatigue. They built answers to questions nobody was desperately asking.",
        ],
        quote:
          "A business built on novel technology without acute customer pain is an entertaining science project; a business built on acute customer pain with pragmatic technology is an enduring enterprise.",
      },
      {
        heading: "Painkillers vs. Vitamins: The Economic Test",
        paragraphs: [
          "The classic venture distinction between painkillers and vitamins remains as true today as it was thirty years ago. In an environment of tightening budgets and disciplined capital, businesses and consumers aggressively cancel 'nice-to-have' subscriptions.",
          "At Deevee Capital, we look for problems that sit on the critical path of an organization or an individual's livelihood:",
        ],
        bullets: [
          "Revenue Protection: Software or systems that directly safeguard or expand a customer's primary income streams.",
          "Regulatory & Compliance Mandates: Areas where non-compliance carries severe financial, legal, or operational penalties.",
          "Labor & Productivity Bottlenecks: Workflows where manual human friction creates severe backlogs that cap organizational growth.",
          "Infrastructure Reliability: Core systems where a ten-minute outage costs millions of rupees or disrupts critical operations.",
        ],
      },
      {
        heading: "The Beauty of Unglamorous Workflows",
        paragraphs: [
          "Some of the world's most lucrative and defensible software companies operate in industries that mainstream consumer tech routinely ignores: cement logistics, quarry management, cross-border customs reconciliation, industrial boiler maintenance, and supply chain cold storage.",
          "These sectors are often messy, fragmented, and demanding. They require founders to spend time in factories, warehouses, and transport hubs rather than trendy coffee shops. But precisely because they are challenging, they are remarkably insulated from low-effort copycats.",
          "When an entrepreneur builds a workflow solution that saves an industrial distributor three hours a day and eliminates inventory shrinkage, that customer will never churn. The pricing power is structural, not promotional.",
        ],
      },
      {
        heading: "Our Commitment to Real Utility",
        paragraphs: [
          "Deevee Capital is consciously oriented toward real utility. We are excited by artificial intelligence, distributed computing, and advanced engineering—not as buzzwords to sprinkle across pitch decks, but as powerful tools deployed to dismantle genuine customer friction.",
          "If your business solves a problem that customers cannot afford to ignore, we want to hear your story.",
        ],
      },
    ],
    takeaways: [
      "Technology is a mechanism, not a market. Start with customer pain, not technical novelty.",
      "Painkillers that protect revenue, satisfy compliance, or unblock capacity exhibit superior retention.",
      "Unglamorous industrial and B2B workflows often yield the most defensible, high-margin software franchises.",
      "Customer willingness to pay from day one is the most reliable validation of real utility.",
    ],
  },
  {
    slug: "operational-discipline-scale",
    title: "How Real-World Operational Discipline Informs Our Appreciation for Scalable Models",
    subtitle:
      "What 35+ years of building large-scale physical infrastructure teaches us about unit economics, compounding, and enterprise stamina in software.",
    category: "Scale",
    date: "November 2026",
    readingTime: "8 min read",
    author: {
      name: "Deevee Capital Team",
      role: "Deevee Capital",
    },
    summary:
      "Drawing on our associated background with Dee Vee Projects Limited (founded in 1989), we explore how the principles of physical construction—foundational site preparation, disciplined cash conversion, and long-horizon compounding—apply directly to scaling software and technology startups.",
    sections: [
      {
        heading: "From Physical Foundations to Digital Architecture",
        paragraphs: [
          "Deevee Capital has a distinct entrepreneurial heritage associated with Dee Vee Projects Limited (dvplindia.in). Since its founding in 1989, DVPL has operated in the physical world of civil engineering, building monumental projects across more than 13 states—including the New Legislative Assembly in Nava Raipur, the All India Institute of Ayurveda in Goa, the CARO Complex in Hyderabad, multi-lane highways, and central university campuses.",
          "In the physical construction of a multi-storey legislative hall or an expansive highway network, there is zero tolerance for hand-waving. If your foundation is miscalculated by two degrees, the structure will eventually crack. If your procurement cycle is sloppy, cash flow collapses. If you scale prematurely before the site survey is complete, the project fails.",
          "While software boasts near-zero marginal distribution costs that physical construction can only dream of, the fundamental laws of enterprise building remain remarkably identical.",
        ],
        quote:
          "In physical construction, if your foundation is miscalculated, the structure cracks. In software, if your unit economics and architecture are fragile, scaling simply accelerates your demise.",
      },
      {
        heading: "1. Positive Unit Economics Before Volume",
        paragraphs: [
          "During the era of ultra-cheap venture capital, an entire generation of startups was trained to prioritize growth at all costs, subsidizing unprofitable transactions with venture subsidies under the vague promise that 'scale will fix the unit economics.'",
          "In civil engineering, if you lose money on every cubic meter of concrete poured, pouring ten times as much concrete will not make you profitable—it will bankrupt you tenfold faster.",
          "We look for startups that demonstrate a clear, credible path to gross margin health and contribution profit early. Scale should amplify a working economic engine, not serve as a temporary bandage for structural unprofitability.",
        ],
      },
      {
        heading: "2. The Compounding Advantage of Distribution Wedges",
        paragraphs: [
          "A great product without a repeatable customer acquisition model is like a masterfully engineered bridge that connects to no roads. Scalable businesses design their distribution architecture with the same rigor as their product codebase.",
          "Whether through programmatic product-led growth, high-velocity outbound sales, proprietary integrations, or network effects, sustainable scale requires a distribution wedge that becomes more cost-efficient—not more expensive—as market share expands.",
        ],
        bullets: [
          "Repeatable Onboarding: Moving customers from initial signup to 'aha' moment with minimal human friction.",
          "Net Revenue Retention: Customers who expand their contract value naturally over time as their own business grows.",
          "Defensible Moats: Switching costs, proprietary datasets, and operational integrations that make replacing the product prohibitively difficult.",
        ],
      },
      {
        heading: "3. Enterprise Stamina and Long Horizons",
        paragraphs: [
          "Large institutions, highways, and enduring corporations are not built in twenty-four months. They are the result of decade-long commitments to craftsmanship, governance, and operational discipline.",
          "At Deevee Capital, we carry this mindset into early-stage venture discussions. We are not interested in artificial momentum engineered for quick flips. We want to partner with ambitious founders who view company-building as their life's work—entrepreneurs who possess the stamina to withstand market downturns, maintain disciplined execution, and build institutions that outlast their founders.",
        ],
      },
    ],
    takeaways: [
      "Physical construction and digital enterprise building share the same iron law: foundations determine height.",
      "Scale does not fix broken unit economics; it magnifies structural flaws.",
      "Thoughtful distribution architecture is as critical to enterprise value as product engineering.",
      "Patient, multi-decade compounding consistently outperforms volatile, hype-driven expansion.",
    ],
  },
  {
    slug: "founder-submission-guide",
    title: "How to Share What You Are Building: A Transparent Guide for Founders",
    subtitle:
      "Everything you need to know about sharing your startup with Deevee Capital—what we read, how we evaluate, and what happens next.",
    category: "Pitch",
    date: "November 2026",
    readingTime: "4 min read",
    author: {
      name: "Deevee Capital Team",
      role: "Deevee Capital",
    },
    summary:
      "We believe founders deserve complete transparency when sharing their company. Here is a clear explanation of how submissions to Deevee Capital are received, who reads them, our confidentiality standards, and what you can expect after hitting submit.",
    sections: [
      {
        heading: "No Gatekeepers, No Junior Screening",
        paragraphs: [
          "At many traditional venture capital firms, incoming founder pitches are routed to automated tracking systems, scraped by automated filters, or assigned to junior analysts whose primary mandate is to find reasons to say no before a decision-maker ever sees the deck.",
          "At Deevee Capital, we deliberately run a direct, founder-first operation. When you submit our Startup Submission Form, your materials are delivered directly to our investment team. There are no intermediary screening layers or bureaucratic committees between you and the partners.",
        ],
        quote:
          "When you submit your startup to Deevee Capital, your materials are delivered directly to our investment team. No intermediaries, no screening algorithms, no junior gatekeepers.",
      },
      {
        heading: "What We Look For in Your Submission",
        paragraphs: [
          "Our form asks for ten essential fields. You do not need a 40-page deck or buzzword-heavy marketing copy. In fact, plain, direct language is significantly more persuasive. Here is what we pay attention to:",
        ],
        bullets: [
          "Founder Name & Email: How we can contact you directly for a conversation.",
          "Startup Name & Website/Product Link: If you have an active product, MVP, or demo, we love seeing what you have built firsthand.",
          "Sector & Stage: Understanding whether you are at the concept stage, have an MVP, or are scaling early revenue across any industry—from technology and consumer to manufacturing, infrastructure, and services.",
          "Brief Description: Tell us clearly what problem you are solving, for whom, why existing solutions are inadequate, and what your unique insight is.",
          "Funding Sought & Pitch Deck Link: Share your capital target and a link to your deck or memo (DocSend, Google Drive, Notion) if available.",
        ],
      },
      {
        heading: "Confidentiality and Privacy Guarantee",
        paragraphs: [
          "We treat every founder submission with strict professional discretion and confidentiality. Your proprietary data, product roadmaps, and pitch links are stored in access-restricted server storage and are never sold, rented, or publicly exposed through API responses.",
          "Furthermore, our institutional clarification ensures transparent alignment from day one: Deevee Capital is an exploratory initiative associated with the entrepreneurial background of Dee Vee Projects Limited, operating with independence, integrity, and respect for founder intellectual property.",
        ],
      },
      {
        heading: "What Happens After You Submit",
        paragraphs: [
          "Upon submitting, you will immediately receive a unique Reference ID (e.g., DVC-2026-XXXX) confirming that your materials are securely recorded in our system. A notification is instantly dispatched to our investment team.",
          "We review submissions thoughtfully against our areas of interest. When there is mutual alignment and curiosity, we reach out directly via email to schedule an in-depth conversation.",
          "If you are building something meaningful, we invite you to take five minutes and submit your startup today.",
        ],
      },
    ],
    takeaways: [
      "Every pitch is reviewed directly by our investment team without junior intermediaries.",
      "Clear, plain-spoken problem descriptions beat buzzword-laden sales pitches every time.",
      "Submissions are encrypted, confidential, and handled with institutional discretion.",
      "Ready to start the conversation? Submit your pitch through the form below.",
    ],
  },
];
