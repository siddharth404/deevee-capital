/**
 * DEEVEE CAPITAL — PROCTORED AI INTERVIEW & STARTUP DATA ROOM SIMULATION ENGINE
 *
 * Implements:
 * 1. Dynamic Resume-Aware Question Generation tailored to each of the 79 IIM Amritsar
 *    applicants' actual internships, work experience, certifications, UG specialization,
 *    and Google Form startup/market research claims.
 * 2. Adaptive VC & Startup Thinking Question Generator (Phase 2).
 * 3. Three Rotating Interactive Startup Virtual Data Room Case Sets (Phase 3),
 *    each with 3 realistic Indian startups, financial tables, and hidden red-flag footnotes.
 * 4. Assistive Rubric & Ground-Truth Evaluation Engine + Proctoring Integrity Calculator.
 */

import {
  AIInterviewQuestionTurn,
  AIInterviewScoringBreakdown,
  AIInterviewSessionRecord,
  CandidateRecord,
  ProctoringTelemetry,
  ProctoringViolationEvent,
  StartupCaseSet,
  StartupSimulationTaskSubmission,
} from "./recruitmentTypes";

// ============================================================================
// 3 ROTATING STARTUP VIRTUAL DATA ROOM CASE SETS (PHASE 3)
// ============================================================================

