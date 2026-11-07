/**
 * DEEVEE CAPITAL — MSDSM04 CANDIDATE MIGRATION & FIRESTORE SYNCHRONIZATION
 * Ingests the 8 MSc Data Science and Management (MSDSM) candidates (DVC-IIMA-080 to 087)
 * into Firestore and the local workspace database, with zero interference or data loss to existing 79 candidates.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const admin = require("firebase-admin");

// 1. Load environment variables
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

let rawKey = process.env.DVC_SERVICE_ACCOUNT_KEY || "";
if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
let creds;
try {
  creds = JSON.parse(Buffer.from(rawKey, "base64").toString("utf8"));
} catch {
  creds = JSON.parse(rawKey);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(creds),
    projectId: creds.project_id || "deeveecapital-site",
  });
}
const firestore = admin.firestore();

function generateCandidateRandomPassword(candidateCode, email) {
  const seed = `${candidateCode.trim().toUpperCase()}:${email.trim().toLowerCase()}:dvc-candidate-secure-passkey-2026`;
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  const charsUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // excludes I, O
  const charsLower = "abcdefghjkmnpqrstuvwxyz"; // excludes l, i
  const charsDigits = "23456789"; // excludes 0, 1
  const u1 = charsUpper[parseInt(hash.slice(0, 2), 16) % charsUpper.length];
  const u2 = charsUpper[parseInt(hash.slice(2, 4), 16) % charsUpper.length];
  const l1 = charsLower[parseInt(hash.slice(4, 6), 16) % charsLower.length];
  const l2 = charsLower[parseInt(hash.slice(6, 8), 16) % charsLower.length];
  const d1 = charsDigits[parseInt(hash.slice(8, 10), 16) % charsDigits.length];
  const d2 = charsDigits[parseInt(hash.slice(10, 12), 16) % charsDigits.length];
  return `DVC@${u1}${l1}${d1}${u2}${l2}${d2}`;
}

const RAW_MSDSM_STUDENTS = [
  {
    serialNo: 80,
    candidateCode: "DVC-IIMA-080",
    fullName: "Yashu Singh",
    email: "yashus.msdsm04@iimamritsar.ac.in",
    gender: "Male",
    classXPercentage: 94.6,
    classXIIPercentage: 83.2,
    ugDegree: "B.Sc. (Mathematics)",
    ugSpecialisation: "Mathematics & Science",
    ugPercentage: 67.8,
    internships: [],
    internshipSummary: "No prior formal corporate internships listed",
    totalWorkExMonths: 0,
    workExperiences: [],
    previousOrganisations: ["University of Lucknow", "IIT Ropar", "IIM Amritsar"],
    certifications: "Google Data Analytics Professional Certificate (Coursera), Excel for Data Analytics (IBM, Coursera), Apply MySQL Skills Through a Real-World Database Project (EDUCBA)",
    achievements: "Qualified NDA Written Exam (twice), CDS Written Exam, and AFCAT Written Exam (thrice) conducted by UPSC / Indian Air Force; Section Topper in Class X (94.6%)",
    otherQualifications: "M&A Target Screening & Valuation Analytics (IIT Ropar, 2026), Branding in the Age of Social Media (IIM Amritsar), AttriSense People Analytics",
    technicalSkills: "Python, SQL, DBMS (MySQL, PostgreSQL), Excel, Statistics, Power BI, MS PowerPoint, Data Analysis, Big Data & ML",
    startupResearchExperience: "Yes - Conducted market research and cultural analysis for Branding in the Age of Social Media at IIM Amritsar, alongside M&A Target Screening and Valuation Analytics modeling at IIT Ropar.",
    marketResearchExperience: "Yes - Conducted market research and cultural analysis for Branding in the Age of Social Media at IIM Amritsar, alongside M&A Target Screening and Valuation Analytics modeling at IIT Ropar.",
    profileScore: 68,
  },
  {
    serialNo: 81,
    candidateCode: "DVC-IIMA-081",
    fullName: "Gaurav Tiwari",
    email: "gauravt.msdsm04@iimamritsar.ac.in",
    gender: "Male",
    classXPercentage: 95.0,
    classXIIPercentage: 80.2,
    ugDegree: "B.Tech (Information Technology)",
    ugSpecialisation: "Information Technology",
    ugPercentage: 74.7,
    internships: [],
    internshipSummary: "Associate Analyst @ GlobalLogic (AI Data Annotation & QA, 7 mos)",
    totalWorkExMonths: 7,
    workExperiences: [
      { designation: "Associate Analyst (AI Data Annotation & QA)", organization: "GlobalLogic", durationMonths: 7 },
    ],
    previousOrganisations: ["GlobalLogic", "Rajkiya Engineering College Banda", "IIT Ropar"],
    certifications: "Data Analytics Certification (Trainity), Bootathon - REC Banda (IIT Bombay & IIT Kanpur), Soft Skills & Personality Development",
    achievements: "ITHO Silver Zone Olympiad; Winner of multiple district-level General Awareness and Aptitude competitions",
    otherQualifications: "People Analytics & AttriSense ($1.2M Net Benefit Business Case), IMDB Movie Analytics (5000+ records in Tableau), Instagram User Analytics (SQL)",
    technicalSkills: "Python, SQL, C, MySQL, MongoDB, Power BI, Tableau, Advanced Excel, MS PowerPoint, Generative AI Tools, Dashboards & KPI Reporting, Business Analysis, React.js, Node.js, Git & GitHub, Data Annotation & QA",
    startupResearchExperience: "Yes. In my media research role, I conducted systematic quantitative and qualitative content analysis on short-form video across Instagram, YouTube, and Facebook. Using an objective measurement codebook, I audited over 100 variables per video—including opening retention hooks, edit pacing, claim credibility signals, and audience discourse. I tracked platform engagement metrics (views, saves, shares) and used Python, Excel, and SQL for data entry and quality control. This work gave me hands-on experience structuring messy competitive media trends into clean, reliable market data.",
    marketResearchExperience: "Yes. In my media research role, I conducted systematic quantitative and qualitative content analysis on short-form video across Instagram, YouTube, and Facebook. Using an objective measurement codebook, I audited over 100 variables per video—including opening retention hooks, edit pacing, claim credibility signals, and audience discourse. I tracked platform engagement metrics (views, saves, shares) and used Python, Excel, and SQL for data entry and quality control. This work gave me hands-on experience structuring messy competitive media trends into clean, reliable market data.",
    profileScore: 78,
  },
  {
    serialNo: 82,
    candidateCode: "DVC-IIMA-082",
    fullName: "Anurag Bhattacharya",
    email: "anuragb.msdsm04@iimamritsar.ac.in",
    gender: "Male",
    classXPercentage: 91.0,
    classXIIPercentage: 95.83,
    ugDegree: "5 Year BS-MS Dual Degree Programme",
    ugSpecialisation: "Chemical Sciences",
    ugPercentage: 86.3,
    internships: [
      { designation: "Research Intern (Polymer Chemistry)", organization: "Indian Institute of Science (IISc) Bangalore" },
      { designation: "Teaching Assistant (200 UG Students)", organization: "IISER Kolkata" },
    ],
    internshipSummary: "Research Intern @ IISc Bangalore | Teaching Assistant @ IISER Kolkata",
    totalWorkExMonths: 0,
    workExperiences: [],
    previousOrganisations: ["IISc Bangalore", "IISER Kolkata", "IIT Ropar"],
    certifications: "TOEFL 108/120 (Advanced Business Communication & Writing), Cleared CAT Examination",
    achievements: "DST-INSPIRE Scholarship (Government of India nationally competitive science research scholarship); Ranked 2nd in entire state in Class XII CBSE (95.83%); Poster presenter at International Conference on Emerging Trends in Organometallics",
    otherQualifications: "Computational Research: DFT Simulation Data Analysis for Organochalcogenides; Statistical modeling of polymer dynamics at IISc Bangalore",
    technicalSkills: "Python (Matplotlib, NumPy), SQL (PostgreSQL 18), Power BI, MS Office (Advanced Excel, PowerPoint, Word), MATLAB, C, Linux, Origin, LaTeX",
    startupResearchExperience: "No formal startup research, but extensive academic and experimental research experience at IISc Bangalore and IISER Kolkata modeling physical systems, analyzing large empirical datasets, and applying rigorous scientific hypothesis testing.",
    marketResearchExperience: "No formal startup research, but extensive academic and experimental research experience at IISc Bangalore and IISER Kolkata modeling physical systems, analyzing large empirical datasets, and applying rigorous scientific hypothesis testing.",
    profileScore: 72,
  },
  {
    serialNo: 83,
    candidateCode: "DVC-IIMA-083",
    fullName: "Vani Garg",
    email: "vanig.msdsm04@iimamritsar.ac.in",
    gender: "Female",
    classXPercentage: 89.6,
    classXIIPercentage: 83.4,
    ugDegree: "B.Tech (CSE)",
    ugSpecialisation: "Computer Science and Engineering",
    ugPercentage: 87.5,
    internships: [
      { designation: "Frontend Developer Intern", organization: "Veersa Technologies" },
    ],
    internshipSummary: "Frontend Developer Intern @ Veersa Technologies (6 mos)",
    totalWorkExMonths: 0,
    workExperiences: [],
    previousOrganisations: ["Veersa Technologies", "Punjabi University Patiala", "IIT Ropar"],
    certifications: "AI Essentials Course (Saïd Business School, University of Oxford, 2026), Summer Training in Java (Technophilia-B Club, IIT Kharagpur)",
    achievements: "School Captain; Silver Medalist in Maths Olympiad; Techfest Club Coordinator & Organizing Committee Member (Punjabi University)",
    otherQualifications: "Built internal employee appraisal system in React.js/CSS/JS (digitizing manual paper appraisal process); Real-Time Social Media Chatting App (Java/Firebase); University Management System (MySQL/JDBC)",
    technicalSkills: "Java, Python, SQL, React.js, CSS, JavaScript, Firebase, MySQL, JDBC",
    startupResearchExperience: "No formal startup research, but practical software development experience at Veersa Technologies building enterprise appraisal workflows and analyzing user requirements in tech applications.",
    marketResearchExperience: "No formal startup research, but practical software development experience at Veersa Technologies building enterprise appraisal workflows and analyzing user requirements in tech applications.",
    profileScore: 71,
  },
  {
    serialNo: 84,
    candidateCode: "DVC-IIMA-084",
    fullName: "Monish Khan",
    email: "monishk.msdsm04@iimamritsar.ac.in",
    gender: "Male",
    classXPercentage: 87.5,
    classXIIPercentage: 73.0,
    ugDegree: "Bachelor of Commerce (B.Com)",
    ugSpecialisation: "Commerce, Accounting & Financial Management",
    ugPercentage: 62.64,
    internships: [
      { designation: "Marketing & Business Development Intern", organization: "24 Happy Pots" },
    ],
    internshipSummary: "Marketing & Business Development Intern @ 24 Happy Pots",
    totalWorkExMonths: 12,
    workExperiences: [
      { designation: "Customer Service Associate (Apprentice)", organization: "Central Bank of India", durationMonths: 12 },
    ],
    previousOrganisations: ["Central Bank of India", "24 Happy Pots", "Mahatma Gandhi Kashi Vidyapith"],
    certifications: "Course on Computer Concepts (CCC)",
    achievements: "Award Winner: Banaras Lit Fest (Poetry) & Open Mic Contest (Poetry)",
    otherQualifications: "ML-Assisted Portfolio Risk & Performance Analytics for Indian Equities (Python, SQL, Power BI); ML Employee Turnover Analytics; Core banking operations and daily ledger reconciliations at Central Bank of India",
    technicalSkills: "Python, SQL, Power BI, Advanced Excel, Financial Accounting, Core Banking Systems, Ledger Reconciliation",
    startupResearchExperience: "I have been developing my research and analytical skills through my academic projects, particularly my project titled “ML-Assisted Portfolio Risk & Performance Analytics for Indian Equities.” The project involves studying the Indian equity market, analysing stock performance, evaluating risk and return parameters, comparing investment strategies, and exploring the application of machine learning in portfolio decision-making. Through this project, I am learning to approach market-related problems systematically, interpret financial data, identify trends, and derive insights that can support business and investment decisions. While I have not yet had formal professional experience in startup research, I am keen to apply these analytical and research skills to understand startup business models, industry trends, competitors, and market opportunities.",
    marketResearchExperience: "I have been developing my research and analytical skills through my academic projects, particularly my project titled “ML-Assisted Portfolio Risk & Performance Analytics for Indian Equities.”",
    profileScore: 74,
  },
  {
    serialNo: 85,
    candidateCode: "DVC-IIMA-085",
    fullName: "Binote Biju",
    email: "binoteb.msdsm04@iimamritsar.ac.in",
    gender: "Male",
    classXPercentage: 81.91,
    classXIIPercentage: 90.92,
    ugDegree: "Bachelor of Computer Applications (BCA)",
    ugSpecialisation: "Computer Applications",
    ugPercentage: 67.9,
    internships: [
      { designation: "Department Event & AI Workshop Coordinator", organization: "Mar Elias College, Kottappady" },
    ],
    internshipSummary: "Department Event & AI Workshop Coordinator @ Mar Elias College",
    totalWorkExMonths: 0,
    workExperiences: [],
    previousOrganisations: ["Mar Elias College", "IIT Ropar", "IIM Amritsar"],
    certifications: "Coordinated and organized Artificial Intelligence (AI) Workshop at Mar Elias College",
    achievements: "State-Level Sports Championship — 2nd Place; Coordinated inter-college events and AI workshop",
    otherQualifications: "MEDNOVA MERN-Stack Hospital Management Application; End-to-End SQL Data Warehouse (IIT Ropar, 2026 - Bronze/Silver/Gold Star Schema); Customer Churn Prediction (IIM Amritsar - Random Forest, 85% Accuracy)",
    technicalSkills: "Power BI, PostgreSQL, Microsoft SQL Server, Python, Artificial Intelligence, Machine Learning, HTML, CSS, JavaScript, Excel",
    startupResearchExperience: "No formal startup research, but extensive technical project experience designing data warehouse pipelines, ETL transformations, and customer churn machine learning models in SQL and Python.",
    marketResearchExperience: "No formal startup research, but extensive technical project experience designing data warehouse pipelines, ETL transformations, and customer churn machine learning models in SQL and Python.",
    profileScore: 70,
  },
  {
    serialNo: 86,
    candidateCode: "DVC-IIMA-086",
    fullName: "Anika Bhatnagar",
    email: "anikab.msdsm04@iimamritsar.ac.in",
    gender: "Female",
    classXPercentage: 86.4,
    classXIIPercentage: 92.4,
    ugDegree: "B.A. (Hons with Research) Business Economics",
    ugSpecialisation: "Business Economics & Financial Markets",
    ugPercentage: 73.0,
    internships: [
      { designation: "Finance Intern (GL & Reconciliations)", organization: "Microtek Infrastructures Pvt Ltd" },
      { designation: "Financial Advisory Intern", organization: "Basic Financial Services Pvt Ltd" },
      { designation: "Fundraising Intern", organization: "Muskurahat Foundation" },
    ],
    internshipSummary: "Finance Intern @ Microtek Infrastructures | Financial Advisory Intern @ Basic Financial Services | Fundraising Intern @ Muskurahat Foundation",
    totalWorkExMonths: 0,
    workExperiences: [],
    previousOrganisations: ["Microtek Infrastructures Pvt Ltd", "Basic Financial Services Pvt Ltd", "Muskurahat Foundation", "Gargi College DU", "IIT Ropar"],
    certifications: "Financial Markets (Yale University), Cost and Economics in Pricing Strategy (Univ of Virginia & BCG), Trading Basics (Indian School of Business), Corporate Strategy (Univ of London), Introduction to Marketing (Wharton UPenn)",
    achievements: "Published Book Author: 'Emerging Economic and Digital Trends: Perspectives of Young Researchers' (Research: 'Generational Perceptions of AI in India'); Team Lead in Wharton Global High School Investment Competition (competing against 6,000+ teams); State-level Taekwondo Silver Medalist; College Volleyball Team Captain; Coordinator at IIT Ropar Data Science & Management Club (Stratify)",
    otherQualifications: "Finlatics Financial Markets Experience Program (Fincrux); Generational Perceptions of AI empirical study",
    technicalSkills: "RStudio, Spyder IDE, IBM SPSS, Microsoft Excel, Tally ERP, Python, Financial Statement Analysis, Financial Modelling, Statistical Analysis & Interpretation",
    startupResearchExperience: "Yes. I have experience in academic research, financial analysis, and understanding market and consumer behaviour. During my undergraduate degree in Business Economics at Gargi College, Delhi University, I conducted a year-long research project titled 'Generational Perceptions of AI in India'. The research involved studying how different generations perceive and interact with AI, analysing consumer attitudes, identifying behavioural patterns, and interpreting survey-based data. The research was subsequently published as a book titled Emerging Economic and Digital Trends: Perspectives of Young Researchers. Additionally, during my internship at Basic Financial Services, I analysed financial statements, evaluated client portfolios, and identified financial performance trends. This gave me exposure to financial analysis and understanding business performance. While I have not worked actively with a startup, I am comfortable with research-driven analysis and am keen to apply these skills.",
    marketResearchExperience: "Yes. I have experience in academic research, financial analysis, and understanding market and consumer behaviour. Conducted year-long research published as a book 'Generational Perceptions of AI in India'.",
    profileScore: 84,
  },
  {
    serialNo: 87,
    candidateCode: "DVC-IIMA-087",
    fullName: "Anshul Sharma",
    email: "anshuls.msdsm04@iimamritsar.ac.in",
    gender: "Male",
    classXPercentage: 79.6,
    classXIIPercentage: 81.2,
    ugDegree: "B.Sc. (Mathematics)",
    ugSpecialisation: "Mathematics, Physics & Computer Science",
    ugPercentage: 65.0,
    internships: [
      { designation: "Business Excellence & TQM Intern", organization: "TATA Power DDL" },
    ],
    internshipSummary: "Business Excellence & TQM Intern @ TATA Power DDL",
    totalWorkExMonths: 0,
    workExperiences: [],
    previousOrganisations: ["TATA Power DDL", "Govt Degree College Dharamshala", "IIT Ropar"],
    certifications: "Business Fundamentals for Entrepreneurs (NPTEL, IIT Bombay - Elite 83%), Foundations of Digital Marketing and E-Commerce (Google, Coursera), Discover the Art of Prompting (Google, Coursera)",
    achievements: "2nd Prize in Model Presentation Competition on Mathematics Day; 2nd Place in Extempore Competition organized by Akashwani Dharamsala",
    otherQualifications: "Ride-Sharing App Analytics Dashboard (IIT Ropar, 2026 - Relational DBMS & SQL KPI Reporting); Customer Churn Analysis (IIM Amritsar, 2026 - Random Forest ML Model & Power BI)",
    technicalSkills: "Python, SQL, MS Excel, C programming, Power BI, Exploratory Data Analysis (EDA), Statistical Analysis, Predictive Analytics, Microsoft PowerPoint, Database Management, Business Analytics",
    startupResearchExperience: "No formal startup research, but solid project experience in Business Fundamentals for Entrepreneurs (IIT Bombay), predictive churn modeling, ride-sharing SQL KPI dashboard development, and business excellence at TATA Power DDL.",
    marketResearchExperience: "No formal startup research, but solid project experience in Business Fundamentals for Entrepreneurs (IIT Bombay), predictive churn modeling, ride-sharing SQL KPI dashboard development, and business excellence at TATA Power DDL.",
    profileScore: 69,
  },
];

async function run() {
  console.log("=== STARTING MSDSM CANDIDATE INGESTION ===");

  // 1. Fetch current candidates from Firestore
  const [c0Snap, c1Snap] = await Promise.all([
    firestore.collection("workspace_settings").doc("recruitment_candidates_0").get(),
    firestore.collection("workspace_settings").doc("recruitment_candidates_1").get(),
  ]);

  const rawCandidates = [
    ...(c0Snap.exists ? c0Snap.data().items || [] : []),
    ...(c1Snap.exists ? c1Snap.data().items || [] : []),
  ];

  console.log(`Currently loaded from Firestore: ${rawCandidates.length} candidate records.`);

  // Separate real candidates (DVC-IIMA-001 to 079) and demo sample candidate (DVC-SAMPLE-001)
  const existingReal = rawCandidates.filter((c) => c.candidateCode !== "DVC-SAMPLE-001");
  const sampleCand = rawCandidates.find((c) => c.candidateCode === "DVC-SAMPLE-001") || {
    id: "cand-sample-demo",
    candidateCode: "DVC-SAMPLE-001",
    serialNo: 999,
    fullName: "Sample Candidate (Demo Sandbox)",
    email: "sample.candidate@deeveecapital.com",
    institution: "Deevee Capital Assessment Sandbox",
    cohortProgram: "MBA (Sandbox Cohort)",
    gender: "Unspecified",
    accountProvisioned: true,
    passwordConfigured: true,
    assignedPortalPassword: "DVC@Sample2026",
    inviteStatus: "Accepted",
    assessmentStatus: "Evaluated",
    applicationStatus: "Assessment Submitted",
    currentStage: "Stage 1B: AI Interview & Startup Simulation",
  };

  console.log(`Verified real candidates in Firestore: ${existingReal.length} (DVC-IIMA-001 to ${existingReal[existingReal.length - 1]?.candidateCode})`);

  const now = new Date().toISOString();

  // 2. Build the 8 new MSDSM candidates
  const newMsdsmCandidates = RAW_MSDSM_STUDENTS.map((s) => {
    const password = generateCandidateRandomPassword(s.candidateCode, s.email);

    return {
      id: `cand-iima-${String(s.serialNo).padStart(3, "0")}`,
      candidateCode: s.candidateCode,
      serialNo: s.serialNo,
      fullName: s.fullName,
      email: s.email,
      institution: "IIM Amritsar & IIT Ropar",
      cohortProgram: "MSc Data Science and Management (MSDSM)",
      gender: s.gender,
      classXPercentage: s.classXPercentage,
      classXIIPercentage: s.classXIIPercentage,
      ugDegree: s.ugDegree,
      ugSpecialisation: s.ugSpecialisation,
      ugPercentage: s.ugPercentage,
      internships: s.internships,
      internshipSummary: s.internshipSummary,
      totalWorkExMonths: s.totalWorkExMonths,
      workExperiences: s.workExperiences,
      previousOrganisations: s.previousOrganisations,
      certifications: s.certifications,
      achievements: s.achievements,
      otherQualifications: s.otherQualifications,
      technicalSkills: s.technicalSkills,
      startupResearchExperience: s.startupResearchExperience,
      marketResearchExperience: s.marketResearchExperience,
      hasSubstantiveResearchExperience: Boolean(s.startupResearchExperience && s.startupResearchExperience.length > 50 && !s.startupResearchExperience.startsWith("No")),
      originalRowPayload: {
        Name: s.fullName,
        "Email address": s.email,
        Course: "MSc Data Science and Management (MSDSM)",
      },
      currentStage: "Stage 1: Profile Screening",
      applicationStatus: "In Assessment Funnel",
      assessmentStatus: "Invited",
      assignedReviewerId: "user-siddharth",
      assignedReviewerName: "Siddharth Kaushik",
      profileScore: s.profileScore,
      stage1ProfileBreakdown: {
        researchExperienceScore: Math.round(s.profileScore * 0.3),
        startupCommercialExposureScore: Math.round(s.profileScore * 0.2),
        analyticalTechnicalToolkitScore: Math.round(s.profileScore * 0.25),
        ownershipInitiativeScore: Math.round(s.profileScore * 0.15),
        communicationAcademicContextScore: Math.round(s.profileScore * 0.1),
        totalScore: s.profileScore,
        rationale: [`MSc Data Science & Management candidate (${s.ugDegree}) evaluated for VC research & analytics`],
        hasSubstantiveResearch: Boolean(s.startupResearchExperience && s.startupResearchExperience.length > 50 && !s.startupResearchExperience.startsWith("No")),
        hasStartupOrFounderExposure: false,
      },
      stage2AptitudeScore: null,
      stage3SourcingScore: null,
      stage4CaseMemoScore: null,
      stage5InterviewScore: null,
      competencyScores: {
        researchAptitude: s.profileScore,
        startupDiscoverySourcing: Math.round(s.profileScore * 0.9),
        marketBusinessAnalysis: s.profileScore,
        financialCommercialUnderstanding: Math.round(s.profileScore * 0.95),
        criticalThinkingRisk: s.profileScore,
        communicationDocumentation: s.profileScore,
        interviewOwnership: Math.round(s.profileScore * 0.9),
      },
      finalWeightedScore: s.profileScore,
      manualScoreOverride: null,
      manualOverrideReason: null,
      reviewerDisagreementFlag: false,
      reviewerEvaluations: [],
      reviewerComments: [],
      accountProvisioned: true,
      passwordConfigured: true,
      assignedPortalPassword: password,
      inviteStatus: "Not Sent",
      inviteSentAt: null,
      inviteAcceptedAt: null,
      lastCommunicationAt: null,
      assignedAssessmentIds: [],
      assessmentDeadlineAt: null,
      activityTimeline: [
        {
          id: `act-import-${s.serialNo}`,
          action: "candidate.imported",
          summary: `Enrolled from MSc Data Science and Management (MSDSM) Batch Profile (Stage 1 Profile Score: ${s.profileScore}/100)`,
          actorName: "System Ingestion Engine",
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
  });

  console.log(`Built ${newMsdsmCandidates.length} new MSDSM candidates:`);
  newMsdsmCandidates.forEach((c) => {
    console.log(`  - ${c.candidateCode}: ${c.fullName} <${c.email}> | Cohort: ${c.cohortProgram} | Passkey: ${c.assignedPortalPassword}`);
  });

  // 3. Combine real candidates (001-079) + new MSDSM (080-087) + sample candidate
  const combinedReal = [...existingReal];
  // Replace or append candidates 80 to 87
  for (const msdsmCand of newMsdsmCandidates) {
    const existingIdx = combinedReal.findIndex((c) => c.candidateCode === msdsmCand.candidateCode || c.email === msdsmCand.email);
    if (existingIdx !== -1) {
      combinedReal[existingIdx] = msdsmCand;
    } else {
      combinedReal.push(msdsmCand);
    }
  }

  // Verify sequential order
  combinedReal.sort((a, b) => (a.serialNo || 0) - (b.serialNo || 0));

  const allCandidates = [...combinedReal, sampleCand];
  console.log(`Total candidates to save: ${allCandidates.length} (${combinedReal.length} real candidates + 1 demo candidate)`);

  // 4. Chunk into sizes of 40
  const chunkSize = 40;
  const chunkCount = Math.ceil(allCandidates.length / chunkSize);
  console.log(`Total candidate chunks: ${chunkCount} (chunk size: ${chunkSize})`);

  const batch = firestore.batch();

  for (let i = 0; i < chunkCount; i++) {
    const chunk = allCandidates.slice(i * chunkSize, (i + 1) * chunkSize);
    const chunkRef = firestore.collection("workspace_settings").doc(`recruitment_candidates_${i}`);
    batch.set(chunkRef, { chunkIndex: i, items: chunk });
    console.log(`  Chunk ${i}: items ${i * chunkSize} to ${Math.min((i + 1) * chunkSize - 1, allCandidates.length - 1)} (${chunk.length} items)`);
  }

  // Update recruitment_meta
  const recMetaRef = firestore.collection("workspace_settings").doc("recruitment_meta");
  batch.set(
    recMetaRef,
    {
      candidateChunkCount: chunkCount,
      updatedAt: now,
    },
    { merge: true }
  );

  console.log("Committing Firestore batch update...");
  await batch.commit();
  console.log("✅ Firestore batch commit successful!");

  // 5. Update local data/workspace/db.json as well
  const localDbPath = path.join(process.cwd(), "data", "workspace", "db.json");
  if (fs.existsSync(localDbPath)) {
    try {
      const localDb = JSON.parse(fs.readFileSync(localDbPath, "utf8"));
      if (localDb.recruitment) {
        localDb.recruitment.candidates = allCandidates;
        fs.writeFileSync(localDbPath, JSON.stringify(localDb, null, 2), "utf8");
        console.log(`✅ Local data cache written: ${localDbPath}`);
      }
    } catch (e) {
      console.warn("Could not update local db.json:", e);
    }
  }

  console.log("=== INGESTION & MIGRATION COMPLETE ===");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR IN MIGRATION:", err);
    process.exit(1);
  });