export const DEFAULT_STARTUP_CASE_SETS: StartupCaseSet[] = [
  {
    id: "SET_1_AGRI_SAAS_D2C",
    title: "Case Set Alpha — Agri-ColdChain vs. SME GST SaaS vs. D2C Ayurveda",
    subtitle: "Deevee Capital ₹1 Crore Seed Allocation Committee Simulation",
    briefingInstructions:
      "Three early-stage Indian startups have pitched Deevee Capital for an investment of ₹80 Lakhs – ₹1.0 Crore. Our analyst desk pulled their bank statements, GST filings, and cohort logs into the Data Room below. Audit the numbers carefully—founders often highlight vanity metrics while burying structural red flags in the footnotes.",
    timeLimitMinutes: 10,
    startups: [
      {
        id: "st-alpha-a",
        code: "STARTUP_A",
        name: "KrishiPulse ColdChain Pvt. Ltd.",
        tagline: "Solar-powered micro-cold storage & spoilage-reduction logistics for horticulture FPOs",
        sector: "Agri-Logistics & Climate Supply Chain",
        cityAndStage: "Indore, MP • Seed Stage",
        askAmountINR: "₹1.0 Crore",
        proposedValuationINR: "₹12.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"₹1.8 Crore Annualized Run-Rate across 18 micro-cold rooms in MP & Maharashtra with 92% peak utilization and positive unit EBITDA!\"",
        founderBackground:
          "2 Co-founders: Ex-ITC Agri Business Operations Manager (6 yrs) + IIT Kharagpur Mechanical Engineer (patented thermal phase-change backup panel).",
        productAndModel:
          "Deploys 5-metric-ton modular solar cold rooms at Farmer Producer Organisation (FPO) collection centres on a B2B pay-per-crate storage + mandi transport fee model.",
        financialMetricsTable: [
          {
            metric: "Last Quarter Billed Revenue (Q3)",
            founderDeckValue: "₹45.0 Lakhs (₹1.8 Cr Run-Rate)",
            dataRoomVerifiedValue: "₹42.0 Lakhs (+14% QoQ verified via GST GSTR-1)",
            auditFootnote: "Steady organic growth over 5 consecutive quarters; ₹3L difference is unbilled transit fees.",
          },
          {
            metric: "Gross Margin / Unit Economics",
            founderDeckValue: "61% Gross Margin",
            dataRoomVerifiedValue: "58% Gross Margin; 14% Positive Operating EBITDA",
            auditFootnote: "Solar power eliminates diesel generator cost; unit capex payback is 19 months per cold room.",
          },
          {
            metric: "Customer Concentration",
            founderDeckValue: "Serving 1,400+ farmers",
            dataRoomVerifiedValue: "78% of billed revenue comes from 6 large institutional FPO contracts",
            auditFootnote: "Contracts have 24-month lock-in, but top 2 FPOs account for 41% of revenue.",
          },
          {
            metric: "Working Capital / Receivables",
            founderDeckValue: "Healthy B2B collections",
            dataRoomVerifiedValue: "68-day average receivable collection cycle (Debtor Days)",
            auditFootnote: "FPOs pay after mandi settlement, tying up ~₹31 Lakhs in working capital.",
          },
        ],
        cohortAndOperatingNotes: [
          "IoT temperature logs confirm 86% average annual utilization across 18 deployed units.",
          "Zero unit churn in 24 months; 4 new FPOs in Nashik have paid 20% advance deposit for installations.",
          "Requires working-capital discipline to manage 68-day FPO payment cycle.",
        ],
        competitorLandscape: "Ecozen, Tessol, and regional cold-storage warehouses (which lack farm-gate solar modularity).",
        groundTruthClassification: "BEST_INVESTMENT_CANDIDATE",
        hiddenRedFlags: [
          "78% revenue concentration in 6 FPO contracts (41% in top 2 FPOs)",
          "68-day receivable collection cycle stretching working capital",
        ],
        primaryDiligenceRisk:
          "High customer concentration (78% revenue from 6 FPOs) and elongated 68-day debtor collection cycle.",
      },
      {
        id: "st-alpha-b",
        code: "STARTUP_B",
        name: "BillSwift AI Technologies Pvt. Ltd.",
        tagline: "Automated GST reconciliation & accounts payable workflow SaaS for Indian SMEs",
        sector: "B2B SaaS / FinTech Infrastructure",
        cityAndStage: "Pune, MH • Pre-Series A / Seed",
        askAmountINR: "₹80 Lakhs",
        proposedValuationINR: "₹16.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"₹96 Lakhs ARR across 420 active SMEs with 82% software gross margin and 0% churn in the last quarter!\"",
        founderBackground:
          "Solo Founder: Ex-Product Manager at a Tier-2 IT services firm (3 yrs); chartered accountant brother acts as part-time advisor.",
        productAndModel:
          "Cloud dashboard that scrapes supplier invoices from WhatsApp/email and reconciles against GSTR-2B.",
        financialMetricsTable: [
          {
            metric: "Annual Recurring Revenue (ARR)",
            founderDeckValue: "₹96.0 Lakhs ARR (420 SMEs × ₹1,905/mo)",
            dataRoomVerifiedValue: "₹9.6 Lakhs Actual Paying ARR (₹80,000 MRR from 80 paying SMEs)",
            auditFootnote:
              "CRITICAL FOOTNOTE: 340 out of 420 SMEs are on a 6-month 100% FREE trial distributed via CA partners. Founder multiplied all 420 free+paid users by list price to claim ₹96L ARR!",
          },
          {
            metric: "Customer Retention / Churn",
            founderDeckValue: "0% Churn in Q3",
            dataRoomVerifiedValue: "9.2% Monthly Logo Churn among paying cohorts after Month 3",
            auditFootnote: "0% churn only applied to free-trial users who haven't been billed yet.",
          },
          {
            metric: "CAC & Payback",
            founderDeckValue: "₹1,200 CAC",
            dataRoomVerifiedValue: "₹14,800 Blended CAC per *paying* SME (including CA commission)",
            auditFootnote: "With 9.2% monthly churn, average paying customer lifetime is <11 months.",
          },
          {
            metric: "Monthly Net Cash Burn",
            founderDeckValue: "Near breakeven",
            dataRoomVerifiedValue: "Burning ₹5.4 Lakhs/month (only 3.5 months runway left)",
            auditFootnote: "High AWS OCR API costs and sales team salaries.",
          },
        ],
        cohortAndOperatingNotes: [
          "Free-trial-to-paid conversion rate from previous CA batch was only 11.4%.",
          "ClearTax, Vyapar, and Zoho Books recently bundled free WhatsApp GST invoice scanning into their existing SME plans.",
        ],
        competitorLandscape: "ClearTax, Vyapar, Zoho Books, TallyPrime (incumbents offering the exact feature as a free add-on).",
        groundTruthClassification: "TRAP_INFLATED_ARR",
        hiddenRedFlags: [
          "Headline ₹96L ARR is inflated 10x by counting 340 non-paying free-trial SMEs as full-price ARR (true paying ARR is only ₹9.6 Lakhs)",
          "9.2% monthly logo churn among paying SMEs (~70% annual attrition)",
          "Incumbents (Vyapar, ClearTax, Zoho) offer the same GST OCR feature for free",
        ],
        primaryDiligenceRisk: "10x ARR misrepresentation (counting 340 free trials as paying ARR) and 9.2% monthly paid churn.",
      },
      {
        id: "st-alpha-c",
        code: "STARTUP_C",
        name: "PrakritiVeda Wellness Pvt. Ltd.",
        tagline: "Clinically positioned Ayurvedic hair-fall & skin glow gummies for Gen-Z India",
        sector: "Consumer / D2C Health & Personal Care",
        cityAndStage: "Jaipur, RJ • Seed Stage",
        askAmountINR: "₹1.0 Crore",
        proposedValuationINR: "₹20.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"₹3.6 Crore GMV Run-Rate, 65% Gross Margin, and 3.2x ROAS on Instagram/Meta ads with celebrity influencer traction!\"",
        founderBackground:
          "2 Co-founders: Former D2C performance marketer + second-generation contract nutraceutical manufacturer.",
        productAndModel:
          "Sells 30-day biotin-ashwagandha gummy packs at ₹1,300 AOV via Shopify website (80%) and quick-commerce marketplaces (20%).",
        financialMetricsTable: [
          {
            metric: "Monthly Revenue (GMV vs Net)",
            founderDeckValue: "₹30.0 Lakhs Monthly GMV (₹3.6 Cr Run-Rate)",
            dataRoomVerifiedValue: "₹18.0 Lakhs Monthly Net Realized Revenue",
            auditFootnote:
              "CRITICAL FOOTNOTE: Cash-on-Delivery Return-to-Origin (RTO) is 28%, plus 12% coupon discounts and GST reduce ₹30L Gross GMV to ₹18L actual net revenue.",
          },
          {
            metric: "Unit Economics per Order (AOV ₹1,300)",
            founderDeckValue: "65% Gross Margin (₹845 gross profit/order)",
            dataRoomVerifiedValue: "Net Contribution Margin CM2 is -₹415 (NEGATIVE) per first order",
            auditFootnote:
              "Net Realized AOV after RTO/discounts = ₹936. COGS = ₹325. Packaging & Reverse Shipping = ₹196. Meta/Google CAC = ₹1,150/customer -> Loses ₹735 on acquisition before repeat!",
          },
          {
            metric: "Cohort Repeat Purchase Rate",
            founderDeckValue: "High customer love & 4.7★ reviews",
            dataRoomVerifiedValue: "Month-3 Repeat Purchase Rate is only 11%",
            auditFootnote: "89% of customers never buy a second bottle after initial influencer discount.",
          },
          {
            metric: "Monthly Net Burn",
            founderDeckValue: "Investing for blitzscaling",
            dataRoomVerifiedValue: "Losing ₹4.2 Lakhs/month net cash burn",
            auditFootnote: "Every incremental ₹1 Lakh spent on Meta ads increases net losses.",
          },
        ],
        cohortAndOperatingNotes: [
          "Reported 3.2x ROAS was calculated by agency using Gross Checkout Value before 28% COD RTO cancellations.",
          "Low entry barrier; 40+ identical contract-manufactured gummy brands bid on the same Meta keywords.",
        ],
        competitorLandscape: "Traya, Kapiva, Mosaic Wellness (Man Matters / Be Bodywise), Oziva, Plix.",
        groundTruthClassification: "TRAP_BROKEN_UNIT_ECONOMICS",
        hiddenRedFlags: [
          "28% COD Return-to-Origin (RTO) & discounts slash ₹30L GMV down to ₹18L Net Revenue",
          "Customer Acquisition Cost (₹1,150) exceeds gross margin on ₹1,300 AOV (negative CM2 per order)",
          "Only 11% Month-3 repeat rate means LTV never recovers CAC",
        ],
        primaryDiligenceRisk: "Deeply negative unit economics (₹1,150 CAC on ₹936 net realized AOV with 28% RTO and 11% repeat rate).",
      },
    ],
    taskPrompts: {
      task1DiscrepancyAuditPrompt:
        "Audit Startup B (BillSwift AI) and Startup C (PrakritiVeda). What are their TRUE paying revenue and unit-economics figures compared to the founders' headline claims? Explain the exact accounting/operating traps hidden in the Data Room.",
      task2AllocationDecisionPrompt:
        "Deevee Capital can advance only ONE startup to the Investment Committee for a ₹1 Crore check, place ONE on Watchlist, and PASS on ONE. State your ranking and write a sharp, number-backed investment thesis for your winner.",
      task3FounderDiligencePrompt:
        "Even your winning startup has structural operational/financial risks in the Data Room. Identify its #1 risk (citing exact numbers) and write 3 tough, specific diligence questions you will ask the founders on tomorrow's IC call.",
    },
  },
  {
    id: "SET_2_EV_MEDTECH_PACKAGING",
    title: "Case Set Beta — Industrial Bio-Packaging vs. Point-of-Care MedTech vs. EV Fleet",
    subtitle: "Deevee Capital ₹1 Crore Seed Allocation Committee Simulation",
    briefingInstructions:
      "Three early-stage Indian startups have approached Deevee Capital for ₹90 Lakhs – ₹1.0 Crore. Examine the verified Data Room ledger vs. Founder Pitch Claims below and complete the 3 investment analyst tasks.",
    timeLimitMinutes: 10,
    startups: [
      {
        id: "st-beta-a",
        code: "STARTUP_A",
        name: "PackSutra BioMaterials Pvt. Ltd.",
        tagline: "Moulded agro-waste protective industrial packaging replacing thermocol (EPS) for exporters",
        sector: "Sustainable Manufacturing & B2B Packaging",
        cityAndStage: "Ahmedabad, GJ • Seed Stage",
        askAmountINR: "₹90 Lakhs",
        proposedValuationINR: "₹11.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"₹2.16 Crore Annualized Run-Rate supplying EU-compliant biodegradable cushioning to 22 pharma & electronics exporters with 14% EBITDA!\"",
        founderBackground:
          "2 Co-founders: CIPET Packaging Engineer (7 yrs at Huhtamaki) + CA with B2B industrial sales background.",
        productAndModel:
          "Converts cotton-stalk and wheat-straw pulp into custom-moulded shock-absorbent trays for electronics/pharma exporters facing EU Single-Use Plastic/EPS tariffs.",
        financialMetricsTable: [
          {
            metric: "Last Quarter Billed Revenue (Q3)",
            founderDeckValue: "₹54.0 Lakhs",
            dataRoomVerifiedValue: "₹52.8 Lakhs (+18% QoQ verified via GST & e-Way bills)",
            auditFootnote: "84% repeat order rate across 22 active B2B enterprise accounts.",
          },
          {
            metric: "Gross Margin & Operating EBITDA",
            founderDeckValue: "45% Gross Margin, 14% EBITDA",
            dataRoomVerifiedValue: "43.5% Gross Margin, 13.2% Positive Operating EBITDA",
            auditFootnote: "Verified via audited trial balance and factory power/pulp bills.",
          },
          {
            metric: "Supplier & Customer Concentration",
            founderDeckValue: "Diversified B2B pipeline",
            dataRoomVerifiedValue: "62% of raw agro-pulp comes from 2 seasonal co-operatives; top 3 pharma clients = 54% of revenue",
            auditFootnote: "Seasonal raw material price spikes in summer if storage inventory is low.",
          },
          {
            metric: "Working Capital Cycle",
            founderDeckValue: "Standard B2B credit terms",
            dataRoomVerifiedValue: "74-day average receivable cycle from enterprise pharma buyers",
            auditFootnote: "Requires ₹28 Lakhs tied up in receivables and mould tooling.",
          },
        ],
        cohortAndOperatingNotes: [
          "EU Packaging and Packaging Waste Regulation (PPWR) is forcing Indian exporters to switch away from Styrofoam/EPS.",
          "Factory currently running at 81% capacity; ₹90L raise will fund 2 automated thermoforming presses to double output.",
        ],
        competitorLandscape: "Pappco Greenware, Dharaksha Ecosolutions, traditional EPS moulders.",
        groundTruthClassification: "BEST_INVESTMENT_CANDIDATE",
        hiddenRedFlags: [
          "62% raw agro-pulp supplier concentration in 2 seasonal co-operatives",
          "74-day receivable cycle and 54% revenue concentration in top 3 pharma clients",
        ],
        primaryDiligenceRisk:
          "74-day enterprise debtor cycle, 54% revenue in top 3 clients, and 62% seasonal agro-pulp supplier concentration.",
      },
      {
        id: "st-beta-b",
        code: "STARTUP_B",
        name: "MediScan Point-of-Care Diagnostics Pvt. Ltd.",
        tagline: "Portable AI microfluidic blood analyzer for Tier-3 clinics & nursing homes",
        sector: "MedTech & Diagnostic Hardware",
        cityAndStage: "Bengaluru, KA • Seed Stage",
        askAmountINR: "₹1.0 Crore",
        proposedValuationINR: "₹22.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"310 clinics onboarded across Karnataka & AP with ₹1.5 Crore Contracted ARR on cartridge subscriptions!\"",
        founderBackground:
          "Biomedical PhD researcher + hardware engineer; no commercial medical device distribution veteran on team.",
        productAndModel:
          "Places ₹35,000 tabletop analyzer in clinics and charges ₹180 per single-use microfluidic test cartridge.",
        financialMetricsTable: [
          {
            metric: "Onboarded Clinics & ARR",
            founderDeckValue: "310 Clinics | ₹1.5 Crore ARR",
            dataRoomVerifiedValue: "Only 45 Clinics installed | ₹21.6 Lakhs Actual Annualized Revenue (₹1.8L/mo)",
            auditFootnote:
              "CRITICAL FOOTNOTE: 265 of the 310 'onboarded clinics' only signed non-binding 1-page Letters of Intent (LOIs) at medical conferences with ₹0 deposit!",
          },
          {
            metric: "Regulatory & Clinical Status",
            founderDeckValue: "ISO Certified & Ready to Scale",
            dataRoomVerifiedValue: "CDSCO Class-B commercial manufacturing license is still pending clinical concordance rework",
            auditFootnote: "Current 45 units are deployed under 'research evaluation exemption' only.",
          },
          {
            metric: "Cartridge Spoilage & Usage",
            founderDeckValue: "25 tests/day per clinic",
            dataRoomVerifiedValue: "Average clinic runs only 3.2 paid tests/day; 22% cartridge batch failure rate in >35°C heat",
            auditFootnote: "Reagent shelf-life degrades without cold-chain shipping.",
          },
          {
            metric: "Monthly Burn",
            founderDeckValue: "₹3.5 Lakhs/month",
            dataRoomVerifiedValue: "₹6.8 Lakhs/month net burn",
            auditFootnote: "Imported optical sensors increased BOM cost by 38%.",
          },
        ],
        cohortAndOperatingNotes: [
          "Non-binding LOIs were counted as ₹1.5 Cr 'Contracted ARR' assuming 15 tests/day that never materialized.",
          "Commercial billing at scale cannot legally proceed until CDSCO Class-B approval is cleared.",
        ],
        competitorLandscape: " Agappe, Transasia, Abbott i-STAT, SigTuple.",
        groundTruthClassification: "TRAP_INFLATED_ARR",
        hiddenRedFlags: [
          "265 out of 310 clinics are non-binding ₹0 LOIs; true revenue is ₹21.6L/yr (₹1.8L/mo), not ₹1.5 Cr ARR",
          "CDSCO Class-B commercial regulatory license is still pending",
          "22% cartridge batch failure in >35°C Indian summer temperatures",
        ],
        primaryDiligenceRisk: "7x ARR inflation (counting non-binding LOIs as ARR) and pending CDSCO commercial regulatory approval.",
      },
      {
        id: "st-beta-c",
        code: "STARTUP_C",
        name: "VoltCart Last-Mile EV Fleet Pvt. Ltd.",
        tagline: "Dedicated electric 3-wheeler cargo leasing fleet for quick-commerce dark stores",
        sector: "EV Mobility & Fleet Logistics",
        cityAndStage: "Gurugram, NCR • Seed Stage",
        askAmountINR: "₹1.0 Crore",
        proposedValuationINR: "₹15.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"120 EV cargo 3-wheelers deployed with Blinkit/Zepto partners generating ₹2.4 Crore Gross Annual Billing!\"",
        founderBackground:
          "2 Co-founders: Ex-operations executive at a regional courier + fleet broker.",
        productAndModel:
          "Leases third-party OEM electric 3-wheelers via NBFC debt and rents them with drivers to quick-commerce hubs.",
        financialMetricsTable: [
          {
            metric: "Fleet Utilization & Active Vehicles",
            founderDeckValue: "120 Active EVs generating ₹20L/mo",
            dataRoomVerifiedValue: "Only 86 EVs active; 34 EVs (28% of fleet) sitting idle in yard",
            auditFootnote: "High driver attrition (34% monthly) and chassis axle breakdowns leave 28% of fleet unutilized while NBFC EMIs continue.",
          },
          {
            metric: "Unit Contribution Margin per EV",
            founderDeckValue: "+₹4,800/month profit per vehicle",
            dataRoomVerifiedValue: "-₹3,400/month NET LOSS per vehicle after EMI, battery degradation & unrecovered damages",
            auditFootnote:
              "CRITICAL FOOTNOTE: Founder excluded NBFC lease principal/interest EMI and ₹4,200/mo unrecovered driver accident/challan deductions from unit P&L!",
          },
          {
            metric: "Asset Ownership & Moat",
            founderDeckValue: "Proprietary fleet tech platform",
            dataRoomVerifiedValue: "Zero proprietary IP; uses off-the-shelf ₹150/mo GPS tracker on commodity leased vehicles",
            auditFootnote: "100% commodity manpower/vehicle agency model masquerading as tech.",
          },
          {
            metric: "Monthly Net Cash Burn",
            founderDeckValue: "EBITDA Positive",
            dataRoomVerifiedValue: "Losing ₹5.1 Lakhs/month net cash outflow; overdue on 2 NBFC EMI tranches",
            auditFootnote: "Scaling the fleet from 120 to 200 vehicles will widen monthly cash losses.",
          },
        ],
        cohortAndOperatingNotes: [
          "Quick-commerce platforms capped per-order payout rates in NCR by 14% last quarter.",
          "NBFC lender has triggered a covenant warning due to 28% fleet idle rate.",
        ],
        competitorLandscape: "Zypp Electric, Euler Mobility fleet operators, MoEVing, local fleet contractors.",
        groundTruthClassification: "TRAP_BROKEN_UNIT_ECONOMICS",
        hiddenRedFlags: [
          "Negative unit economics (-₹3,400/month per vehicle) once NBFC EMI and unrecovered driver damages are included",
          "28% of fleet (34 out of 120 EVs) is sitting idle while fixed EMIs accrue",
          "Zero tech IP—commodity vehicle/manpower contractor with NBFC covenant warning",
        ],
        primaryDiligenceRisk: "Negative unit economics (-₹3,400/vehicle/mo), 28% idle fleet, and NBFC debt covenant stress.",
      },
    ],
    taskPrompts: {
      task1DiscrepancyAuditPrompt:
        "Audit Startup B (MediScan) and Startup C (VoltCart EV). Contrast the founders' headline claims against the Data Room reality and explain the exact financial/regulatory traps in each.",
      task2AllocationDecisionPrompt:
        "Rank the 3 startups (`Advance to IC for ₹1 Cr`, `Watchlist`, `Pass`) and write a rigorous numerical investment thesis defending your top pick.",
      task3FounderDiligencePrompt:
        "Identify the #1 operational/working-capital risk in your winning startup (PackSutra BioMaterials) and write 3 sharp diligence questions for the founders.",
    },
  },
  {
    id: "SET_3_FINTECH_FOOD_EDTECH",
    title: "Case Set Gamma — B2B Millet Foods vs. Career ISA EdTech vs. Kirana BNPL FinTech",
    subtitle: "Deevee Capital ₹1 Crore Seed Allocation Committee Simulation",
    briefingInstructions:
      "Three early-stage Indian startups have applied to Deevee Capital for ₹85 Lakhs – ₹1.0 Crore. Audit their verified Data Room metrics against their pitch deck claims and complete the 3 tasks.",
    timeLimitMinutes: 10,
    startups: [
      {
        id: "st-gamma-a",
        code: "STARTUP_A",
        name: "MilletCraft Institutional Foods Pvt. Ltd.",
        tagline: "Extruded value-added millet snacks, breakfast premixes & nutrition bars for institutional & B2B buyers",
        sector: "Food Processing & B2B Consumer Staples",
        cityAndStage: "Coimbatore, TN • Seed Stage",
        askAmountINR: "₹85 Lakhs",
        proposedValuationINR: "₹10.5 Crore Post-Money",
        founderHeadlineClaim:
          "\"₹1.92 Crore Annualized Net Revenue with 38% Gross Margin, positive operating cash flow, and 84% institutional reorder rate!\"",
        founderBackground:
          "2 Co-founders: CFTRI Mysuru Food Technologist (developed 9-month shelf-life ragi/jowar extrusion process without palm oil) + Ex-Britannia Regional ASM.",
        productAndModel:
          "Supplies zero-maida, zero-palm-oil millet snacks and ready-to-cook mixes to 38 corporate cafeterias, private school chains, Southern Railway catering contractors, and regional modern trade.",
        financialMetricsTable: [
          {
            metric: "Last Quarter Net Revenue (Q3)",
            founderDeckValue: "₹48.0 Lakhs",
            dataRoomVerifiedValue: "₹47.2 Lakhs (+16% QoQ verified via GST & bank inflows)",
            auditFootnote: "Clean revenue recognition; <1.5% product return/damage rate.",
          },
          {
            metric: "Gross Margin & Cash Flow",
            founderDeckValue: "38% Gross Margin | Cash-Flow Positive",
            dataRoomVerifiedValue: "37.4% Gross Margin | +₹3.1 Lakhs/month Net Operating Cash Flow",
            auditFootnote: "Automated twin-screw extruder line operates at low labour cost.",
          },
          {
            metric: "Contract Concentration",
            founderDeckValue: "38 Institutional Accounts",
            dataRoomVerifiedValue: "64% of revenue comes from 4 large institutional catering contracts up for annual tender renewal in 5 months",
            auditFootnote: "Losing any 1 of the top 4 catering groups would drop revenue by ~18%.",
          },
          {
            metric: "Raw Material Sensitivity",
            founderDeckValue: "Direct FPO sourcing",
            dataRoomVerifiedValue: "Pearl millet & ragi spot prices rose 19% YoY; contracts allow price revision only once every 6 months",
            auditFootnote: "Margin compression risk if grain inflation spikes mid-contract.",
          },
        ],
        cohortAndOperatingNotes: [
          "84% B2B repeat reorder rate over the past 12 months.",
          "Raising ₹85 Lakhs to add nitrogen-flushed retail pouch packaging line and expand into Bengaluru & Chennai corporate campuses.",
        ],
        competitorLandscape: "Slurrp Farm (D2C premium), Soulfull (Tata), local regional snack manufacturers.",
        groundTruthClassification: "BEST_INVESTMENT_CANDIDATE",
        hiddenRedFlags: [
          "64% revenue concentration in 4 institutional catering contracts up for renewal in 5 months",
          "6-month fixed-price B2B contracts exposed to 19% YoY raw millet price inflation",
        ],
        primaryDiligenceRisk:
          "64% revenue concentration in 4 annual catering tenders and raw millet inflation vs. 6-month fixed contract pricing.",
      },
      {
        id: "st-gamma-b",
        code: "STARTUP_B",
        name: "SkillBridge Career AI Pvt. Ltd.",
        tagline: "Pay-After-Placement AI & Data Science Bootcamp for Tier-2/3 Engineering Graduates",
        sector: "EdTech & Employability",
        cityAndStage: "Hyderabad, TS • Seed Stage",
        askAmountINR: "₹1.0 Crore",
        proposedValuationINR: "₹18.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"₹2.8 Crore Booked Revenue in 9 months across 700 enrolled students with ₹40,000 average course fee!\"",
        founderBackground:
          "2 Co-founders: YouTube coding content creator + former inside-sales manager at an EdTech unicorn.",
        productAndModel:
          "Enrolls students at ₹0 upfront under an Income Share Agreement (ISA) where students promise to pay ₹40,000 once placed in a job paying >₹5 LPA.",
        financialMetricsTable: [
          {
            metric: "Booked Revenue vs. Actual Cash Collected",
            founderDeckValue: "₹2.80 Crore Booked Revenue (700 × ₹40,000)",
            dataRoomVerifiedValue: "Only ₹6.4 Lakhs Actual Cash Collected in last quarter!",
            auditFootnote:
              "CRITICAL FOOTNOTE: Founder booked 100% of signed paper ISAs (700 × ₹40k = ₹2.8 Cr) as 'Revenue' on Day 1 before students even graduated or got jobs!",
          },
          {
            metric: "Placement Rate & ISA Default Rate",
            founderDeckValue: "85% Placement Assistance",
            dataRoomVerifiedValue: "Only 19% of graduated cohort got placed >₹5 LPA; 52% of placed students defaulted on ISA ECS mandates",
            auditFootnote: "Effective cash realization is less than 9% of headline 'Booked ISA value'.",
          },
          {
            metric: "Customer Acquisition Cost & Burn",
            founderDeckValue: "Organic YouTube funnel",
            dataRoomVerifiedValue: "Spent ₹24.0 Lakhs on inside-sales telecallers & ads last quarter to collect ₹6.4 Lakhs cash",
            auditFootnote: "Net cash burn is ₹6.2 Lakhs/month.",
          },
        ],
        cohortAndOperatingNotes: [
          "Unenforceable paper ISA agreements without NBFC recovery infrastructure.",
          "Entry-level IT hiring slowdown reduced placement conversion from 38% to 19%.",
        ],
        competitorLandscape: "Masai School, Newton School, NxtWave, Scaler, free YouTube/Coursera resources.",
        groundTruthClassification: "TRAP_INFLATED_ARR",
        hiddenRedFlags: [
          "₹2.8 Cr 'Booked Revenue' is uncollected paper ISAs; actual cash collected last quarter was only ₹6.4 Lakhs",
          "Only 19% placement rate above ₹5 LPA threshold and 52% ISA payment default rate among placed students",
        ],
        primaryDiligenceRisk: "Paper ISA revenue recognition fraud/inflation (₹6.4L actual cash vs ₹2.8 Cr claimed) and 52% ISA default rate.",
      },
      {
        id: "st-gamma-c",
        code: "STARTUP_C",
        name: "UdhaarFlow Kirana BNPL Pvt. Ltd.",
        tagline: "Instant 30-day unsecured inventory credit line for neighbourhood kirana stores",
        sector: "FinTech / B2B BNPL Lending",
        cityAndStage: "Mumbai, MH • Seed Stage",
        askAmountINR: "₹1.0 Crore",
        proposedValuationINR: "₹25.0 Crore Post-Money",
        founderHeadlineClaim:
          "\"₹18 Crore Annualized GTV disbursed across 2,400 kirana stores with 3x QoQ disbursement growth!\"",
        founderBackground:
          "2 Co-founders: Ex-FMCG distributor + mobile app developer (neither has prior underwriting or credit collections experience).",
        productAndModel:
          "Provides 100% FLDG (First Loss Default Guarantee) from its own equity balance sheet to a partner NBFC to disburse 30-day credit to kiranas.",
        financialMetricsTable: [
          {
            metric: "Gross Transaction Volume (GTV) vs Net Revenue",
            founderDeckValue: "₹18.0 Crore Annualized Disbursal GTV",
            dataRoomVerifiedValue: "Net Interest & Fee Margin (NIM) earned per 30-day cycle is 2.1%",
            auditFootnote: "Gross loan principal disbursed is NOT revenue; net fee income is ₹2.10 per ₹100 lent.",
          },
          {
            metric: "Credit Default & Delinquency (90+ DPD)",
            founderDeckValue: "<1.5% NPA",
            dataRoomVerifiedValue: "6.8% of disbursed principal is >90 Days Past Due (Defaulted)",
            auditFootnote:
              "CRITICAL FOOTNOTE: Founder hid defaults by 'evergreening' (issuing new loans to pay off overdue old loans). True credit loss is ₹6.80 per ₹100 lent against ₹2.10 fee income -> loses ₹4.70 per ₹100 disbursed!",
          },
          {
            metric: "Regulatory & FLDG Compliance",
            founderDeckValue: "NBFC Co-lending Partnership",
            dataRoomVerifiedValue: "100% FLDG arrangement violates RBI Digital Lending Guidelines (which cap FLDG at 5%)",
            auditFootnote: "Partner NBFC has frozen new disbursements pending RBI compliance audit.",
          },
        ],
        cohortAndOperatingNotes: [
          "Lending ₹1 Crore more equity will simply get wiped out by negative credit spread (-4.7% per cycle) and FLDG deductions.",
        ],
        competitorLandscape: "Rupifi, Progcap, Khatabook, UdaanCapital.",
        groundTruthClassification: "TRAP_BROKEN_UNIT_ECONOMICS",
        hiddenRedFlags: [
          "6.8% credit default rate vs 2.1% NIM means the company loses ₹4.70 on every ₹100 disbursed",
          "Evergreening overdue kirana loans to mask NPAs",
          "100% FLDG structure violates RBI Digital Lending Guidelines (5% FLDG cap)",
        ],
        primaryDiligenceRisk: "Negative credit spread (6.8% default vs 2.1% NIM), loan evergreening, and RBI FLDG regulatory violation.",
      },
    ],
    taskPrompts: {
      task1DiscrepancyAuditPrompt:
        "Audit Startup B (SkillBridge Career AI) and Startup C (UdhaarFlow BNPL). Expose the gap between their headline pitch numbers and the Data Room footnotes.",
      task2AllocationDecisionPrompt:
        "Select ONE startup to advance to IC for ₹85L–₹1Cr, ONE to Watchlist, and ONE to Pass. Defend your allocation with concrete numbers.",
      task3FounderDiligencePrompt:
        "What is the #1 commercial/operational risk in your winning startup (MilletCraft Foods)? Write 3 pointed diligence questions for the founders.",
    },
  },
];

// ============================================================================
// DYNAMIC RESUME-AWARE AI INTERVIEW QUESTION GENERATOR
// ============================================================================

export function selectCaseSetForCandidate(candidate: CandidateRecord): StartupCaseSet {
  const index = Math.abs((candidate.serialNo || 1) - 1) % DEFAULT_STARTUP_CASE_SETS.length;
  return DEFAULT_STARTUP_CASE_SETS[index] || DEFAULT_STARTUP_CASE_SETS[0]!;
}

export function generatePersonalizedInterviewTurns(
  candidate: CandidateRecord
): AIInterviewQuestionTurn[] {
  const firstName = candidate.fullName.split(/\s+/)[0] || candidate.fullName;
  const turns: AIInterviewQuestionTurn[] = [];

  // --------------------------------------------------------------------------
  // TURN 1 (RESUME PROBE 1): Specific Internship / Full-Time Work Experience
  // --------------------------------------------------------------------------
  const primaryWorkEx = candidate.workExperiences[0];
  const primaryInternship = candidate.internships[0];
  const secondInternship = candidate.internships[1];

  let q1Context = "";
  let q1Prompt = "";

  if (primaryWorkEx && primaryWorkEx.organization) {
    q1Context = `Full-Time Work Experience (${candidate.totalWorkExMonths} mos): ${primaryWorkEx.designation || "Associate"} @ ${primaryWorkEx.organization}`;
    q1Prompt = `Welcome ${firstName}. Let's start directly with your full-time experience as ${primaryWorkEx.designation || "a team member"} at ${primaryWorkEx.organization} (${candidate.totalWorkExMonths} months total work experience). Tell me about one specific project or problem you owned there where the initial data or assumption turned out to be wrong—how did you uncover the real bottleneck, and what measurable impact did your work have?`;
  } else if (primaryInternship && primaryInternship.organization) {
    const secondClause =
      secondInternship && secondInternship.organization
        ? ` (alongside your stint at ${secondInternship.organization})`
        : "";
    q1Context = `Internship Experience: ${primaryInternship.designation || "Intern"} @ ${primaryInternship.organization}${secondClause}`;
    q1Prompt = `Welcome ${firstName}. I'm looking at your profile—specifically your internship as ${primaryInternship.designation || "an Intern"} at ${primaryInternship.organization}${secondClause}. Beyond the high-level bullet points on a CV, walk me through one specific analysis or deliverable you personally built there: what raw data did you gather, what did you discover that wasn't obvious at first, and what was the commercial outcome?`;
  } else {
    q1Context = `Academic Background: ${candidate.ugDegree} in ${candidate.ugSpecialisation || "General Studies"}`;
    q1Prompt = `Welcome ${firstName}. Looking at your profile and your undergraduate background in ${candidate.ugDegree} (${candidate.ugSpecialisation || "Core specialization"}), tell me about the most rigorous analytical or commercial project you have executed so far. What specific hypothesis were you testing, how did you collect primary or secondary evidence, and what conclusion did the numbers force you to reach?`;
  }

  turns.push({
    id: "turn-1-resume-exp",
    questionIndex: 1,
    phase: "RESUME_PROBE",
    phaseLabel: "Phase 1 • Resume & Experience Deep-Dive",
    resumeContextCited: q1Context,
    questionPrompt: q1Prompt,
    expectedSignals: [
      "Names concrete numbers, metrics, or sample sizes from their own work",
      "Explains methodology and personal ownership ('I built/analysed') rather than vague team buzzwords",
      "Identifies a real commercial insight or trade-off",
    ],
    candidateAnswer: "",
    inputMethod: "hybrid",
    timeTakenSeconds: 0,
    wordCount: 0,
    answeredAt: null,
    turnScore: null,
    turnStrengths: [],
    turnConcerns: [],
  });

  // --------------------------------------------------------------------------
  // TURN 2 (RESUME PROBE 2): Prior Startup / Market Research Response Probe
  // --------------------------------------------------------------------------
  const rawResearchText = (candidate.startupResearchExperience || "").trim();
  const isBriefAffirmative = /^(yes|yep|yeah|done|some|briefly|worked on it|yes i have|yes,?\s*i\s*do|yes\.?)$/i.test(
    rawResearchText
  );
  const isExplicitNegative =
    !rawResearchText ||
    /^(no|na|n\.?a\.?|n\/a|nil|none|nope|not yet|no prior|not applicable|no,?\s*none\.?)$/i.test(
      rawResearchText
    );
  const isHonestReflection =
    !isBriefAffirmative &&
    !isExplicitNegative &&
    /^(i\s+(do\s+not|don['’]t|dont|haven['’]t|havent)|no\b.*experience|i\s+haven['’]t\s+worked|i\s+do\s+not\s+have\s+any\s+formal)/i.test(
      rawResearchText
    );
  const hasSubstantiveResearchClaim =
    !isBriefAffirmative && !isExplicitNegative && !isHonestReflection && rawResearchText.length > 15;

  let q2Context = "";
  let q2Prompt = "";

  if (hasSubstantiveResearchClaim) {
    const snippet =
      rawResearchText.length > 140 ? `${rawResearchText.slice(0, 137)}...` : rawResearchText;
    q2Context = `Google Form Research Claim: "${snippet}"`;
    q2Prompt = `In your application form, when asked about prior startup or market research experience, you wrote: "${snippet}". Let's pressure-test that work like an Investment Committee would: what was the single weakest assumption or unverified data point in that research, how did you cross-check the claims beyond secondary blogs, and if Deevee Capital had ₹1 Crore to invest in that space today, where in the value chain would you deploy it—or why would you stay away?`;
  } else if (isHonestReflection) {
    const snippet =
      rawResearchText.length > 130 ? `${rawResearchText.slice(0, 127)}...` : rawResearchText;
    q2Context = `Application Form Reflection: Honest declaration & interest in research ("${snippet}")`;
    q2Prompt = `In your application form, you noted candidly: "${snippet}". We appreciate candidates who are transparent about their starting point rather than inflating claims. You expressed a strong interest in understanding business models, market opportunities, and startup analysis. Suppose tomorrow morning Deevee Capital assigns you an early-stage Indian startup in a sector you know nothing about. Walk me through your exact first 3 hours of desk research: how do you go from zero knowledge to understanding how the company makes money and whether they have a real competitive advantage?`;
  } else if (isBriefAffirmative) {
    q2Context = `Application Form Response: "${rawResearchText}" (Affirmative declaration)`;
    q2Prompt = `In your application form, you answered "${rawResearchText}" when asked if you had prior experience in startup or market research. Since your form response was brief, let's explore it now: walk me through the specific startup, product, or market you analyzed. What primary data or customer signals did you uncover that weren't obvious at first, and what commercial recommendation did your research lead to?`;
  } else {
    const certOrAchievement =
      candidate.certifications.trim() ||
      candidate.achievements.trim() ||
      candidate.technicalSkills.trim() ||
      candidate.ugSpecialisation ||
      candidate.ugDegree;
    const shortRef =
      certOrAchievement.length > 110
        ? `${certOrAchievement.slice(0, 107)}...`
        : certOrAchievement || "analytical and business fundamentals";
    q2Context = `Profile Research Signal: Direct Desk Research Simulation (${shortRef})`;
    q2Prompt = `You declared on your application form that you haven't conducted formal startup research yet—which we appreciate, because we value intellectual honesty over inflated CV claims. However, your profile demonstrates strong foundation in "${shortRef}". Suppose tomorrow morning Deevee Capital assigns you to evaluate an early-stage Indian startup in a space you have never studied before. Walk me through your exact first 3 hours of desk research: how do you go from zero knowledge to understanding how the industry makes money and whether the startup has a real moat?`;
  }

  turns.push({
    id: "turn-2-resume-research",
    questionIndex: 2,
    phase: "RESUME_PROBE",
    phaseLabel: "Phase 1 • Research Claim & Methodology Probe",
    resumeContextCited: q2Context,
    questionPrompt: q2Prompt,
    expectedSignals: [
      "Demonstrates intellectual honesty about what was verified vs assumed",
      "Articulates primary/secondary triangulation (customers, competitors, unit economics, regulatory filings)",
      "Connects research findings to an actual investment decision",
    ],
    candidateAnswer: "",
    inputMethod: "hybrid",
    timeTakenSeconds: 0,
    wordCount: 0,
    answeredAt: null,
    turnScore: null,
    turnStrengths: [],
    turnConcerns: [],
  });

  // --------------------------------------------------------------------------
  // TURN 3 (RESUME PROBE 3): Technical Toolkit & Analytical Edge
  // --------------------------------------------------------------------------
  const specClause =
    candidate.ugSpecialisation && candidate.ugSpecialisation.toLowerCase() !== "general"
      ? ` (${candidate.ugSpecialisation})`
      : "";
  const skillsRef =
    candidate.technicalSkills.trim() ||
    candidate.certifications.trim() ||
    `${candidate.ugDegree}${specClause}`.trim() ||
    "Financial & Commercial Analysis";
  const shortSkills = skillsRef.length > 110 ? `${skillsRef.slice(0, 107)}...` : skillsRef;

  turns.push({
    id: "turn-3-resume-toolkit",
    questionIndex: 3,
    phase: "RESUME_PROBE",
    phaseLabel: "Phase 1 • Analytical Toolkit & Financial Rigour",
    resumeContextCited: `Technical Skills & Credentials: ${shortSkills}`,
    questionPrompt: `Your profile highlights "${shortSkills}" under your technical toolkit and analytical credentials. At Deevee Capital, interns frequently receive messy founder spreadsheets where headline revenue looks impressive but unit economics are broken. Using your analytical toolkit, what are the top 3 financial or cohort ratios you would calculate first to check if a startup's growth is healthy or artificially bought through discounting?`,
    expectedSignals: [
      "Mentions concrete unit-economics metrics (Contribution Margin CM1/CM2, CAC vs LTV, payback period, cohort retention, working capital / debtor days)",
      "Distinguishes GMV/Gross Billing from Net Realized Revenue",
      "Shows practical command of data/financial analysis",
    ],
    candidateAnswer: "",
    inputMethod: "hybrid",
    timeTakenSeconds: 0,
    wordCount: 0,
    answeredAt: null,
    turnScore: null,
    turnStrengths: [],
    turnConcerns: [],
  });

  // --------------------------------------------------------------------------
  // TURN 4 (STARTUP THINKING 1): Unconventional Indian Startup Sourcing Trail
  // --------------------------------------------------------------------------
  turns.push({
    id: "turn-4-startup-sourcing",
    questionIndex: 4,
    phase: "STARTUP_THINKING",
    phaseLabel: "Phase 2 • Startup Discovery & Sourcing Strategy",
    resumeContextCited: "Deevee Capital Mandate: Sector-Agnostic Early-Stage Sourcing (Up to ₹1 Cr)",
    questionPrompt: `Now let's shift to live startup sourcing at Deevee Capital. We are sector-agnostic and invest up to ₹1 Crore in promising early-stage Indian startups—often before they get covered in YourStory, Inc42, or TechCrunch. If we ask you this week to uncover 5 high-potential pre-seed or seed startups across India (including non-metro cities or B2B/manufacturing niches), what exact databases, public registries, incubator cohorts, or ground-up search workflows would you use to find them?`,
    expectedSignals: [
      "Names specific Indian sourcing channels (DPIIT Startup India, IIT/IIM incubator cohorts like SINE/CIIE/NSRCEL, Tracxn/Crunchbase, MCA/Zauba filings, LinkedIn stealth founder filters, B2B trade expos/IndiaMART)",
      "Explains how to filter signal from noise",
      "Avoids relying solely on mainstream news articles",
    ],
    candidateAnswer: "",
    inputMethod: "hybrid",
    timeTakenSeconds: 0,
    wordCount: 0,
    answeredAt: null,
    turnScore: null,
    turnStrengths: [],
    turnConcerns: [],
  });

  // --------------------------------------------------------------------------
  // TURN 5 (STARTUP THINKING 2): Independent Traction & TAM Verification
  // --------------------------------------------------------------------------
  turns.push({
    id: "turn-5-startup-verification",
    questionIndex: 5,
    phase: "STARTUP_THINKING",
    phaseLabel: "Phase 2 • Fact vs. Founder Hype Verification",
    resumeContextCited: "Deevee Capital Mandate: Independent Research Verification",
    questionPrompt: `Suppose a founder submits a pitch deck to Deevee Capital claiming: "We are growing 30% month-on-month in a ₹40,000 Crore Indian market and have zero direct competitors." Before we even get on a call with the founder, what 3 independent checks would you run in 45 minutes to verify (a) whether their TAM is realistic bottom-up, (b) whether their customer traction is genuine, and (c) who their real competitors or substitutes are?`,
    expectedSignals: [
      "Rejects top-down TAM; builds bottom-up TAM (# of target customers × realistic annual spend)",
      "Uses independent verification signals (MCA RoC filings, GST check, LinkedIn employee/headcount growth, Play Store/G2/Amazon review velocity, customer/distributor calls)",
      "Identifies unorganised/status-quo alternatives when a founder claims 'zero competitors'",
    ],
    candidateAnswer: "",
    inputMethod: "hybrid",
    timeTakenSeconds: 0,
    wordCount: 0,
    answeredAt: null,
    turnScore: null,
    turnStrengths: [],
    turnConcerns: [],
  });

  // --------------------------------------------------------------------------
  // TURN 6 (STARTUP THINKING 3): Critical Thinking & Reasons NOT to Invest
  // --------------------------------------------------------------------------
  turns.push({
    id: "turn-6-startup-redflags",
    questionIndex: 6,
    phase: "STARTUP_THINKING",
    phaseLabel: "Phase 2 • Commercial Scepticism & Red-Flag Detection",
    resumeContextCited: "Deevee Capital Mandate: Disciplined Capital Allocation",
    questionPrompt: `Final question before your live Startup Data Room simulation: Junior analysts often fall in love with a charismatic founder's story. Tell me about a well-known Indian startup sector or business model that looks exciting on the surface, but where you would be very cautious deploying Deevee Capital's money today. What specific structural risk—such as customer acquisition cost, regulatory dependency, or working-capital lock-up—makes it dangerous?`,
    expectedSignals: [
      "Takes a clear, non-generic analytical stance on a specific Indian sector or business model",
      "Pinpoints structural commercial risks (CAC > LTV, high COD RTO, low repeat frequency, working capital debtor days, regulatory binary risk, commodity margin compression)",
      "Demonstrates independent investor judgement",
    ],
    candidateAnswer: "",
    inputMethod: "hybrid",
    timeTakenSeconds: 0,
    wordCount: 0,
    answeredAt: null,
    turnScore: null,
    turnStrengths: [],
    turnConcerns: [],
  });

  return turns;
}

// ============================================================================
// RUBRIC & GROUND-TRUTH EVALUATION ENGINE
// ============================================================================

export function scoreSingleInterviewTurn(turn: AIInterviewQuestionTurn): {
  score: number;
  strengths: string[];
  concerns: string[];
} {
  const answer = (turn.candidateAnswer || "").trim();
  if (!answer) {
    return {
      score: 0,
      strengths: [],
      concerns: ["No response provided for this question."],
    };
  }

  const words = answer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = answer.toLowerCase();

  let score = 25; // Base participation score for non-empty answer
  const strengths: string[] = [];
  const concerns: string[] = [];

  // 1. Depth & articulation (up to 25 pts)
  if (wordCount >= 85) {
    score += 25;
    strengths.push(`Substantive, well-elaborated response (${wordCount} words)`);
  } else if (wordCount >= 45) {
    score += 18;
    strengths.push(`Clear structured response (${wordCount} words)`);
  } else if (wordCount >= 22) {
    score += 10;
    concerns.push(`Response is relatively brief (${wordCount} words); could include deeper detail`);
  } else {
    score += 3;
    concerns.push(`Very brief/superficial answer (${wordCount} words)`);
  }

  // 2. Quantitative & evidence signals (up to 20 pts)
  const hasNumbers = /(\d+%|\d+\s*(cr|crore|lakh|lakhs|months|days|x|users|customers|interviews|companies|startups)|₹\s*\d+)/i.test(
    answer
  );
  if (hasNumbers) {
    score += 18;
    strengths.push("Cites specific quantitative figures, ratios, or concrete sample sizes");
  } else {
    concerns.push("Lacks specific quantitative figures or numerical anchors");
  }

  // 3. Phase-specific VC & analytical vocabulary signals (up to 32 pts)
  const analyticalKeywords = [
    "unit economics",
    "cac",
    "ltv",
    "gross margin",
    "contribution margin",
    "ebitda",
    "working capital",
    "receivable",
    "debtor",
    "churn",
    "retention",
    "cohort",
    "payback",
    "gmv",
    "net revenue",
    "rto",
    "bottom-up",
    "tam",
    "sam",
    "som",
    "mca",
    "roc",
    "gst",
    "tracxn",
    "crunchbase",
    "dpiit",
    "incubator",
    "linkedin",
    "primary research",
    "triangulat",
    "verif",
    "assumption",
    "moat",
    "concentration",
  ];

  const matchedKeywords = analyticalKeywords.filter((kw) => lower.includes(kw));
  if (matchedKeywords.length >= 4) {
    score += 30;
    strengths.push(
      `Strong investment & research vocabulary (${matchedKeywords.slice(0, 5).join(", ")})`
    );
  } else if (matchedKeywords.length >= 2) {
    score += 20;
    strengths.push(`Demonstrates relevant commercial reasoning (${matchedKeywords.join(", ")})`);
  } else if (matchedKeywords.length === 1) {
    score += 10;
  } else {
    concerns.push("Uses general language without specific financial or verification frameworks");
  }

  // First-person ownership check for Resume Probe
  if (turn.phase === "RESUME_PROBE") {
    if (/\b(i built|i analysed|i analyzed|i conducted|i discovered|i verified|i calculated|my role|i led)\b/i.test(answer)) {
      score += 5;
      strengths.push("Clear personal ownership of past work");
    }
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    strengths,
    concerns,
  };
}

export function evaluateStartupSimulationTask(
  task: StartupSimulationTaskSubmission,
  caseSet: StartupCaseSet
): {
  task1Score: number;
  task2Score: number;
  task3Score: number;
  pickedCorrectWinningStartup: boolean;
  caughtFreeTrialArrTrap: boolean;
  caughtUnitEconomicsRtoTrap: boolean;
  identifiedWorkingCapitalRisk: boolean;
  strengths: string[];
  redFlags: string[];
} {
  const winningStartup = caseSet.startups.find(
    (s) => s.groundTruthClassification === "BEST_INVESTMENT_CANDIDATE"
  );
  const trapArrStartup = caseSet.startups.find(
    (s) => s.groundTruthClassification === "TRAP_INFLATED_ARR"
  );
  const trapUnitEconStartup = caseSet.startups.find(
    (s) => s.groundTruthClassification === "TRAP_BROKEN_UNIT_ECONOMICS"
  );

  const strengths: string[] = [];
  const redFlags: string[] = [];

  // --------------------------------------------------------------------------
  // TASK 1: Discrepancy & Red-Flag Audit (0-100 scale, weight 25%)
  // --------------------------------------------------------------------------
  const combinedAuditText = `${task.startupBTrueMetricAnalysis || ""} ${task.startupCTrueMetricAnalysis || ""} ${task.spottedRedFlagsSummary || ""}`.toLowerCase();

  let task1Score = 15;
  const caughtFreeTrialArrTrap =
    /(free trial|340|80 paying|9\.6|loi|letter of intent|non-binding|45 clinic|21\.6|1\.8|isa|booked revenue|6\.4|19%|52%)/i.test(
      combinedAuditText
    );
  const caughtUnitEconomicsRtoTrap =
    /(rto|return|28%|18 lakh|1,150|1150|cac|11%|repeat|negative|3,400|3400|idle|28% of fleet|emi|6\.8%|default|nim|fldg|evergreen)/i.test(
      combinedAuditText
    );

  if (caughtFreeTrialArrTrap) {
    task1Score += 42;
    strengths.push(
      `Caught the inflated ARR / revenue recognition trap in ${trapArrStartup?.name || "Startup B"}`
    );
  } else {
    redFlags.push(
      `Missed the footnote revenue/ARR inflation trap in ${trapArrStartup?.name || "Startup B"}`
    );
  }

  if (caughtUnitEconomicsRtoTrap) {
    task1Score += 43;
    strengths.push(
      `Exposed the negative unit economics / cash trap in ${trapUnitEconStartup?.name || "Startup C"}`
    );
  } else {
    redFlags.push(
      `Missed the negative unit contribution margin trap in ${trapUnitEconStartup?.name || "Startup C"}`
    );
  }

  // --------------------------------------------------------------------------
  // TASK 2: ₹1 Crore Capital Allocation & Investment Thesis (0-100, weight 20%)
  // --------------------------------------------------------------------------
  let task2Score = 10;
  const pickedCorrectWinningStartup = Boolean(
    winningStartup &&
      (task.selectedStartupFor1CrId === winningStartup.id ||
        task.selectedStartupFor1CrId === winningStartup.code ||
        task.selectedStartupFor1CrId.toLowerCase().includes(winningStartup.name.toLowerCase().split(" ")[0]!))
  );

  if (pickedCorrectWinningStartup) {
    task2Score += 55;
    strengths.push(
      `Correctly selected ${winningStartup?.name} as the top ₹1 Crore IC recommendation`
    );
  } else {
    redFlags.push(
      `Selected a fundamentally flawed trap startup instead of ${winningStartup?.name} for the ₹1 Crore allocation`
    );
  }

  const thesisWords = (task.investmentThesisAndNumbers || "").trim().split(/\s+/).filter(Boolean).length;
  const thesisHasNumbers = /(\d+%|\d+\s*(lakh|cr|crore|months|days)|ebitda|margin|payback|qoq)/i.test(
    task.investmentThesisAndNumbers || ""
  );

  if (thesisWords >= 35 && thesisHasNumbers) {
    task2Score += 35;
    strengths.push("Backed capital allocation thesis with verified Data Room numbers");
  } else if (thesisWords >= 18) {
    task2Score += 20;
  } else {
    redFlags.push("Investment allocation rationale lacked depth or specific financial metrics");
  }

  // --------------------------------------------------------------------------
  // TASK 3: Winning Startup Risk & 3 Founder Diligence Questions (0-100, weight 15%)
  // --------------------------------------------------------------------------
  let task3Score = 15;
  const riskAndQuestionsText = `${task.winningStartupPrimaryRisk || ""} ${task.threeFounderDiligenceQuestions || ""}`.toLowerCase();

  const identifiedWorkingCapitalRisk =
    /(concentration|78%|64%|54%|62%|6 fpo|4 large|catering|68-day|68 day|74-day|74 day|receivable|debtor|working capital|seasonal|co-operative|tender|inflation)/i.test(
      riskAndQuestionsText
    );

  if (identifiedWorkingCapitalRisk) {
    task3Score += 45;
    strengths.push(
      `Pinpointed the exact customer/supplier concentration & receivable cycle risk in ${winningStartup?.name || "Startup A"}`
    );
  } else {
    redFlags.push(
      `Did not cite the specific concentration or debtor-day working capital risk in ${winningStartup?.name || "Startup A"}`
    );
  }

  const questionCount =
    (task.threeFounderDiligenceQuestions || "").split(/\?|\n/).filter((l) => l.trim().length > 12).length;
  if (questionCount >= 3) {
    task3Score += 40;
    strengths.push("Formulated 3 specific, actionable founder diligence questions");
  } else if (questionCount >= 1) {
    task3Score += 20;
  } else {
    redFlags.push("Founder diligence questions were incomplete");
  }

  return {
    task1Score: Math.min(100, task1Score),
    task2Score: Math.min(100, task2Score),
    task3Score: Math.min(100, task3Score),
    pickedCorrectWinningStartup,
    caughtFreeTrialArrTrap,
    caughtUnitEconomicsRtoTrap,
    identifiedWorkingCapitalRisk,
    strengths,
    redFlags,
  };
}

export function computeProctoringIntegrity(
  proctoring: ProctoringTelemetry
): { score: number; status: "High Integrity" | "Review Telemetry" | "Flagged" } {
  let score = 100;
  score -= (proctoring.fullscreenExitCount || 0) * 10;
  score -= (proctoring.tabSwitchCount || 0) * 10;
  score -= Math.min(20, Math.floor((proctoring.windowBlurTotalSeconds || 0) / 15) * 5);
  score -= (proctoring.copyPasteBlockedCount || 0) * 8;
  score -= (proctoring.rapidInjectionFlags || 0) * 15;
  if (!proctoring.webcamEnabled) {
    score -= 10;
  }

  const clamped = Math.max(0, Math.min(100, score));
  const status =
    clamped >= 85 ? "High Integrity" : clamped >= 65 ? "Review Telemetry" : "Flagged";
  return { score: clamped, status };
}

export function evaluateCompleteAIInterviewSession(
  session: AIInterviewSessionRecord,
  caseSet: StartupCaseSet
): AIInterviewScoringBreakdown {
  // Score all turns
  const resumeTurns = session.turns.filter((t) => t.phase === "RESUME_PROBE");
  const startupTurns = session.turns.filter((t) => t.phase === "STARTUP_THINKING");

  for (const turn of session.turns) {
    const res = scoreSingleInterviewTurn(turn);
    turn.turnScore = res.score;
    turn.turnStrengths = res.strengths;
    turn.turnConcerns = res.concerns;
  }

  const phase1ResumeProbeScore =
    resumeTurns.length > 0
      ? Math.round(
          resumeTurns.reduce((acc, t) => acc + (t.turnScore || 0), 0) / resumeTurns.length
        )
      : 0;

  const phase2StartupThinkingScore =
    startupTurns.length > 0
      ? Math.round(
          startupTurns.reduce((acc, t) => acc + (t.turnScore || 0), 0) / startupTurns.length
        )
      : 0;

  const taskEval = session.startupTaskSubmission
    ? evaluateStartupSimulationTask(session.startupTaskSubmission, caseSet)
    : {
        task1Score: 0,
        task2Score: 0,
        task3Score: 0,
        pickedCorrectWinningStartup: false,
        caughtFreeTrialArrTrap: false,
        caughtUnitEconomicsRtoTrap: false,
        identifiedWorkingCapitalRisk: false,
        strengths: [],
        redFlags: ["Startup Data Room task was not submitted."],
      };

  const overallAiInterviewScore =
    Math.round(
      (phase1ResumeProbeScore * 0.2 +
        phase2StartupThinkingScore * 0.2 +
        taskEval.task1Score * 0.25 +
        taskEval.task2Score * 0.2 +
        taskEval.task3Score * 0.15) *
        10
    ) / 10;

  const allStrengths = [
    ...taskEval.strengths,
    ...session.turns.flatMap((t) => t.turnStrengths).slice(0, 3),
  ];
  const allRedFlags = [
    ...taskEval.redFlags,
    ...session.turns.flatMap((t) => t.turnConcerns).slice(0, 3),
  ];

  let recommendedNextStep: AIInterviewScoringBreakdown["recommendedNextStep"] = "Hold / Review";
  if (
    overallAiInterviewScore >= 75 &&
    taskEval.pickedCorrectWinningStartup &&
    session.proctoring.integrityScore >= 75
  ) {
    recommendedNextStep = "Fast-Track to Final Partner Call";
  } else if (overallAiInterviewScore >= 62 && taskEval.pickedCorrectWinningStartup) {
    recommendedNextStep = "Assign Deep-Dive Sourcing Task";
  } else if (overallAiInterviewScore < 48) {
    recommendedNextStep = "Pass";
  }

  const executiveSummary = `${session.candidateName} (${session.candidateCode}) scored ${overallAiInterviewScore}/100 across the Proctored AI Interview & Startup Deal Simulation (Resume Probe: ${phase1ResumeProbeScore}/100, Startup Thinking: ${phase2StartupThinkingScore}/100, Red-Flag Audit: ${taskEval.task1Score}/100, ₹1Cr Allocation: ${taskEval.task2Score}/100, Risk & Diligence: ${taskEval.task3Score}/100). Proctoring Integrity: ${session.proctoring.integrityScore}% (${session.proctoring.integrityStatus}).`;

  return {
    phase1ResumeProbeScore,
    phase2StartupThinkingScore,
    phase3Task1RedFlagAuditScore: taskEval.task1Score,
    phase3Task2CapitalAllocationScore: taskEval.task2Score,
    phase3Task3RiskAndFounderQuestionsScore: taskEval.task3Score,
    overallAiInterviewScore,
    pickedCorrectWinningStartup: taskEval.pickedCorrectWinningStartup,
    caughtFreeTrialArrTrap: taskEval.caughtFreeTrialArrTrap,
    caughtUnitEconomicsRtoTrap: taskEval.caughtUnitEconomicsRtoTrap,
    identifiedWorkingCapitalRisk: taskEval.identifiedWorkingCapitalRisk,
    executiveSummary,
    keyStrengths: Array.from(new Set(allStrengths)).slice(0, 6),
    keyRedFlags: Array.from(new Set(allRedFlags)).slice(0, 6),
    recommendedNextStep,
  };
}

export function createInitialProctoringTelemetry(): ProctoringTelemetry {
  return {
    webcamEnabled: false,
    micEnabled: false,
    screenShareActive: false,
    fullscreenEntered: false,
    fullscreenExitCount: 0,
    tabSwitchCount: 0,
    windowBlurCount: 0,
    windowBlurTotalSeconds: 0,
    copyPasteBlockedCount: 0,
    rapidInjectionFlags: 0,
    webcamSnapshotsCount: 0,
    screenShareSnapshotsCount: 0,
    lastHeartbeatAt: new Date().toISOString(),
    integrityScore: 100,
    integrityStatus: "High Integrity",
    events: [],
    snapshots: [],
  };
}
