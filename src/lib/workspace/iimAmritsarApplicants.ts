/**
 * DEEVEE CAPITAL — IIM AMRITSAR APPLICANT WORKBOOK DATA, XLSX PARSER & ASSESSMENT ENGINE
 * Contains all 79 verbatim applicant records from "DeeVee Capital_IIM Amritsar_Profile Sheet .xlsx",
 * a zero-dependency Node .xlsx parser, Stage 1 Profile Evaluation engine, and the VC Question Bank.
 */

import zlib from "zlib";
import {
  AssessmentQuestion,
  CandidateInternshipItem,
  CandidateRecord,
  CandidateWorkExItem,
  CompetencyScores,
  RecruitmentEmailTemplate,
  RecruitmentModuleState,
  RecruitmentScoringWeights,
  RecruitmentSettings,
  Stage1ProfileBreakdown,
} from "./recruitmentTypes";
import { DEFAULT_STARTUP_CASE_SETS } from "./aiInterviewEngine";

export const RAW_IIM_AMRITSAR_WORKBOOK_ROWS: Array<Record<string, string>> = [
  {
    "S. No.": "1",
    "Name": "Aaditya Thakkar",
    "Email address": "aadityat.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "85.5",
    "Class XII Percentage (Rounded off to two decimal places)": "82",
    "UG Degree Name": "B.pharm",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Pharmacy",
    "UG Percentage (Rounded off to two decimal places)": "75",
    "Internship 1 - Designation": "Intern",
    "Internship 1 - Organization": "Medisha MKTG",
    "Internship 2 - Designation": "Intern",
    "Internship 2 - Organization": "Lenovo",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "14",
    "Work experience 1 - Designation": "Co-Founder",
    "Work experience 1 - Organization Name": "Perennial Grandiose",
    "Work experience 1 - Duration (in months)": "12",
    "Work experience 2 - Designation": "Client Success Manager",
    "Work experience 2 - Organization Name": "FinoFY International",
    "Work experience 2 - Duration (in months)": "2",
    "Certifications\n(Mention 3-4 major certifications)": "Python Programming Fundamentals",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Chapter published in Springer Nature.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Claude code, github, mcp, applied ai",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes"
  },
  {
    "S. No.": "2",
    "Name": "Aakash Yadav",
    "Email address": "aakashy.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "79.8",
    "Class XII Percentage (Rounded off to two decimal places)": "65",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Banking and Fince",
    "UG Percentage (Rounded off to two decimal places)": "66.8",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1st in western dance competition in school \ntiol Sports 2018 – Participated in DAV tiol Sports Championship representing Maharashtra & Gujarat.\nSwachhalay NGO – Volunteered in community cleanliness and environmental awareness initiatives.\nKshitiksha Foundation – Participated in online fundraising and social impact campaigns.",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Worked and researched on Food-Tech industry, and working on a startup of own.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Base44 | Bolt.neu | Excel | powerpoint",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have practical experience in startup and market research through my entrepreneurial venture, FoodGenie, a food delivery startup. During the initial research phase, I studied the existing food delivery market, analysed competitors like Zomato and Swiggy, and identified gaps in their commission structures and pricing models. I also researched local customer preferences, restaurant requirements, and delivery feasibility to develop a sustainable hyperlocal business model. Additionally, I explored different marketing and customer acquisition strategies, especially low-cost advertising methods due to our limited budget. This experience helped me understand market positioning, competitor analysis, customer behaviour, and identifying business opportunities."
  },
  {
    "S. No.": "3",
    "Name": "Abhranil Patra",
    "Email address": "abhranilp.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "84",
    "Class XII Percentage (Rounded off to two decimal places)": "65.83",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electrical Engineering",
    "UG Percentage (Rounded off to two decimal places)": "65.7",
    "Internship 1 - Designation": "Summer Intern",
    "Internship 1 - Organization": "The West Bengal Power Development Corporation Limited (WBPDCL)",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Prompt Design in Vertex AI Skill Badge by Google, AI Skills Fest 2026 by Microsoft",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Deployed the Micro-Cap 12 open-source archive (27 GitHub Stars) to resolve a critical software availability gap which secured the #1 organic Google search position, ensuring continued access for the engineering community.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "Qualified Graduate Aptitude Test in Engineering (GATE) 2026 - Data Science and Artificial Intelligence (DA)",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, Github, Python, Google Colab, Batch Scripting",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, although I wouldn't classify it as formal work experience. It was a project undertaken as part of our MBA Marketing course, where we conducted market research on Campus and Adidas shoes, comparing customer preferences, pain points, and other factors. We also conducted approximately 24 interviews, collected customer feedback, and used the responses as primary data for our research report."
  },
  {
    "S. No.": "4",
    "Name": "ABISHEK SA",
    "Email address": "abisheks.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "91.2",
    "Class XII Percentage (Rounded off to two decimal places)": "93.8",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "COMPUTER SCIENCE ENGINEERING",
    "UG Percentage (Rounded off to two decimal places)": "69.2",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1. NCC B CERTIFICATE\n2. 3RD DELCON: 2024 IEEE INTERNATIONAL CONFERENCE CERTIFICATE(research paper presentation and publication)",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "I know how to use Microsoft Excel and Google Sheets for managing data looking at information and keeping databases. I have some understanding of PowerPoint for making presentations and reports for research. I also feel at home with LinkedIn Google Search and other online research sites to find startups look up people who start companies check on competitors and see what is happening in the market. I have also used AI tools like ChatGPT to help with research keep data in order and get things done faster. I also want to get better at analysis looking at business models and testing ERP systems.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I do not have professional experience in startup or market research. However I have an interest in understanding the startup ecosystem, new business models and market trends. I am comfortable doing research to study companies, their products and services target markets, competitors and business strategies. I understand how important it is to analyze market opportunities identify competitors and evaluate a company's scalability and growth potential. I am eager to use these skills for real‑world startup research, founder discovery and early investment analysis while also gaining experience, in the investment ecosystem."
  },
  {
    "S. No.": "5",
    "Name": "akash kajal",
    "Email address": "akashk.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "81.7",
    "Class XII Percentage (Rounded off to two decimal places)": "70.400000000000006",
    "UG Degree Name": "B.A. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "ECONOMICS",
    "UG Percentage (Rounded off to two decimal places)": "68.040000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel (data organisation, basic analysis and formulas), MS PowerPoint, MS Word, Google Sheets, Google Forms and Canva. I also have basic familiarity with R for statistical analysis through academic coursework. I am comfortable with secondary research, data interpretation, report writing and preparing presentations.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "6",
    "Name": "Amrita Sahu",
    "Email address": "amritas.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "72.2",
    "Class XII Percentage (Rounded off to two decimal places)": "57.17",
    "UG Degree Name": "B.Sc. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Zoology",
    "UG Percentage (Rounded off to two decimal places)": "82.8",
    "Internship 1 - Designation": "Business Development Associate",
    "Internship 1 - Organization": "NxtWave Disruptive Technologies Private Limited",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "PGDCA-1 year, Advance Excel",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "I am familiar with MS Excel, including Advanced Excel concepts, spreadsheet management, data organisation and basic data analysis. I have completed a PGDCA programme and Microsoft & LinkedIn's Career Essentials in Data Analysis, which have helped me develop foundational computer and analytical skills.\n\nI also have basic exposure to financial modelling through a Udemy course. Additionally, I am comfortable working with MS Office tools, particularly Excel and PowerPoint, for data handling, documentation and presentations.\n\nI have also completed a Certified Brand Manager programme and undertaken learning in Product Marketing and Agentic AI. I am keen to further strengthen my research, analytical and business evaluation skills through practical exposure.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I have prior experience working in a startup environment through my internship as a Business Development Associate at NxtWave, an ed-tech startup.\n\nDuring my internship, I interacted with prospective learners, understood their requirements, explained the company's course offerings and assisted with lead generation. This experience gave me practical exposure to customer needs, lead qualification, customer engagement and the business development process.\n\nAlthough my role did not directly involve formal startup or market research, it helped me develop an understanding of how a startup engages with its target audience and approaches customer acquisition.\n\nAdditionally, I have an interest in understanding business models, industry trends and market opportunities, and I look forward to gaining practical experience in startup sourcing, market research and investment analysis through this live project."
  },
  {
    "S. No.": "7",
    "Name": "Anas Mohammad Qureshi",
    "Email address": "anasq.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "68.599999999999994",
    "Class XII Percentage (Rounded off to two decimal places)": "82.8",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Accounting",
    "UG Percentage (Rounded off to two decimal places)": "73.599999999999994",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel,R Studio",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Na"
  },
  {
    "S. No.": "8",
    "Name": "Ansh Nitin Singhi",
    "Email address": "anshn.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "86",
    "Class XII Percentage (Rounded off to two decimal places)": "90.5",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "General Management",
    "UG Percentage (Rounded off to two decimal places)": "81.3",
    "Internship 1 - Designation": "Business Finance Intern",
    "Internship 1 - Organization": "Veekas Profile (India) PVT. LTD.",
    "Internship 2 - Designation": "Accounting & Finance",
    "Internship 2 - Organization": "Sahil Shah & Company",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1. NISM Series-XV Research Analyst.\n2. NISM Series VIII: Equity Derivatives.\n3. NCFM - Investment Analysis and Portfolio Management.\n4. Udemy - Company Valuation & Financial Modelling.",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "1. Finalist in DreaMerger: M&A Case Competition organized by St. Stephen’s.\n2. Finalist in Conflux: Finance Case Competition organized by Finance Club, DDUC.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "CFA Program Candidate – Level I (Registered for February 2027 Exam)",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel, Power BI, Tally Erp",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have prior experience in market research, sector analysis, and investment research, particularly through my Finlatics project and finance-related internships.\n\nAs part of my Finlatics project (2026), I conducted sector research, evaluated Private Equity and Venture Capital opportunities using screening techniques, valuation, and financial modelling, and assessed potential returns. I also managed a ₹2 lakh BSE 500 portfolio, applying fundamental and technical analysis to identify investment opportunities and make informed portfolio decisions.\n\nAdditionally, during my internship at Sahil Shah & Co., I prepared sector reports, identified investment trends and opportunities, evaluated different investment products based on their risk-return profiles, and conducted financial analysis and valuation of 10+ companies.\n\nMy experience at Jay Ambe Pipes further strengthened my understanding of market research, business data analysis, and translating insights into actionable business decisions.\n\nThese experiences have developed my ability to research industries, analyse market trends, evaluate business opportunities, and understand competitive positioning. I am particularly interested in applying these skills to startup research, understanding emerging business models, assessing market potential, and identifying growth opportunities."
  },
  {
    "S. No.": "9",
    "Name": "Anuj Verma",
    "Email address": "anujv.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "68.16",
    "Class XII Percentage (Rounded off to two decimal places)": "54.5",
    "UG Degree Name": "B.Com. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Marketing",
    "UG Percentage (Rounded off to two decimal places)": "66.67",
    "Internship 1 - Designation": "Digital Marketing Intern",
    "Internship 1 - Organization": "Aqva Marketing",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Fundamentals of Digital Marketing – Google \nDigital Advertising – HubSpot Academy",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Aspire Leaders Program – Selected for and completed the Harvard-founded 40-hour global leadership program",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Canva, Adobe Premiere Pro",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have experience in market research and competitive analysis through both my academic and professional experiences.\n\nDuring my internship at Aqva Marketing, I researched audience engagement patterns, content performance and posting trends to support social media campaigns and SEO initiatives. I also worked on understanding digital content strategies and how brands can improve their online visibility and engagement.\n\nAdditionally, as a co-founder and editorial member of the Finance and Corporate Cell at Banaras Hindu University, I researched business models, company strategies and industry developments. I contributed to researching and developing case studies on how businesses compete, differentiate themselves and scale.\n\nThese experiences helped me develop an understanding of competitor analysis, business models, market positioning and consumer behaviour. While my exposure to dedicated startup research is still developing, I am comfortable conducting secondary research, analysing competitors and identifying market opportunities. I am keen to apply these skills to understanding emerging businesses and identifying growth opportunities for Envoler Innovations."
  },
  {
    "S. No.": "10",
    "Name": "Anuradha Sharma",
    "Email address": "anuradhas.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "92.5",
    "Class XII Percentage (Rounded off to two decimal places)": "99.2",
    "UG Degree Name": "B.Sc.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Biology and Psychology",
    "UG Percentage (Rounded off to two decimal places)": "65.25",
    "Internship 1 - Designation": "Digital Marketing Intern",
    "Internship 1 - Organization": "Growth Experts",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1. Digital Marketing Specialist Certificate \n2. CSR Activities & Social Entrepreneurship",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "1.MHRD Scholarship (Government of India): Awarded for academic excellence during undergraduate studies.\n2. Gargi Puraskar (Government of Rajasthan): Honoured for outstanding academic performance in Class X and Class XII.\n3. Maheshwari College Merit Award: Recognized for exceptional performance in the Class XII Board Examinations.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "•Research & Analysis: Market Research, Competitor Analysis, Industry Research, Business Model Analysis and Market Trend Identification.\n•Data & Productivity Tools: MS Excel (Data Analysis, Tables, Basic Formulas), MS PowerPoint and MS Word.\n•Digital Research Tools: Google Search, Google Trends, Google Analytics and Meta Ads Manager.\n•Business Skills:Startup Research, Lead Generation, Market Mapping, Data Collection and Performance Analysis.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have prior experience in market research through my work with Nitvan Fashion, where I was involved in understanding market trends, analysing competitors, and researching customer preferences. This helped me understand brand positioning, product offerings, and changing consumer demands. I also worked on competitor and market research during my other projects, including Newton Freshen, where I conducted competitor analysis, tracked market trends, and supported market verification. These experiences helped me develop skills in secondary research, data collection, identifying market opportunities, and analysing business positioning, which I believe are relevant to startup research and sourcing."
  },
  {
    "S. No.": "11",
    "Name": "Anurag",
    "Email address": "anuraga.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "95",
    "Class XII Percentage (Rounded off to two decimal places)": "74.16",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Chemical Engineering",
    "UG Percentage (Rounded off to two decimal places)": "83.7",
    "Internship 1 - Designation": "Trainee",
    "Internship 1 - Organization": "Ion exchange (India) Limited",
    "Internship 2 - Designation": "Project Intern",
    "Internship 2 - Organization": "Rastriya Ispat Nigam Limited (VSP)",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "24",
    "Work experience 1 - Designation": "Officer, Central Technical Services",
    "Work experience 1 - Organization Name": "ION EXCHANGE INDIA LIMITED",
    "Work experience 1 - Duration (in months)": "24",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1.National Institute of Technology Hamirpur-Alumni \nAdvanced Computational Methodlogies in Industrial Applications (ACMIA-2024)\n\n2.Data analytics pro+(python)\nDucat Education",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Discipline Core Club\nMarshall May 2022– May 2024\n· Handeled a team of over 50 members and managed fests in college like Hillfair and Nimbus\nDravya Chemical Engineering Society\nCore Coordinator April 2022– May 2024\n· Delivered engaging and informative seminars and managed events",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "MySQL. PowerBI, Excel",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MySQL. PowerBI, Excel",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "n.a"
  },
  {
    "S. No.": "12",
    "Name": "Anurag Mondal",
    "Email address": "anuragm.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90",
    "Class XII Percentage (Rounded off to two decimal places)": "81.67",
    "UG Degree Name": "B.Sc. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Agriculture",
    "UG Percentage (Rounded off to two decimal places)": "75.959999999999994",
    "Internship 1 - Designation": "Content Writer",
    "Internship 1 - Organization": "Kshitiksha Foundation",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1. SEBI Investor Certification \n2. Google Certification on AI\n3. Social Media Marketing \n4. Digital Marketing",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Inter-College Football Runners Up (UG)",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Stock Market analysis, Portfolio Management, AI tools",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I had been in the stock market for around 4 years and had gained good sort of knowledge about sector analysis approach of buying stocks. Moreover, I manage my own stock portfolio of 1.5 lakhs and even after the down trend in the market my portfolio is still in profit. This proved my skill and experience in stock market and portfolio management."
  },
  {
    "S. No.": "13",
    "Name": "Arpit Nath",
    "Email address": "arpitn.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "86.83",
    "Class XII Percentage (Rounded off to two decimal places)": "83.6",
    "UG Degree Name": "B.M.S.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "General Management",
    "UG Percentage (Rounded off to two decimal places)": "61.93",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Fundamentals of digital marketing",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Published a research paper during my UG",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Filmora, Canva, VN",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "14",
    "Name": "Arsh Raj",
    "Email address": "arshr.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "74.5",
    "Class XII Percentage (Rounded off to two decimal places)": "81.2",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electronics and Communication Engineering",
    "UG Percentage (Rounded off to two decimal places)": "85.1",
    "Internship 1 - Designation": "Internship Trainee",
    "Internship 1 - Organization": "CSIR-CSIO",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1. Training of Trainers - NPTEL 2. Human Resource Development - NPTEL 3.Java for problem solving - 1 CodeChef",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "1. Actively contributed to E-Summit 2023 by onboarding multiple sponsors, showcasing negotiation and stakeholder management skills. 2.Led a team in VIT Premier League (VITPL), demonstrating leadership, team coordination, and performance under competitive pressure.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "IoT Fundamentals | Microsoft Office | R | Python | Tableau",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have some practical exposure to market research and business analysis through my academic projects, internship experience, and entrepreneurial involvement.\n\nDuring my involvement in managing a student accommodation business in Chandigarh, I gained exposure to understanding customer requirements, analysing competitor pricing, evaluating market demand, and identifying operational gaps to improve occupancy and customer retention.\n\nAdditionally, during my MBA in Business Analytics at IIM Amritsar, I have been developing my understanding of data-driven decision-making, business research, and market analysis. My technical background in Electronics and Communication Engineering and experience with Python and data analysis have also helped me develop an analytical approach to problem-solving.\n\nWhile I have not worked in a dedicated startup research role, I am comfortable researching markets, understanding business models, studying competitors, and identifying potential growth opportunities."
  },
  {
    "S. No.": "15",
    "Name": "Astha Patidar",
    "Email address": "asthap.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "85.16",
    "Class XII Percentage (Rounded off to two decimal places)": "94.6",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "84.5",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "MBM(Maa Baglamukhi) Energy Pvt. Ltd.",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "CA Firm , Patidar& Associates",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "I was topper of class 12th received throphy and cash price for the same \nI was recepient of MMVY scholarship (merit based) which covered my UG fees",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Tally ERP 9",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "16",
    "Name": "Bhushan Vishwanath Mahajan",
    "Email address": "bhushanm.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "83.4",
    "Class XII Percentage (Rounded off to two decimal places)": "57.5",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Mechatronics Engineering",
    "UG Percentage (Rounded off to two decimal places)": "83.6",
    "Internship 1 - Designation": "Engineering Intern",
    "Internship 1 - Organization": "Creative Power and Control",
    "Internship 2 - Designation": "Intern",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "15",
    "Work experience 1 - Designation": "Service Engineer",
    "Work experience 1 - Organization Name": "Creative Power and Control",
    "Work experience 1 - Duration (in months)": "15",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Google AI Essentials, Python Fundamentals for Beginners",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Python, Tableau",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "17",
    "Name": "Bommisetty Prasanth Vamshi",
    "Email address": "bommisettyv.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90",
    "Class XII Percentage (Rounded off to two decimal places)": "67.5",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Computer science and engineering",
    "UG Percentage (Rounded off to two decimal places)": "58.5",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "The joy of computing using Python bY NPTEL, IIT Madras\nCloud computing by NPTEL, IIT Kharagpur\nCybersecurity essentials by Cisco\nNetworking essentials by Cisco",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, Vs code, jupyter, git, Python, react js, C++",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I haven't worked at a firm or run a field study. But I can do a lot of research work: desk research, competitor and market sizing, survey and building frameworks like SWOT, positioning maps, and customer personas.\nI have done a project where I Conducted 25 in-depth consumer interviews to compare preferences between Wild Stone and Bellavita; identified key purchase drivers (e.g., price, fragrance longevity, brand perception) and summarized findings with recommendations."
  },
  {
    "S. No.": "18",
    "Name": "Churchill Waria",
    "Email address": "churchillw.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90.33",
    "Class XII Percentage (Rounded off to two decimal places)": "81.5",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Accounting",
    "UG Percentage (Rounded off to two decimal places)": "58.75",
    "Internship 1 - Designation": "CSA(Customer Service Associate)",
    "Internship 1 - Organization": "Cogent E Services Limited",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Academic Topper in 9th class 2018-19,",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Gold Medal in GK quiz 12th in Inceptra 2019 , Gold Medal in Suduko 12th in Inceptra 2019",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "excel , minitab",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "19",
    "Name": "Deepak Kumar",
    "Email address": "deepakk.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "72.2",
    "Class XII Percentage (Rounded off to two decimal places)": "75",
    "UG Degree Name": "B.Sc. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Biotechnology",
    "UG Percentage (Rounded off to two decimal places)": "74.8",
    "Internship 1 - Designation": "Business Development & Market Research Assistant",
    "Internship 1 - Organization": "Balaji Group Khandwa",
    "Internship 2 - Designation": "Human Resource Intern",
    "Internship 2 - Organization": "Presto Solutions (Education)",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Prompt giving and vibe coding",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I have worked as market research assistant at a real estate company called Balaji Group and my work for them was discover new areas for there project developments and which property to develop in which particular area"
  },
  {
    "S. No.": "20",
    "Name": "Dev Raj",
    "Email address": "devr.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "82",
    "Class XII Percentage (Rounded off to two decimal places)": "75.8",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Information Technology",
    "UG Percentage (Rounded off to two decimal places)": "74",
    "Internship 1 - Designation": "website engineer",
    "Internship 1 - Organization": "Omkanta University Jhansi",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel , python , sql",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Na"
  },
  {
    "S. No.": "21",
    "Name": "Devanshi Shukla",
    "Email address": "devanshis.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "97",
    "Class XII Percentage (Rounded off to two decimal places)": "89.67",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electrical engineering",
    "UG Percentage (Rounded off to two decimal places)": "83.54",
    "Internship 1 - Designation": "Intern",
    "Internship 1 - Organization": "Tata Motors Pvt. Ltd.",
    "Internship 2 - Designation": "Intern",
    "Internship 2 - Organization": "NextICron Technologies Pvt. Ltd.",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Foundational Level in Programming and Data Science – Indian Institute of Technology Madras (IIT Madras)\n\n21st Century Technologies Program Completion – Ericsson Educate\n\nGenerative AI – GUVI\n\nPython Zero to Hero – GUVI",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Qualified for College Merit Certificate (CGPA > 8.25)",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Python, MS word, MS Excel, MS PowerPoint, Power BI",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "22",
    "Name": "Dhyey Modi",
    "Email address": "dhyeym.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90.7",
    "Class XII Percentage (Rounded off to two decimal places)": "84.71",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Finance",
    "UG Percentage (Rounded off to two decimal places)": "69.33",
    "Internship 1 - Designation": "Talent Acquisition Intern",
    "Internship 1 - Organization": "Nuvama Wealth",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "11",
    "Work experience 1 - Designation": "Business Development Manager",
    "Work experience 1 - Organization Name": "Choice Connect",
    "Work experience 1 - Duration (in months)": "11",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Bloomberg Market Concepts - Bloomberg",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Office (Excel, PowerPoint, Word), Canva, Bloomberg Terminal, Naukri for candidate sourcing and database building. Comfortable with LinkedIn and email outreach, lead generation, and structured tracking of leads/pipelines. Keen to pick up startup databases like Tracxn and Crunchbase quickly.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I don’t have formal startup research experience yet, but I’ve built relevant groundwork through my roles. At Choice Connect, I compared pricing and benefits across 20+ insurers to prepare 100+ client proposals, which involved structured market comparison and evaluating options against client needs. At Nuvama, I sourced 10+ profiles daily, made ~100 cold calls a day, and maintained a tracked pipeline, which is similar to building and updating a deal-flow database and doing founder outreach. I was also a National Finalist at Yukti 2026 (SIBM Nagpur’s national case competition), where I did research-driven analysis of business problems. I’m eager to apply these skills to startup sourcing and investment research."
  },
  {
    "S. No.": "23",
    "Name": "Evuri Komalee",
    "Email address": "evurik.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "100",
    "Class XII Percentage (Rounded off to two decimal places)": "80.599999999999994",
    "UG Degree Name": "B.Com. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Accounting",
    "UG Percentage (Rounded off to two decimal places)": "79.05",
    "Internship 1 - Designation": "Business Development Executive",
    "Internship 1 - Organization": "AssetNX",
    "Internship 2 - Designation": "Marketing and Operations Intern",
    "Internship 2 - Organization": "JRS constructions",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Certified Brand Manager Program- Pheonix Global, Product Marketing, Brand & the Agentic AI Edge Workshop, Foundations: Data, Data, Everywhere",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "10 CGPA in 10th",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Sales Force , Microsoft Excel , Canva",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes , worked as business development executive in a startup , where part of the job role is to research and competitive analysis as well"
  },
  {
    "S. No.": "24",
    "Name": "Garvita",
    "Email address": "garvitag.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "93.1",
    "Class XII Percentage (Rounded off to two decimal places)": "86.6",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "70.099999999999994",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "14",
    "Work experience 1 - Designation": "Accounting Manager",
    "Work experience 1 - Organization Name": "Maan Highway Service Station",
    "Work experience 1 - Duration (in months)": "14",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "pursing CFA level 1, to appear in feb/apr 2027",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel (financial analysis, pivot tables, data analysis), Tally ERP (accounting, ledgers, GST, bank reconciliation), MS PowerPoint, AI tools for research (ChatGPT, Claude), and familiarity with LinkedIn and other sites for research and outreach.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NO"
  },
  {
    "S. No.": "25",
    "Name": "Ghanashyam Besan",
    "Email address": "ghanashyamb.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "89.83",
    "Class XII Percentage (Rounded off to two decimal places)": "85.8",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "68.33",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Promotions Head TedxSVC ,White Yellow Belt in Karate by Karate Association of India",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel, Canva",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Made report on Asics vs Adidas running shoes, Organizational behaviour Reprort on Self Awareness Trap."
  },
  {
    "S. No.": "26",
    "Name": "Gourav Kashyap",
    "Email address": "gouravk.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "66",
    "Class XII Percentage (Rounded off to two decimal places)": "86",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Business Analytics",
    "UG Percentage (Rounded off to two decimal places)": "64.7",
    "Internship 1 - Designation": "Project Head",
    "Internship 1 - Organization": "Dahleez Welfare Foundation",
    "Internship 2 - Designation": "Sales and Inventory Management Intern",
    "Internship 2 - Organization": "Khandelwal Automotive Pvt. Ltd. (Bajaj)",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "BUSINESS DATA ANALYSIS USING MS EXCEL\nDEVELOPING SOFT SKILLS AND PERSONALITY",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Secured 1st Place in the 17th State Level School Games (Cricket U-17), representing Bilaspur Zone.\nServed as an Organizing Committee Member for Inspira'24 at CHRIST University, contributing to the successful planning and execution of the university's flagship management event.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, Tableau, Power BI, Statistical Analysis, Predictive Modeling, SEO (Semrush), and Python/SQL (Data Analytics fundamentals).",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Through my academic background in Business Analytics at IIM Amritsar and Christ University, I have hands-on experience in statistical analysis, market research, and predictive modeling. I also built interactive dashboards at Phoenix Global to translate operational and market datasets into visual KPIs for strategic executive decision-making."
  },
  {
    "S. No.": "27",
    "Name": "Harsh Varma",
    "Email address": "harshv.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "91.83",
    "Class XII Percentage (Rounded off to two decimal places)": "82.4",
    "UG Degree Name": "B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Economics",
    "UG Percentage (Rounded off to two decimal places)": "84.13",
    "Internship 1 - Designation": "Finance Intern",
    "Internship 1 - Organization": "SHI India (Formerly Locuz)",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Predictive Analytics from IIM Bangalore (SWAYAM)\nPrescriptive Analytics from IIM Bangalore (SWAYAM)\nFoundations of Data Science from IIM Bangalore (SWAYAM)\nCredit Analyst Job Simulation by Standard Chartered (Forage)",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Data Analytics, STATA, Solver, Prescriptive and Predictive Analytics",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Conducted a qualitative market research on Vim vs Exo"
  },
  {
    "S. No.": "28",
    "Name": "Himanshu Ojha",
    "Email address": "himanshuo.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "88.84",
    "Class XII Percentage (Rounded off to two decimal places)": "74",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Financial Accounting",
    "UG Percentage (Rounded off to two decimal places)": "57.1",
    "Internship 1 - Designation": "Equity Research Intern",
    "Internship 1 - Organization": "Wealth Fincare",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "15",
    "Work experience 1 - Designation": "MANAGEMENT TRAINEE",
    "Work experience 1 - Organization Name": "PSRD&CO",
    "Work experience 1 - Duration (in months)": "14",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "DATA ANALYST AND EXCEL",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft tools, tableau, tally",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Fundamental Analysis & Portfolio Management\n\n* Analyzed oil & gas market trends, price movements and technical indicators to assess sector performance and investment opportunities\n* Evaluated company fundamentals and financial performance, contributing to asset allocation and portfolio management decisions\n* Maintained daily trade logs and performance reports, tracking portfolio movements and consolidating investment data for review"
  },
  {
    "S. No.": "29",
    "Name": "Kartikay Upadhyai",
    "Email address": "kartikayu.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "95.67",
    "Class XII Percentage (Rounded off to two decimal places)": "95.6",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Accounting",
    "UG Percentage (Rounded off to two decimal places)": "63.2",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "Completed CA Intermediate",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Financial Modelling \nExcel\nTableau\nData Mining\nR\nPython Basics\nFinancial Statement Analysis\nFinancial Accounting",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "30",
    "Name": "Manas Sharma",
    "Email address": "manass.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "88",
    "Class XII Percentage (Rounded off to two decimal places)": "58.4",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electricals and electronics",
    "UG Percentage (Rounded off to two decimal places)": "78",
    "Internship 1 - Designation": "Admin",
    "Internship 1 - Organization": "Rebootgut Healthcare pvt. Ltd.",
    "Internship 2 - Designation": "Admin",
    "Internship 2 - Organization": "Aditya gyan mandir school",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "The Data Science Course: Complete Data Science Bootcamp 2024 by 365 Careers\n\nPython Data Structures & Algorithms + LEETCODE Exercises by Scott Barrett\n\nPYTHON PROGRAMMING by Sheriyan Coding School 2022",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Agentic AI, Google Analytics, CRM, SEO, Canva, Python, Tableau, ERP",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I worked as a Data Analyst at Rebootgut Healthcare Pvt. Ltd. across healthcare and e-commerce. I analyzed sales/customer/operations data to surface trends and support business decisions, which is the same skill set needed to assess traction, revenue models, and scalability."
  },
  {
    "S. No.": "31",
    "Name": "Mayank",
    "Email address": "mayankma.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "93.6",
    "Class XII Percentage (Rounded off to two decimal places)": "95.2",
    "UG Degree Name": "B.Sc. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Mathematics",
    "UG Percentage (Rounded off to two decimal places)": "66.62",
    "Internship 1 - Designation": "Coordinator",
    "Internship 1 - Organization": "The Aarambh",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "NCC (B, C) certificate, AI-powered excel micro course",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Excellent contribution award at Annual Day Awards in UG, Runner up in Quiz at FIMT NCC Fest, Won group dance ARSD NCC Fest.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "32",
    "Name": "MD INTAKHAB ALAM",
    "Email address": "mda.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "95",
    "Class XII Percentage (Rounded off to two decimal places)": "81",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "ENGINEERING",
    "UG Percentage (Rounded off to two decimal places)": "73.400000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Participation on CPR and FIRE training",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, powerpoint, canva, CFAST, Pathfinder , aloha",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "33",
    "Name": "Mehak Lalwani",
    "Email address": "mehakl.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "92.8",
    "Class XII Percentage (Rounded off to two decimal places)": "74",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "General management",
    "UG Percentage (Rounded off to two decimal places)": "73.900000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "JP Morgan investment banking job simulation , Innovative learning approaches as per ordinance 14, Business analytics with excel",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "am familiar with MS Excel, MS PowerPoint, MS Word, and Google Workspace. I have knowledge of data analysis, financial analysis, SWOT analysis, and competitor analysis. I also have basic experience with Google Ads, AI-powered Shopping Ads, and business analytics tools. I am comfortable learning new software and adapting to different digital tools.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I do not have any formal work experience in startup or market research yet. However, during my BBA and MBA, I have worked on academic projects involving market research, competitor analysis, SWOT analysis, and financial analysis. These projects helped me understand market trends, customer preferences, and competitive positioning. I am eager to apply this knowledge in a practical business environment and gain hands-on experience."
  },
  {
    "S. No.": "34",
    "Name": "Mehta Yash Hiteshkumar",
    "Email address": "mehtah.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "80",
    "Class XII Percentage (Rounded off to two decimal places)": "78.61",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electronics and Communication Engineering",
    "UG Percentage (Rounded off to two decimal places)": "73.900000000000006",
    "Internship 1 - Designation": "Intern",
    "Internship 1 - Organization": "Modsonic Instruments Manufacturing Co. Pvt. Ltd",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Patent: Granted patent for an Hexapod 6 leg robot project\nResearch Paper Published about Agricultural Drones: Transforming Farming Practices with Advanced Technology.\nFil Level participation of Gujcost Robotic Competition and won a prize money of 2 lakh rupees for that\nFil Level participation for DD robocon tiol level Robotic Competition",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Excel:Data management, organising datasets, basic data analysis and maintaining structured databases.\nMicrosoft PowerPoint:Preparing research presentations, startup profiles and business reports.\nLinkedIn:Startup and founder discovery, professional networking and outreach.\nMarket & Business Research:Industry analysis, competitor benchmarking and business model research.\nTechnical Tools:HTML, CSS, JavaScript, Embedded C, Proteus and Keil µVision.\nTechnical Problem-Solving:System testing, debugging, troubleshooting and technical documentation.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have hands-on experience in market research through my involvement in my family business, particularly while exploring opportunities for business expansion into new sectors, including the event and hospitality industry.\n\nAs part of this process, I was involved in assessing local market demand, identifying potential customer segments, analysing the competitive landscape, evaluating location suitability, studying existing service offerings and understanding customer preferences and industry trends.\n\nFor instance, while evaluating the feasibility of establishing an event venue and a hotel, I contributed to understanding the existing market potential, identifying gaps in competitor offerings, assessing the target customer base and evaluating the commercial viability of these ventures. This gave me practical exposure to market opportunity assessment, competitive benchmarking and business expansion strategies.\n\nMy MBA experience has further strengthened my understanding of business models, industry analysis and strategic decision-making. I look forward to applying these skills to startup discovery, market research and preliminary investment evaluation at Deevee Capital."
  },
  {
    "S. No.": "35",
    "Name": "Mishal Mohammed P",
    "Email address": "mishalp.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "93",
    "Class XII Percentage (Rounded off to two decimal places)": "82.08",
    "UG Degree Name": "B.Voc",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Automobile Engineering",
    "UG Percentage (Rounded off to two decimal places)": "68.17",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "NCC 'C' CERTIFICATE",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "NCC-RDC ATTACHED CAMP, AIYR CAMP",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Iam familiar with most of the basic tools like Ai chatbots,Excel,Doc,Ppt,etc...",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No ,i dont have any prior experience but iam eager to learn do my best"
  },
  {
    "S. No.": "36",
    "Name": "MOHIT BUNKAR",
    "Email address": "mohitb.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "56",
    "Class XII Percentage (Rounded off to two decimal places)": "59",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "ACCOUNTING",
    "UG Percentage (Rounded off to two decimal places)": "69.2",
    "Internship 1 - Designation": "ACCOUNTING INTERN",
    "Internship 1 - Organization": "AKSHAY VIJAWAT & COMPANY, INDORE",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "SMART ACCOUNTANT CERTIFICATION - NAHATA PROFESSIONAL ACADEMY\n-TALLY PRIME\n-MICROSOFT EXCEL",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "SEMI-FINALIST, INTER- SCHOOL FOOTBALL TOURNAMENT",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "I am familiar with MS Excel, MS PowerPoint, MS Word, Google Sheets, Google Docs, and basic data analysis. I also have a basic understanding of financial analysis, internet research, and data interpretation. I am comfortable learning new tools and technologies as required.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I do not have any formal professional experience in startup or market research yet. However, I have a keen interest in understanding startup ecosystems, business models, market trends, competitor analysis, and consumer behaviour. I am eager to gain practical exposure to market research, identify business opportunities, analyse industry trends, and develop my research and analytical skills through this opportunity."
  },
  {
    "S. No.": "37",
    "Name": "Naman Jaiswal",
    "Email address": "namanj.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "82",
    "Class XII Percentage (Rounded off to two decimal places)": "91.17",
    "UG Degree Name": "B.Sc. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Physics",
    "UG Percentage (Rounded off to two decimal places)": "71.36",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Deloitte Data Analytics Job Simulation, IBM AI Fundamentals",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Office, Tableau, Python, SQL, R",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "N/A"
  },
  {
    "S. No.": "38",
    "Name": "NAVEEN R",
    "Email address": "naveenr.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90.2",
    "Class XII Percentage (Rounded off to two decimal places)": "97",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Finance",
    "UG Percentage (Rounded off to two decimal places)": "64.209999999999994",
    "Internship 1 - Designation": "Accounts and Finance Intern",
    "Internship 1 - Organization": "Accofin Consultancy, Thiruvananthapuram",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Diploma in Data Science\n\nCertified Brand Manager Program",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Python, MS Excel, Machine Learning, Deep Learning, NLP.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "39",
    "Name": "Nikhil Kumar",
    "Email address": "nikhilk.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "91.16",
    "Class XII Percentage (Rounded off to two decimal places)": "85.66",
    "UG Degree Name": "B.A. (VS)",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Tourism management",
    "UG Percentage (Rounded off to two decimal places)": "81.25",
    "Internship 1 - Designation": "Operations",
    "Internship 1 - Organization": "Travelstack tech limited",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Google- Fundamentals of Digital Marketing.\nApplied Marketing Skills for Digital Era.",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "National Service Scheme (NSS) university certificate \nPaper presenter at national seminar \nState rank 14 in Hindustan Olympiad (class 6)\nHR HEAD, NATIONAL SERVICE SCHEME 2024-2025\nCR&PR Head, Carvan Society 2024-2025",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel, PowerPoint, Word; secondary research and trend analysis; report writing; digital marketing basics (SEO, SEM, social media); Google Trends; AI tools for research.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I haven't done startup research professionally yet but I've done hands-on market and data research. In my final year, I conducted a secondary research study on tourist inflow to Char Dham Yatra with 20 years of data (2005-2025). I collected the data and organized them, identified trends and recommended actions, and presented this information at a national seminar. Analyzed business data and reports to support operational decisions at MT Industries. I want to apply that same approach to collect data, find patterns and present clear findings to startup research and sourcing."
  },
  {
    "S. No.": "40",
    "Name": "Nishtha Bhatnagar",
    "Email address": "nishthab.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "88.16",
    "Class XII Percentage (Rounded off to two decimal places)": "85.8",
    "UG Degree Name": "B.Sc.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Life Sciences",
    "UG Percentage (Rounded off to two decimal places)": "70",
    "Internship 1 - Designation": "Social Media Management",
    "Internship 1 - Organization": "Social Tantrums",
    "Internship 2 - Designation": "New Product Development",
    "Internship 2 - Organization": "Dabur",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Udemy - The complete flutter development bootcamp with dart",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Flutter for Application Development, VS code, Canva, MS Excel, MS PowerPoint, MS Word, Dart, Python.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have experience in market research through my internship at Dabur and my academic projects. During my internship in New Product Development at Dabur, I worked on multiple fragrance and personal care projects, where I conducted competitor analysis, consumer research and product positioning. I benchmarked 20+ competitor SKUs based on pricing, packaging, fragrance profiles and positioning, and also interacted with 40+ consumers to understand their preferences and feedback for the Anon range.\n\nAdditionally, I have worked on understanding consumer preferences and brand perception through academic research projects, including fragrance brands, where I analyzed consumer behavior, brand recall and price sensitivity.\n\nThese experiences have helped me develop skills in market research, identifying consumer insights, competitor benchmarking and translating research findings into practical business recommendations."
  },
  {
    "S. No.": "41",
    "Name": "P Aravind",
    "Email address": "paravind.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "94.3",
    "Class XII Percentage (Rounded off to two decimal places)": "96.5",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Finance and taxation",
    "UG Percentage (Rounded off to two decimal places)": "69.7",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Bloomberg Market Concepts Course",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "DISTRICT\nBODY BUILDING | ERNAKULAM PHYSIQUE ALLIANCE",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "42",
    "Name": "Parag Choudhary",
    "Email address": "paragc.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90.33",
    "Class XII Percentage (Rounded off to two decimal places)": "88.66",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "75.8",
    "Internship 1 - Designation": "Brand Presence & Local Intern",
    "Internship 1 - Organization": "Edunicorn Enterprises (IMS INDORE)",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Certification in Trading Basics – Indian School of Business (ISB)\nGoldman Sachs Risk Job Simulation – Forage",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "AEO/GEO,SEO, Excel, PowerPoint, google business analytics.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "43",
    "Name": "Parth shekhawat",
    "Email address": "parths.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "88.83",
    "Class XII Percentage (Rounded off to two decimal places)": "95.8",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "General Management",
    "UG Percentage (Rounded off to two decimal places)": "62.22",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Google Foundations of Project Management , Google Project Initiation: Starting a Successful Project",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "N/A",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel (Basic)\nMS PowerPoint and MS Word\nCanva (Graphic Designing and Poster Creation)\nSocial Media Management and Content Creation\nBasic Data Analysis and Presentation\nGoogle Workspace (Docs, Sheets, Slides)",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "44",
    "Name": "PAVAN S ASOK",
    "Email address": "pavana.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "89.6",
    "Class XII Percentage (Rounded off to two decimal places)": "71.2",
    "UG Degree Name": "B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "BA ANALYTICAL ECONOMICS",
    "UG Percentage (Rounded off to two decimal places)": "71.099999999999994",
    "Internship 1 - Designation": "Marketing Executive Intern",
    "Internship 1 - Organization": "JAY'S ACADEMY",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, Microsoft Power point, Tableau.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have prior experience in market research through my 8-month internship at Jay's Academy, where I conducted market research to identify opportunities, understand student preferences, and support branding and outreach activities. I also participated in promotional visits to colleges, interacting with students and supporting lead generation.\n\nAdditionally, as part of my undergraduate final-year project in Analytical Economics, I conducted primary research involving 85 fish cage farmers across Kochi and Kollam. I designed and conducted field surveys, collected primary data, and analysed it alongside secondary data to understand the sector's operational, financial, and environmental challenges. Based on the findings, I developed recommendations related to subsidy utilisation, technology adoption, and sustainability.\n\nThese experiences helped me develop skills in data collection, market understanding, consumer interaction, and research-based analysis, which I believe are relevant to startup research and market research."
  },
  {
    "S. No.": "45",
    "Name": "Prashant Sagar",
    "Email address": "prashants.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "70.3",
    "Class XII Percentage (Rounded off to two decimal places)": "57.16",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Management",
    "UG Percentage (Rounded off to two decimal places)": "66.900000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Bloomberg Market Concepts, Citi Investment Banking Simulation, Bank Of America Investment Banking Simulation, CFI Accounting Fundamentals",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "CFA Feb 2027 , NISM XV and NISM VIII",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Technical Analysis, TradingView, Microsoft Excel, Tableau, Financial Analysis, Market Research",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes. During my internship at Wiz Freight, I conducted market and company research across 70+ prospective customer accounts in pharmaceutical and FMCG sectors. I analysed company product portfolios, revenue mix, export markets and business operations to identify potential opportunities. I also researched key decision-makers in EXIM and Operations departments to support lead generation and customer acquisition. Additionally, at ClearExam, I conducted surveys to understand student pain points, customer needs and market demand."
  },
  {
    "S. No.": "46",
    "Name": "Priyanshu Daksh",
    "Email address": "priyanshud.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "83.6",
    "Class XII Percentage (Rounded off to two decimal places)": "76.2",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Computer Science Engineering",
    "UG Percentage (Rounded off to two decimal places)": "72.3",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "C++, Python",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "47",
    "Name": "Priyanshu Raj",
    "Email address": "priyanshur.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "77.33",
    "Class XII Percentage (Rounded off to two decimal places)": "71.66",
    "UG Degree Name": "B.Sc. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Mathematics",
    "UG Percentage (Rounded off to two decimal places)": "77.06",
    "Internship 1 - Designation": "E-commerce & Stock Management Intern",
    "Internship 1 - Organization": "EVOLUTION",
    "Internship 2 - Designation": "Stock Management Intern",
    "Internship 2 - Organization": "Vikash Brothers and Enterprises",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1)The Fundamental of Digital Marketing - Google, 2)Bihar State Certification in Information Technology, Language Skill and Soft Skill",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel, PowerPoint, Word, Access, Lean Six Sigma (DMAIC), Google Digital Marketing (SEO/SEM), inventory and e-commerce management systems.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, informal market research through my internships. At Evolution, I updated online catalog pricing based on live market demand trends. At Vikash Brothers and Enterprises, I analyzed customer demand trends for home appliances and forecasted inventory needs."
  },
  {
    "S. No.": "48",
    "Name": "Priyanshu Ranjan",
    "Email address": "priyanshur.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "92.16",
    "Class XII Percentage (Rounded off to two decimal places)": "91.2",
    "UG Degree Name": "B.Sc.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Mathematics",
    "UG Percentage (Rounded off to two decimal places)": "75",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Served as an anchor for school cultural events, effectively hosting programs and engaging diverse audiences.\n\nCollaborated with teachers and team members on science projects, strengthening analytical thinking, problem-\nsolving, and teamwork.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, Python",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "49",
    "Name": "Rachit Yadav",
    "Email address": "rachity.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "70.5",
    "Class XII Percentage (Rounded off to two decimal places)": "78.8",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "64.400000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Introduction to Strategy and Consulting simulation by BCG from Forage\nBusiness Analysis certificate from LinkedIn learning\nOperations management certification from LinkedIn learning\nMarketing : Strategic Framework certificate from Great Learning",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Got a certificate of appreciation from an NGO",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "Pursuing CFA L1 and NISM Series XV",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Canva, Excel, GenAI",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "50",
    "Name": "Raghav Arora",
    "Email address": "raghava.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "85",
    "Class XII Percentage (Rounded off to two decimal places)": "88.4",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "52.61",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel, Power point,Canva",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "51",
    "Name": "Rajdeep Naskar",
    "Email address": "rajdeepn.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "81.599999999999994",
    "Class XII Percentage (Rounded off to two decimal places)": "55.6",
    "UG Degree Name": "B. Des",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Game art and Design",
    "UG Percentage (Rounded off to two decimal places)": "77.5",
    "Internship 1 - Designation": "3D Modeler",
    "Internship 1 - Organization": "Vaikuntha Games",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "3DS max, MAYA, Substance painter.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I am authoring a book on Food Markets."
  },
  {
    "S. No.": "52",
    "Name": "Ramachandra Boopathi",
    "Email address": "ramachandrab.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "83.33",
    "Class XII Percentage (Rounded off to two decimal places)": "81",
    "UG Degree Name": "B.E.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electronics and Communication Engineering",
    "UG Percentage (Rounded off to two decimal places)": "80.3",
    "Internship 1 - Designation": "Research & Trading Intern",
    "Internship 1 - Organization": "MS Trading School",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Investment banking grade fincial modelling by udemy, Investment banking job simulation - Forage (J.P. Morgan)",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Won second prize in project presentation competition at Jansons College of Engineering and Technology",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Financial Modelling, Tableau, MS Excel",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "53",
    "Name": "Rejoy Pal",
    "Email address": "rejoyp.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "77.900000000000006",
    "Class XII Percentage (Rounded off to two decimal places)": "53.6",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electronics and Communication Engineering",
    "UG Percentage (Rounded off to two decimal places)": "59.44",
    "Internship 1 - Designation": "Intern",
    "Internship 1 - Organization": "Bharat Electronics Limited",
    "Internship 2 - Designation": "Intern",
    "Internship 2 - Organization": "Delhi Metro Rail Corporation (DMRC)",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "5",
    "Work experience 1 - Designation": "Brand Acquisition Specialist",
    "Work experience 1 - Organization Name": "Viral Pitch",
    "Work experience 1 - Duration (in months)": "5",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "AI Essentials by Google.\nMarketing Analytics by Meta\nDigital Marketing Fundamentals by Google",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Runner's up position in National Case competition (Building GTM Strategy for B Schools) organised by IMS x Scaler School of Business.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Excel, Microsoft Powerpoint, Tableau, R, Python",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "National Case Competition: Developed a comprehensive Go-to-Market (GTM) strategy for Scaler School of Business, securing 2nd place among 400 participating teams in a national-level case competition organised by Scaler School of Business in collaboration with IMS.\n\nMarket Research & Brand Strategy: Conducted extensive market research and consumer analysis for leading brands, including Keventers, Country Delight, Dermalogica (HUL), Powerlook, AJIO, Brigade Enterprise,  and Apollo Health generating actionable insights to strengthen marketing strategies, enhance brand awareness, and expand market reach."
  },
  {
    "S. No.": "54",
    "Name": "Rishabh Yadav",
    "Email address": "rishabhy.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "89.17",
    "Class XII Percentage (Rounded off to two decimal places)": "72.5",
    "UG Degree Name": "B.Sc.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Maths",
    "UG Percentage (Rounded off to two decimal places)": "75.33",
    "Internship 1 - Designation": "Doubt Faculty",
    "Internship 1 - Organization": "IMS India",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, Power Bi, Canva, Geni Ai",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "55",
    "Name": "Rishikesh m",
    "Email address": "rishikeshm.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "91",
    "Class XII Percentage (Rounded off to two decimal places)": "68.2",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Engineering",
    "UG Percentage (Rounded off to two decimal places)": "67.099999999999994",
    "Internship 1 - Designation": "Engineering trainee",
    "Internship 1 - Organization": "Nest sfo Technologies",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "In 2022,Business English Certificate - B1 Level, Cambridge Assessments.\nIn 2017, Led the guitar department, coordinated performers across a 53 meter stage, and ensured precise synchronisation without karaoke support through focused rehearsals and teamwork.\n▪ Set a record, earning official recognition from the Indian and Asian Book of Records.",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Creo , autocad , microsoft word , excel",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "56",
    "Name": "Rohit Kumar",
    "Email address": "rohitk.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "66.2",
    "Class XII Percentage (Rounded off to two decimal places)": "75",
    "UG Degree Name": "B.A. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Econimics",
    "UG Percentage (Rounded off to two decimal places)": "63.64",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Organized recruitment drives with my team to bring in new members.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "I am familiar with MS Excel for data analysis, financial calculations, data organisation and basic financial modelling, along with PowerPoint for preparing research presentations and reports. I have working knowledge of Bloomberg Market Concepts (BMC), which has helped me understand financial markets, economic indicators and capital markets. I am also familiar with Canva for presentations and visual communication, and LinkedIn for professional networking and business research. Additionally, I have an understanding of business research, competitor analysis, market assessment and basic financial analysis. I am keen to further develop my skills in tools such as Tracxn and Crunchbase.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have relevant experience in business research and market understanding through my academic and professional engagements.\n\nDuring my internship as a Business Development Intern at Younity, I gained exposure to understanding customer requirements, identifying potential prospects, pitching skill development courses and communicating the value proposition of the business. This helped me develop an understanding of customer behaviour, market needs and business positioning.\n\nAdditionally, during my graduation in Economics, I worked on a research paper that strengthened my research, data interpretation and analytical skills. I have also been involved in social entrepreneurship initiatives, including supporting women entrepreneurs in selling handmade chocolates and scented candles and contributing to the development of Rainbow Brew, a transgender-led entrepreneurial initiative.\n\nThese experiences have helped me understand business models, customer segments, market opportunities and the challenges faced by emerging ventures. I am particularly interested in applying these skills to startup discovery, industry research, competitor benchmarking and preliminary investment evaluation."
  },
  {
    "S. No.": "57",
    "Name": "Sakshi Kumari",
    "Email address": "sakshik.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "82.17",
    "Class XII Percentage (Rounded off to two decimal places)": "82.2",
    "UG Degree Name": "B.Com. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Accounting and Finance",
    "UG Percentage (Rounded off to two decimal places)": "72.53",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1. Excel Skills for Business: Essentials \n2. Introduction to Data Analytics",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Data Analytics and Excel",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "58",
    "Name": "Sakshi Singh",
    "Email address": "sakshis.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "91.5",
    "Class XII Percentage (Rounded off to two decimal places)": "84.8",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Electronics and Communication Engineering",
    "UG Percentage (Rounded off to two decimal places)": "65.2",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "DBMS And Data Visualisation using Python certifications from Infosys Springboard",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel, Arduino, Embedded Systems",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "59",
    "Name": "Sanuj sharma",
    "Email address": "sanujs.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "85.5",
    "Class XII Percentage (Rounded off to two decimal places)": "71.2",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Civil engineering",
    "UG Percentage (Rounded off to two decimal places)": "84.5",
    "Internship 1 - Designation": "Graduate engineer trainee",
    "Internship 1 - Organization": "Bl kashyap",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "19",
    "Work experience 1 - Designation": "Manager",
    "Work experience 1 - Organization Name": "Ruchi granite",
    "Work experience 1 - Duration (in months)": "19",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Diploma in building design,course of NX CAD essential",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Got mission aajeevika scholarship,a CSR by samsung C&T india,\nGot selected for proficient course , mission aajeevika scholarship,a CSR by samsung C&T india",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "project planning, operation management",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "i have worked in my family business and worked during covid time when sales were struggling so i worked to understand consumer needs and help to increase my revenue"
  },
  {
    "S. No.": "60",
    "Name": "Shalini",
    "Email address": "shalinis.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "89.3",
    "Class XII Percentage (Rounded off to two decimal places)": "71",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Computer science engineering (Data Science)",
    "UG Percentage (Rounded off to two decimal places)": "80.400000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Certification in Excel , Certification in Effective Leadership by HP Foundation",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Research Paper Publication : IEEE - DOI: 10.1109/ACET61898.2024.10730281",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Google analytics, Machine learning, Google ads , Excel , Canva , power BI",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "61",
    "Name": "Shashwati Mahant",
    "Email address": "shashwatim.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "93.83",
    "Class XII Percentage (Rounded off to two decimal places)": "91.2",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Finance",
    "UG Percentage (Rounded off to two decimal places)": "76.06",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "NISM Research Analyst certificate\nZerodha varsity- Stock Market Basics \nZerodha varsity- Technical Analysis \nZerodha varsity- Fundamental Analysis",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Entrepreneurship Mela- Merit certificate- 2nd in sales and ethics category",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "62",
    "Name": "SHIVAM RAWAT",
    "Email address": "shivamr.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "82",
    "Class XII Percentage (Rounded off to two decimal places)": "85.4",
    "UG Degree Name": "B.Sc.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "MAathematics",
    "UG Percentage (Rounded off to two decimal places)": "59.85",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Represented Uttarakhand in the MEN National Target Ball Tournament and in the MIX(M&W) National Target Ball Tournament. Participated in the NORTH ZONE Inter-University Football Tournament and Represented Udham Singh Nagar in the U19 Boys' State Football Championship.",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Qualified the NDA written examination thrice and qualified the AFCAT written examination once",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Excel: Data analysis, Pivot Tables, VLOOKUP, XLOOKUP, and basic data visualisation.\nMicrosoft PowerPoint & Word: Presentations, reports, and documentation.\nTableau: Data visualisation, interactive dashboards, and business reporting.\nGoogle Workspace: Docs, Sheets, Slides, and collaborative tools.\nCanva: Designing presentations, posters, and social media creatives.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have experience in market research through an academic marketing project comparing Nescafé and Bru coffee. As part of this project, I conducted 20 qualitative interviews with consumers to understand their brand preferences, purchasing behaviour, and the reasons behind their choices. I analysed their responses to identify key factors influencing brand perception, such as taste, affordability, availability, brand image, and emotional connection. This experience helped me develop skills in primary research, consumer behaviour analysis, data interpretation, and deriving actionable marketing insights."
  },
  {
    "S. No.": "63",
    "Name": "Shrey Mishra",
    "Email address": "shreym.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "78.2",
    "Class XII Percentage (Rounded off to two decimal places)": "87",
    "UG Degree Name": "B.Com. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Accounting",
    "UG Percentage (Rounded off to two decimal places)": "78.680000000000007",
    "Internship 1 - Designation": "Strategy Intern",
    "Internship 1 - Organization": "At Litti King",
    "Internship 2 - Designation": "Financial Analyst",
    "Internship 2 - Organization": "Margin Sentiment Advisorys Pvt Ltd",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "13",
    "Work experience 1 - Designation": "Tax Specialist",
    "Work experience 1 - Organization Name": "Vialto Partners",
    "Work experience 1 - Duration (in months)": "6",
    "Work experience 2 - Designation": "Associate Consultant",
    "Work experience 2 - Organization Name": "Nation With Namo",
    "Work experience 2 - Duration (in months)": "7",
    "Certifications\n(Mention 3-4 major certifications)": "NISM (Research Analyst), Mckinsey Forward, Private Equity and Venture Capital (Coursera), CA Foundation, SEBI Investor Certification",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "2nd — Big Bankruptcy Competition (BESC): revival strategy for Reliance Communications\n3rd — Bidding Wars (Scottish Church College).",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, Google Sheets, Powerpoint, Power BI",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I have worked two startups one was a foodchain the other one a policy consulting, in both cases a market research was required one for a product the other for a particular policy. I have also worked on three projects where market research was required two of them being startup research my task was to take a particular sector like fintech, EV etc and look at the upcoming companies ratios of the industry an if there is a good potential startup to invest in."
  },
  {
    "S. No.": "64",
    "Name": "Shrishti Devda",
    "Email address": "shrishtid.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "83.04",
    "Class XII Percentage (Rounded off to two decimal places)": "76.2",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "General Management",
    "UG Percentage (Rounded off to two decimal places)": "81.2",
    "Internship 1 - Designation": "Human Resource Intern",
    "Internship 1 - Organization": "Simtrak Solutions",
    "Internship 2 - Designation": "Junior Accountant Intern",
    "Internship 2 - Organization": "MMC Convert",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Swayam- Foreign Exchange Market(IIM Bangalore)",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Excel, Financial accounting, Financial system analysis",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "65",
    "Name": "Shriyash Ashok Olambe",
    "Email address": "shriyasho.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "91.5",
    "Class XII Percentage (Rounded off to two decimal places)": "94.83",
    "UG Degree Name": "B.E.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Computer Engineering",
    "UG Percentage (Rounded off to two decimal places)": "69.400000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "1) Python Certification(Spoken Tutorial IITB)\n2) Certificate for the Completion of\nR Training \n3) Strategy Consulting Job Simulation\nCertificate of Completion by BCG \n4) Certificate for the Completion of PHP and MySQL Training",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "1) Runner-Up at a hackathon organised by Symbiosis, Pune in an International conference.\n2) Published a reasearch paper in cureus journals, indexed as an author for the same.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Excel, PowerBI, Python, SQL, Javascript, Machine Learning , Deep Learning, Prompt Engineering",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "66",
    "Name": "Sreekar Chintala",
    "Email address": "csreekar.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "93",
    "Class XII Percentage (Rounded off to two decimal places)": "88.4",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Finance",
    "UG Percentage (Rounded off to two decimal places)": "80.650000000000006",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Foundations of Business Strategy | University of Virginia",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Secured 1st place in music competitions(violinist)×2 District level",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Excel (data organization, analysis, formulas and financial modelling fundamentals), PowerPoint and MS Office. Familiar with SQL for data extraction, filtering and aggregation. Knowledge of financial statement analysis, company valuation fundamentals, competitive analysis and market research. Also familiar with Canva for presentations and visual communication.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "As Co-founder of BizChronicles (student led community), I worked with a five-member team to promote entrepreneurial thinking and business discussions. Through my involvement with the Centre of Entrepreneurship (COE) at IIM Amritsar, I have gained exposure to startup ecosystem development, founder engagement, investor connections and identifying entrepreneurial opportunities."
  },
  {
    "S. No.": "67",
    "Name": "Srijan Agrawal",
    "Email address": "srijana.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "71.5",
    "Class XII Percentage (Rounded off to two decimal places)": "81.400000000000006",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "61.38",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "8",
    "Work experience 1 - Designation": "Partner",
    "Work experience 1 - Organization Name": "Srijan Gems & Jewels",
    "Work experience 1 - Duration (in months)": "8",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Financial Markets Coursera Yale University",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "I am familiar with MS Excel, PowerPoint, and Word, along with financial research platforms such as Bloomberg, Screener.in, Moneycontrol, and TradingView. I also have basic knowledge of financial modelling, company valuation, equity research, market analysis, and data interpretation.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "I have hands-on experience in market and startup research through my entrepreneurial venture, Srijan Gems & Jewels, where I analysed the jewellery market, identified manufacturers and retailers, studied competitors, and evaluated pricing, demand patterns, and business opportunities.\n\nAdditionally, through my finance blog, I have written 40+ articles covering IPOs, company analysis, industry trends, and business cycles. These experiences have strengthened my skills in market research, competitor analysis, and business model evaluation."
  },
  {
    "S. No.": "68",
    "Name": "Surraiya afrin",
    "Email address": "surraiyaa.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "79.5",
    "Class XII Percentage (Rounded off to two decimal places)": "73.8",
    "UG Degree Name": "B.Sc. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Zoology",
    "UG Percentage (Rounded off to two decimal places)": "68.13",
    "Internship 1 - Designation": "Teaching intern",
    "Internship 1 - Organization": "Government school",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Awarded merit based government scholarship for outstanding academic performance in Higher Secondary (Class XII) and Bachelor's Degree.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Google Analytics, Product Management",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "69",
    "Name": "Tamanna Sharma",
    "Email address": "tamannas.mba12@iimamritsar.ac.in",
    "Gender": "Female",
    "Class X Percentage (Rounded off to two decimal places)": "74.8",
    "Class XII Percentage (Rounded off to two decimal places)": "72.400000000000006",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "General Management",
    "UG Percentage (Rounded off to two decimal places)": "75.7",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "MS Excel, Power BI, Banking, Finance and Insurance, Retail Sales Associate",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "MS Excel, Power BI",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "70",
    "Name": "Tejas Vilas Pete",
    "Email address": "tejasp.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "80.599999999999994",
    "Class XII Percentage (Rounded off to two decimal places)": "91",
    "UG Degree Name": "B.E.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Artificial intelligence and Data Science (Engineering)",
    "UG Percentage (Rounded off to two decimal places)": "73.400000000000006",
    "Internship 1 - Designation": "Web development intern",
    "Internship 1 - Organization": "Codsoft",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Digital marketing tools and techniques - simplilearn \nGenerative AI for beginners - Simplilearn",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Sports - Nationals in Kho-kho , Regional level in Kho-Kho\nInternational conference on NextGen AI & ML 2024",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Python, Excel, MySQL, jupyter notebook",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have experience in academic market research through an MBA marketing project focused on understanding consumer behaviour and brand perception between Daikin and Voltas in the air-conditioning market. The project involved analysing consumer preferences, buying factors, brand positioning, and competitor insights. My AI & Data Science background has also strengthened my analytical skills, data interpretation, and ability to identify market trends."
  },
  {
    "S. No.": "71",
    "Name": "Ujjwal Gupta",
    "Email address": "ujjwalg.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "91",
    "Class XII Percentage (Rounded off to two decimal places)": "88.4",
    "UG Degree Name": "B.Com. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Bcom Hons.",
    "UG Percentage (Rounded off to two decimal places)": "70.11",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "MS Excel , MS power point,",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Led a 25-member team as Finance Head of Vangati Society and secured ₹1.25 lakh in sponsorships, successfully managing financial planning, corporate relations, and budgeting for major college events.\nManaged operations at Shreya Enterprises, a family-owned auto parts distributorship, gaining hands-on experience in business operations, inventory management, vendor coordination, supply chain management, and customer relationship management.\nAchieved excellence in sports by becoming a District-Level Swimming Champion and securing Runner-up (2nd Place) in the District-Level Bodybuilding Championship, demonstrating discipline, perseverance, and a strong commitment to continuous improvement.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Excel, Microsoft PowerPoint, Microsoft Word, Power BI, LinkedIn, Python",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes. I have experience in market research through academic projects and practical business development activities. I have conducted secondary research using industry reports, company websites and publicly available datasets to analyse market trends, competitor positioning and customer behaviour. As part of my experience at Vangati, I also worked on prospect research, identifying potential sponsors, analysing their business relevance and developing outreach strategies. Additionally, my internship at Shreya Enterprises exposed me to business operations, customer requirements, supplier coordination and sales growth. These experiences have helped me develop a practical understanding of market analysis, business research and opportunity identification"
  },
  {
    "S. No.": "72",
    "Name": "Utkarsh Anand",
    "Email address": "utkarsha.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90.16",
    "Class XII Percentage (Rounded off to two decimal places)": "80.16",
    "UG Degree Name": "B.Com. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "61.67",
    "Internship 1 - Designation": "Finance & Accounts Intern",
    "Internship 1 - Organization": "Mehul Associates",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "NISM-Series-V-A: Mutual Fund Distributors\nNISM-Series-VIII: Equity Derivatives\nMicrosoft Excel for Business\nJ.P. Morgan Investment Banking Job Simulation",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Conducted an event as a Junior Consultant at The Impact Project @ Hansraj College.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Financial Modelling, Financial and Ratio Analysis, MS Word, MS Excel, Equity Analysis, Financial Statement Analysis",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "73",
    "Name": "Utkarsh Majumdar",
    "Email address": "utkarshm.mba12@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "89.5",
    "Class XII Percentage (Rounded off to two decimal places)": "90",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Computer Science Engineering",
    "UG Percentage (Rounded off to two decimal places)": "80",
    "Internship 1 - Designation": "Full Stack Developer Intern",
    "Internship 1 - Organization": "Seligent Consulting",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "22",
    "Work experience 1 - Designation": "Full Stack Developer",
    "Work experience 1 - Organization Name": "Seligent Consulting",
    "Work experience 1 - Duration (in months)": "22",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "-Foundation of Business Strategy by Darden University\n-Preparing Data for Analytics in Microsoft Excel",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "•PRODEVTHON 2021 Inter University Level Hackathon by SRM AP 2021– Demonstrated exceptional performance in securing victory at ProDevthon 2021 by conceiving and executing an innovative Natural Language Processing (NLP) project. Crafted a sentiment analysis model that harnessed NLP techniques.\n\n•WEBMOBDEVTHON 2022 Inter University Level Hackathon by SRM AP 2022– Secured First Runner up in the WebMobDevthon by spearheading the development of a dynamic website for the Coding Club at SRM AP. Collaboratively led a proficient team, effectively aligning their strengths to deliver a comprehensive and engaging platform.",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Python, Apache Superset, Tableau, SQL, Spring",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "N/A"
  },
  {
    "S. No.": "74",
    "Name": "Utkarsh Mittal",
    "Email address": "utkarshm.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90.8",
    "Class XII Percentage (Rounded off to two decimal places)": "85.8",
    "UG Degree Name": "B.Com.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce",
    "UG Percentage (Rounded off to two decimal places)": "61.61",
    "Internship 1 - Designation": "Risk management intern",
    "Internship 1 - Organization": "Share India Securities Ltd.",
    "Internship 2 - Designation": "Accounts Intern and trainee",
    "Internship 2 - Organization": "Surinder Kiran & Company",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "14",
    "Work experience 1 - Designation": "Accounts Associate",
    "Work experience 1 - Organization Name": "Surinder Kiran & Company",
    "Work experience 1 - Duration (in months)": "14",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "HR Analytics (UC Irvine)",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "I am familiar with MS Excel for basic data management and analysis, Tally ERP for maintaining accounts and recording financial transactions, and Canva for designing visual content and social media creatives. I also have experience using digital platforms for content management, preparing reports, maintaining financial records, and handling documentation.",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes, I have some experience in market and industry research through my internship at Share India Securities Ltd. During my internship, I conducted research on various topics related to the company's operations and industry trends and prepared reports based on my findings. I also gained exposure to the risk management function and client coordination. Additionally, my experience in managing marketing and promotional activities at Enactus helped me understand audience behaviour, engagement, and market outreach. Although I do not have direct professional experience in startup research, I am familiar with the basics of research and analysis and eager to explore this area further."
  },
  {
    "S. No.": "75",
    "Name": "Utkarsh Verma",
    "Email address": "utkarshv.mbahr06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "74",
    "Class XII Percentage (Rounded off to two decimal places)": "78",
    "UG Degree Name": "B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Journalism and Mass Communication",
    "UG Percentage (Rounded off to two decimal places)": "81",
    "Internship 1 - Designation": "Photographer and Social Media Intern",
    "Internship 1 - Organization": "Propques Service Pvt. Ltd.",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "1.Best Photographer in Exuberance Model United Nations (International Press Committee)\n2. Distric Championship Runners Up in \"Izaac U-15 Cricket Tournament 2013\" organized by Allahabad Cricket Association",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "CRM",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  },
  {
    "S. No.": "76",
    "Name": "VINEET KUMAR BADAL",
    "Email address": "vineetb.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "90.66",
    "Class XII Percentage (Rounded off to two decimal places)": "87.5",
    "UG Degree Name": "B.Com. Hons.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "COMMERCE WITH RESEARCH",
    "UG Percentage (Rounded off to two decimal places)": "66.02",
    "Internship 1 - Designation": "Finance Associate",
    "Internship 1 - Organization": "D. Gupta And Associates",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "NISM FINANCIAL LITERACY, Be10x AI TOOLS WORKSHOP, IJCRM : JOURNAL PUBLISHES ON SYSTEMATIC REVIEW OF FINFLUENCERS AND ITS IMPACT ON RISK PERCEPTION OF RETAIL INVESTORS",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "PURSUING CA",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Financial modelling, excel, R, python",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "Yes I have published a research paper in finance domain on the topic \"Impact of Finfluencers on Retail Investors\" apart from that I have also done and internship as research associate with S.K Research and associates"
  },
  {
    "S. No.": "77",
    "Name": "VIPUL SATPUTE",
    "Email address": "vipuls.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "88.3",
    "Class XII Percentage (Rounded off to two decimal places)": "83.6",
    "UG Degree Name": "B.B.A.",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "ENTREPRENEURSHIP",
    "UG Percentage (Rounded off to two decimal places)": "72.099999999999994",
    "Internship 1 - Designation": "Finance Advisor Intern",
    "Internship 1 - Organization": "GALLENT SECURITY SERVICES PVT.LTD",
    "Internship 2 - Designation": "Sales Intern",
    "Internship 2 - Organization": "DEVANSH DHARA PVT LTD",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Microsoft Office| Power BI | R | Tableau",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NA"
  },
  {
    "S. No.": "78",
    "Name": "Yatharth Pippal",
    "Email address": "yatharthp.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "78",
    "Class XII Percentage (Rounded off to two decimal places)": "87.83",
    "UG Degree Name": "BA (Commerce and Economics)",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Commerce and Economics",
    "UG Percentage (Rounded off to two decimal places)": "66.36",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Nism 15, Investment banking course , advanced valuation and strategy",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Mock stock (LBSIM)- Finalist ● Startup Idea Pitch(Khalsa College)- Finalist",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "CA Foundation",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Financial Modelling, DCF Modelling, Excel , Financial Analysis",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "NO"
  },
  {
    "S. No.": "79",
    "Name": "Yuvraj Singh",
    "Email address": "yuvrajs.mbaba06@iimamritsar.ac.in",
    "Gender": "Male",
    "Class X Percentage (Rounded off to two decimal places)": "87",
    "Class XII Percentage (Rounded off to two decimal places)": "95.16",
    "UG Degree Name": "B.Tech",
    "UG Branch / Specialization (General Management/Accounting/Mechanical Engineering, etc.)": "Computer Science and Engineering",
    "UG Percentage (Rounded off to two decimal places)": "74.3",
    "Internship 1 - Designation": "",
    "Internship 1 - Organization": "",
    "Internship 2 - Designation": "",
    "Internship 2 - Organization": "",
    "Total Full-Time Work Experience in months \n(Write 0 in case of no work experience)": "",
    "Work experience 1 - Designation": "",
    "Work experience 1 - Organization Name": "",
    "Work experience 1 - Duration (in months)": "",
    "Work experience 2 - Designation": "",
    "Work experience 2 - Organization Name": "",
    "Work experience 2 - Duration (in months)": "",
    "Certifications\n(Mention 3-4 major certifications)": "Design and Analysis of Algorithms (NPTEL IIT Madras), Databases and SQL for Data Science (IBM), AWS Academy Graduate - AWS Academy Cloud Foundations",
    "Achievements \n(Mention 1-2 major achievements. You can mention case competitions as well, only if you have been a semi-finalist/finalist/winner)": "Research publication titled \"Medical Document Classification using NLP Techniques\"",
    "Other Qualifications (CA/CFA/CS, etc.) \n(If you are currently pursuing/completed any other qualification, mention the same)": "",
    "Google Form response 1 - Mention any technical skills or tools that you are familiar with": "Python, Data Analysis, Machine Learning, AI, Microsoft Office, Tableau",
    "Google Form Respone 2 - Do you have prior experience working on Startup research or in general any market Research, If yes please elaborate?": "No"
  }
];


function parseCleanNumber(val: string | undefined): number | null {
  if (!val) return null;
  const cleaned = val.replace(/[^0-9.]/g, "").trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100) / 100;
}

function getField(row: Record<string, string>, prefixOrExact: string): string {
  if (row[prefixOrExact] !== undefined) return String(row[prefixOrExact]).trim();
  const key = Object.keys(row).find((k) =>
    k.toLowerCase().startsWith(prefixOrExact.toLowerCase())
  );
  return key ? String(row[key] || "").trim() : "";
}

export function inferCohortProgramFromEmail(email: string): string {
  const lower = email.toLowerCase();
  if (lower.includes(".mbaba")) return "MBA – Business Analytics (MBA-BA)";
  if (lower.includes(".mbahr")) return "MBA – Human Resources (MBA-HR)";
  return "MBA – Flagship General Management";
}

/**
 * Stage 1 Initial Profile Evaluation Engine (Out of 100)
 * Strictly excludes Gender. Caps academic percentages at 5 contextual points
 * so practical research, startup exposure, analytical tools, and ownership drive screening.
 */
export function computeStage1ProfileBreakdown(params: {
  ugDegree: string;
  ugSpecialisation: string;
  classXPercentage: number | null;
  classXIIPercentage: number | null;
  ugPercentage: number | null;
  internships: CandidateInternshipItem[];
  totalWorkExMonths: number;
  workExperiences: CandidateWorkExItem[];
  certifications: string;
  achievements: string;
  otherQualifications: string;
  technicalSkills: string;
  startupResearchResponse: string;
}): Stage1ProfileBreakdown {
  const rationale: string[] = [];

  // 1. Relevant Startup & Market Research Experience (Max 30)
  const resText = (params.startupResearchResponse || "").trim();
  const resLower = resText.toLowerCase();
  let researchScore = 0;
  let hasSubstantiveResearch = false;

  const isNegativeOrEmpty =
    !resText ||
    ["no", "na", "n/a", "nil", "none", "no.", "not yet", "no prior experience"].includes(resLower) ||
    resLower.startsWith("no,") ||
    resLower.startsWith("no ") ||
    resLower.startsWith("i do not have") ||
    resLower.startsWith("i don't have") ||
    resLower.startsWith("i haven't done");

  if (!isNegativeOrEmpty) {
    researchScore += 10;
    hasSubstantiveResearch = true;
  } else if (
    resLower.includes("however") ||
    resLower.includes("academic") ||
    resLower.includes("marketing project") ||
    resLower.includes("eager")
  ) {
    researchScore += 6;
  }

  // Concrete empirical research signals
  const empiricalKeywords = [
    "interview",
    "primary",
    "survey",
    "competitor",
    "zomato",
    "swiggy",
    "prospect",
    "equity research",
    "published",
    "research paper",
    "valuation",
    "unit economics",
    "tam",
    "pricing",
    "commission",
    "gtm",
    "go-to-market",
    "feasibility",
    "portfolio",
    "70+",
    "customer feedback",
  ];
  const matchedEmpirical = empiricalKeywords.filter((kw) => resLower.includes(kw));
  researchScore += Math.min(14, matchedEmpirical.length * 3.5);

  if (resText.length > 220 && matchedEmpirical.length >= 2) {
    researchScore += 6;
    hasSubstantiveResearch = true;
    rationale.push(
      `Substantive research evidence (${matchedEmpirical.slice(0, 4).join(", ")})`
    );
  } else if (hasSubstantiveResearch) {
    rationale.push("Reported prior market or academic research exposure");
  }

  // Check if internship was explicitly a Research / Strategy / Analyst role
  const allRolesText = [
    ...params.internships.map((i) => `${i.designation} ${i.organization}`),
    ...params.workExperiences.map((w) => `${w.designation} ${w.organization}`),
  ]
    .join(" ")
    .toLowerCase();

  if (
    allRolesText.includes("research") ||
    allRolesText.includes("strategy") ||
    allRolesText.includes("analyst") ||
    allRolesText.includes("investment") ||
    allRolesText.includes("equity")
  ) {
    researchScore += 5;
    hasSubstantiveResearch = true;
    rationale.push("Prior internship/work role in Research, Strategy, or Analytics");
  }
  researchScore = Math.min(30, Math.round(researchScore));

  // 2. Startup, Founder & Commercial Exposure (Max 20)
  let startupScore = 0;
  let hasStartupOrFounderExposure = false;
  const combinedProfileLower = `${allRolesText} ${resLower} ${params.achievements.toLowerCase()}`;

  if (
    combinedProfileLower.includes("co-founder") ||
    combinedProfileLower.includes("cofounder") ||
    combinedProfileLower.includes("founder") ||
    combinedProfileLower.includes("entrepreneurial venture") ||
    combinedProfileLower.includes("startup of own") ||
    combinedProfileLower.includes("partner@")
  ) {
    startupScore += 12;
    hasStartupOrFounderExposure = true;
    rationale.push("Direct founder / co-founder / entrepreneurial venture experience");
  }

  if (
    combinedProfileLower.includes("startup") ||
    combinedProfileLower.includes("pvt. ltd") ||
    combinedProfileLower.includes("private limited") ||
    combinedProfileLower.includes("brand acquisition") ||
    combinedProfileLower.includes("business development") ||
    combinedProfileLower.includes("client success") ||
    combinedProfileLower.includes("e-commerce") ||
    combinedProfileLower.includes("family business")
  ) {
    startupScore += 6;
    hasStartupOrFounderExposure = true;
  }

  if (params.internships.length >= 1) {
    startupScore += Math.min(4, params.internships.length * 2);
  }
  startupScore = Math.min(20, Math.round(startupScore));

  // 3. Analytical, Financial & Technical Toolkit (Max 20)
  let toolkitScore = 4; // Baseline MBA familiarity
  const toolkitLower = `${params.technicalSkills} ${params.certifications} ${params.otherQualifications}`.toLowerCase();

  const advancedTools = [
    "financial modelling",
    "financial modeling",
    "dcf",
    "valuation",
    "cfa",
    "ca intermediate",
    "ca foundation",
    "pursuing ca",
    "nism",
    "python",
    "sql",
    "power bi",
    "powerbi",
    "tableau",
    "r ",
    "claude",
    "mcp",
    "vertex ai",
    "github",
    "superset",
    "bloomberg",
    "tally",
    "six sigma",
  ];
  const matchedTools = advancedTools.filter((t) => toolkitLower.includes(t));
  toolkitScore += Math.min(16, matchedTools.length * 3.5);
  if (matchedTools.length >= 2) {
    rationale.push(`Strong analytical/technical toolkit (${matchedTools.slice(0, 4).join(", ")})`);
  }
  toolkitScore = Math.min(20, Math.round(toolkitScore));

  // 4. Evidence of Ownership, Initiative & Execution (Max 20)
  let ownershipScore = 4;
  if (params.totalWorkExMonths > 0) {
    ownershipScore += Math.min(8, Math.ceil(params.totalWorkExMonths / 3) * 2);
    rationale.push(`${params.totalWorkExMonths} months full-time work experience`);
  }
  if (params.internships.length >= 2) {
    ownershipScore += 4;
  } else if (params.internships.length === 1) {
    ownershipScore += 2;
  }

  const achLower = `${params.achievements} ${params.certifications} ${params.otherQualifications}`.toLowerCase();
  if (
    achLower.includes("winner") ||
    achLower.includes("1st") ||
    achLower.includes("finalist") ||
    achLower.includes("published") ||
    achLower.includes("springer") ||
    achLower.includes("ieee") ||
    achLower.includes("gate") ||
    achLower.includes("national") ||
    achLower.includes("cfa") ||
    achLower.includes("ca ")
  ) {
    ownershipScore += 6;
    rationale.push("Demonstrated competitive achievement, publication, or professional qualification");
  } else if (params.achievements.trim().length > 25) {
    ownershipScore += 3;
  }
  ownershipScore = Math.min(20, Math.round(ownershipScore));

  // 5. Communication Clarity & Contextual Academic Consistency (Max 10; Academics capped at 5)
  let commScore = 0;
  if (resText.length >= 180) {
    commScore += 5;
  } else if (resText.length >= 60) {
    commScore += 3;
  } else if (params.technicalSkills.length >= 50) {
    commScore += 2;
  }

  const validPcts = [
    params.classXPercentage,
    params.classXIIPercentage,
    params.ugPercentage,
  ].filter((n): n is number => typeof n === "number" && n > 0);
  const avgPct =
    validPcts.length > 0
      ? validPcts.reduce((acc, v) => acc + v, 0) / validPcts.length
      : 70;
  const academicContextPts =
    avgPct >= 85 ? 5 : avgPct >= 75 ? 4 : avgPct >= 65 ? 3 : 2;
  const communicationAcademicContextScore = Math.min(
    10,
    commScore + academicContextPts
  );

  const totalScore = Math.min(
    100,
    researchScore +
      startupScore +
      toolkitScore +
      ownershipScore +
      communicationAcademicContextScore
  );

  if (rationale.length === 0) {
    rationale.push("Standard first-year MBA profile; evaluate via Stage 2 & Stage 3 practical work sample");
  }

  return {
    researchExperienceScore: researchScore,
    startupCommercialExposureScore: startupScore,
    analyticalTechnicalToolkitScore: toolkitScore,
    ownershipInitiativeScore: ownershipScore,
    communicationAcademicContextScore,
    totalScore,
    rationale,
    hasSubstantiveResearch,
    hasStartupOrFounderExposure,
  };
}

export function buildCandidatesFromWorkbookRows(
  rows: Array<Record<string, string>>,
  shortlistThreshold = 48
): CandidateRecord[] {
  const now = new Date().toISOString();
  const seenEmails = new Set<string>();

  return rows.map((row, idx) => {
    const serialRaw = getField(row, "S. No.");
    const serialNo = Number(serialRaw) || idx + 1;
    const fullName = getField(row, "Name") || `Applicant #${serialNo}`;
    const rawEmail = getField(row, "Email address").toLowerCase();
    const email = seenEmails.has(rawEmail)
      ? `${rawEmail.split("@")[0]}+dup${serialNo}@iimamritsar.ac.in`
      : rawEmail;
    seenEmails.add(email);

    const gender = getField(row, "Gender") || "Unspecified";
    const classXPercentage = parseCleanNumber(getField(row, "Class X Percentage"));
    const classXIIPercentage = parseCleanNumber(getField(row, "Class XII Percentage"));
    const ugDegree = getField(row, "UG Degree Name") || "Undergraduate";
    const ugSpecialisation = getField(row, "UG Branch") || "General";
    const ugPercentage = parseCleanNumber(getField(row, "UG Percentage"));

    const internships: CandidateInternshipItem[] = [];
    const i1Desig = getField(row, "Internship 1 - Designation");
    const i1Org = getField(row, "Internship 1 - Organization");
    if (i1Desig || i1Org) {
      internships.push({
        designation: i1Desig || "Intern",
        organization: i1Org || "Organization",
      });
    }
    const i2Desig = getField(row, "Internship 2 - Designation");
    const i2Org = getField(row, "Internship 2 - Organization");
    if (i2Desig || i2Org) {
      internships.push({
        designation: i2Desig || "Intern",
        organization: i2Org || "Organization",
      });
    }

    const totalWorkExMonths =
      parseCleanNumber(getField(row, "Total Full-Time Work Experience")) || 0;

    const workExperiences: CandidateWorkExItem[] = [];
    const w1Desig = getField(row, "Work experience 1 - Designation");
    const w1Org = getField(row, "Work experience 1 - Organization Name");
    const w1Dur = parseCleanNumber(getField(row, "Work experience 1 - Duration")) || 0;
    if (w1Desig || w1Org) {
      workExperiences.push({
        designation: w1Desig || "Associate",
        organization: w1Org || "Organization",
        durationMonths: w1Dur || totalWorkExMonths,
      });
    }
    const w2Desig = getField(row, "Work experience 2 - Designation");
    const w2Org = getField(row, "Work experience 2 - Organization Name");
    const w2Dur = parseCleanNumber(getField(row, "Work experience 2 - Duration")) || 0;
    if (w2Desig || w2Org) {
      workExperiences.push({
        designation: w2Desig || "Associate",
        organization: w2Org || "Organization",
        durationMonths: w2Dur,
      });
    }

    const previousOrganisations = Array.from(
      new Set(
        [
          ...internships.map((i) => i.organization),
          ...workExperiences.map((w) => w.organization),
        ].filter((o) => o && o !== "Organization")
      )
    );

    const certifications = getField(row, "Certifications");
    const achievements = getField(row, "Achievements");
    const otherQualifications = getField(row, "Other Qualifications");
    const technicalSkills = getField(row, "Google Form response 1");
    const startupResearchResponse = getField(row, "Google Form Respone 2");

    const stage1 = computeStage1ProfileBreakdown({
      ugDegree,
      ugSpecialisation,
      classXPercentage,
      classXIIPercentage,
      ugPercentage,
      internships,
      totalWorkExMonths,
      workExperiences,
      certifications,
      achievements,
      otherQualifications,
      technicalSkills,
      startupResearchResponse,
    });

    const isShortlistedStage1 = stage1.totalScore >= shortlistThreshold;
    const candidateCode = `DVC-IIMA-${String(serialNo).padStart(3, "0")}`;

    const initialCompetencies: CompetencyScores = {
      researchAptitude: Math.min(100, Math.round((stage1.researchExperienceScore / 30) * 100)),
      startupDiscoverySourcing: Math.min(
        100,
        Math.round((stage1.startupCommercialExposureScore / 20) * 100)
      ),
      marketBusinessAnalysis: Math.min(
        100,
        Math.round(
          ((stage1.researchExperienceScore + stage1.startupCommercialExposureScore) / 50) * 100
        )
      ),
      financialCommercialUnderstanding: Math.min(
        100,
        Math.round((stage1.analyticalTechnicalToolkitScore / 20) * 100)
      ),
      criticalThinkingRisk: stage1.totalScore,
      communicationDocumentation: Math.min(
        100,
        Math.round((stage1.communicationAcademicContextScore / 10) * 100)
      ),
      interviewOwnership: Math.min(100, Math.round((stage1.ownershipInitiativeScore / 20) * 100)),
    };

    return {
      id: `cand-iima-${String(serialNo).padStart(3, "0")}`,
      candidateCode,
      serialNo,
      fullName,
      email,
      institution: "IIM Amritsar",
      cohortProgram: inferCohortProgramFromEmail(email),
      gender,
      classXPercentage,
      classXIIPercentage,
      ugDegree,
      ugSpecialisation,
      ugPercentage,
      internships,
      internshipSummary:
        internships.length > 0
          ? internships.map((i) => `${i.designation} @ ${i.organization}`).join(" | ")
          : "No prior internships listed",
      totalWorkExMonths,
      workExperiences,
      previousOrganisations,
      certifications,
      achievements,
      otherQualifications,
      technicalSkills,
      startupResearchExperience: startupResearchResponse,
      marketResearchExperience: startupResearchResponse,
      hasSubstantiveResearchExperience: stage1.hasSubstantiveResearch,
      originalRowPayload: row,
      currentStage: "Stage 1: Profile Screening",
      applicationStatus: isShortlistedStage1
        ? "Shortlisted for Assessment"
        : "Pending Screening",
      assessmentStatus: "Not Assigned",
      assignedReviewerId: "user-siddharth",
      assignedReviewerName: "Siddharth Kaushik",
      stage1ProfileBreakdown: stage1,
      profileScore: stage1.totalScore,
      stage2AptitudeScore: null,
      stage3SourcingScore: null,
      stage4CaseMemoScore: null,
      stage5InterviewScore: null,
      competencyScores: initialCompetencies,
      finalWeightedScore: stage1.totalScore,
      manualScoreOverride: null,
      manualOverrideReason: null,
      reviewerDisagreementFlag: false,
      reviewerEvaluations: [],
      reviewerComments: [],
      accountProvisioned: false,
      passwordConfigured: false,
      inviteStatus: "Not Sent",
      inviteSentAt: null,
      inviteAcceptedAt: null,
      lastCommunicationAt: null,
      assignedAssessmentIds: [],
      assessmentDeadlineAt: null,
      activityTimeline: [
        {
          id: `act-import-${serialNo}`,
          action: "candidate.imported",
          summary: `Imported from IIM Amritsar Profile Sheet (Stage 1 Profile Score: ${stage1.totalScore}/100)`,
          actorName: "System Workbook Importer",
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
  });
}

/**
 * Pure Node.js .xlsx buffer parser (reads ZIP central directory, xl/sharedStrings.xml, and xl/worksheets/sheet1.xml)
 * Allows admins to upload any .xlsx file directly from the browser without external native dependencies.
 */
export function parseApplicantXlsxBuffer(buffer: Buffer): Array<Record<string, string>> {
  const entries = new Map<string, Buffer>();
  let offset = 0;

  while (offset + 30 <= buffer.length) {
    const sig = buffer.readUInt32LE(offset);
    if (sig !== 0x04034b50) break; // Local file header signature
    const compression = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const fileName = buffer.subarray(offset + 30, offset + 30 + fileNameLen).toString("utf-8");
    const dataStart = offset + 30 + fileNameLen + extraLen;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > buffer.length) break;

    const rawSlice = buffer.subarray(dataStart, dataEnd);
    try {
      const content =
        compression === 0 ? rawSlice : zlib.inflateRawSync(rawSlice);
      entries.set(fileName, content);
    } catch {
      // Ignore non-critical zip entry errors
    }
    offset = dataEnd;
  }

  const decodeXmlEntities = (str: string) =>
    str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

  const sharedStrings: string[] = [];
  const ssXml = entries.get("xl/sharedStrings.xml")?.toString("utf-8") || "";
  if (ssXml) {
    const siMatches = ssXml.match(/<si[\s\S]*?<\/si>/g) || [];
    for (const si of siMatches) {
      const tMatches = si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
      const combined = tMatches
        .map((t) => decodeXmlEntities(t.replace(/<[^>]+>/g, "")))
        .join("");
      sharedStrings.push(combined);
    }
  }

  const sheetXml = entries.get("xl/worksheets/sheet1.xml")?.toString("utf-8") || "";
  if (!sheetXml) {
    return RAW_IIM_AMRITSAR_WORKBOOK_ROWS;
  }

  const colIndexFromRef = (ref: string): number => {
    const letters = ref.replace(/[^A-Z]/g, "");
    let n = 0;
    for (let i = 0; i < letters.length; i++) {
      n = n * 26 + (letters.charCodeAt(i) - 64);
    }
    return Math.max(0, n - 1);
  };

  const rowBlocks = sheetXml.match(/<row[\s\S]*?<\/row>/g) || [];
  const matrix: string[][] = [];

  for (const rb of rowBlocks) {
    const cellBlocks = rb.match(/<c\b[\s\S]*?(?:<\/c>|\/>)/g) || [];
    const rowMap = new Map<number, string>();
    let maxCol = 0;

    for (const cb of cellBlocks) {
      const refMatch = cb.match(/\br="([A-Z]+\d+)"/);
      const typeMatch = cb.match(/\bt="([^"]+)"/);
      const vMatch = cb.match(/<v>([\s\S]*?)<\/v>/);
      const isMatch = cb.match(/<is>[\s\S]*?<\/is>/);
      const colIdx = refMatch ? colIndexFromRef(refMatch[1]!) : 0;
      if (colIdx > maxCol) maxCol = colIdx;

      let val = "";
      const cellType = typeMatch ? typeMatch[1] : "";
      if (cellType === "s" && vMatch) {
        const idx = Number(vMatch[1]);
        val = sharedStrings[idx] || "";
      } else if (cellType === "inlineStr" && isMatch) {
        const tMatches = isMatch[0].match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
        val = tMatches.map((t) => decodeXmlEntities(t.replace(/<[^>]+>/g, ""))).join("");
      } else if (vMatch) {
        val = decodeXmlEntities(vMatch[1]!);
      }
      rowMap.set(colIdx, val.trim());
    }

    if (rowMap.size > 0) {
      const arr: string[] = [];
      for (let c = 0; c <= Math.max(maxCol, 24); c++) {
        arr.push(rowMap.get(c) || "");
      }
      matrix.push(arr);
    }
  }

  if (matrix.length < 2) return RAW_IIM_AMRITSAR_WORKBOOK_ROWS;
  const headers = matrix[0]!.map((h, i) => h.trim() || `Column_${i + 1}`);
  const result: Array<Record<string, string>> = [];

  for (let r = 1; r < matrix.length; r++) {
    const rowArr = matrix[r]!;
    if (!rowArr[1] && !rowArr[2]) continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = rowArr[idx] || "";
    });
    result.push(obj);
  }

  return result;
}

/**
 * Generates an Excel-compatible SpreadsheetML (.xls / .xlsx XML) workbook containing
 * the complete Candidate Database, Stage 1-5 scores, competency scores, and reviewer notes.
 */
export function generateCandidatesExcelXml(candidates: CandidateRecord[]): string {
  const esc = (v: unknown) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const headers = [
    "Candidate ID",
    "S. No.",
    "Full Name",
    "Institutional Email",
    "Cohort Program",
    "Gender (Admin Ref Only)",
    "Class X %",
    "Class XII %",
    "UG Degree",
    "UG Specialisation",
    "UG %",
    "Internships",
    "Full-Time Work Ex (Months)",
    "Previous Organisations",
    "Certifications",
    "Achievements",
    "Other Qualifications",
    "Technical Skills",
    "Startup & Market Research Experience",
    "Current Stage",
    "Selection Status",
    "Assessment Status",
    "Stage 1 Profile Score (/100)",
    "Stage 2 Aptitude Score (/100)",
    "Stage 3 Sourcing Score (/100)",
    "Stage 4 Case Memo Score (/100)",
    "Stage 5 Interview Score (/100)",
    "Final Weighted Score (/100)",
    "Assigned Reviewer",
    "Invite Status",
    "Reviewer Comments",
  ];

  const headerCells = headers
    .map((h) => `<Cell ss:StyleID="sHeader"><Data ss:Type="String">${esc(h)}</Data></Cell>`)
    .join("");

  const rowsXml = candidates
    .map((c) => {
      const commentsText = c.reviewerComments
        .map((cm) => `[${cm.authorName}]: ${cm.comment}`)
        .join(" | ");
      const values: Array<{ type: "String" | "Number"; val: string | number }> = [
        { type: "String", val: c.candidateCode },
        { type: "Number", val: c.serialNo },
        { type: "String", val: c.fullName },
        { type: "String", val: c.email },
        { type: "String", val: c.cohortProgram },
        { type: "String", val: c.gender },
        { type: "Number", val: c.classXPercentage ?? 0 },
        { type: "Number", val: c.classXIIPercentage ?? 0 },
        { type: "String", val: c.ugDegree },
        { type: "String", val: c.ugSpecialisation },
        { type: "Number", val: c.ugPercentage ?? 0 },
        { type: "String", val: c.internshipSummary },
        { type: "Number", val: c.totalWorkExMonths },
        { type: "String", val: c.previousOrganisations.join(", ") },
        { type: "String", val: c.certifications },
        { type: "String", val: c.achievements },
        { type: "String", val: c.otherQualifications },
        { type: "String", val: c.technicalSkills },
        { type: "String", val: c.startupResearchExperience },
        { type: "String", val: c.currentStage },
        { type: "String", val: c.applicationStatus },
        { type: "String", val: c.assessmentStatus },
        { type: "Number", val: c.profileScore },
        { type: "Number", val: c.stage2AptitudeScore ?? 0 },
        { type: "Number", val: c.stage3SourcingScore ?? 0 },
        { type: "Number", val: c.stage4CaseMemoScore ?? 0 },
        { type: "Number", val: c.stage5InterviewScore ?? 0 },
        { type: "Number", val: c.finalWeightedScore },
        { type: "String", val: c.assignedReviewerName },
        { type: "String", val: c.inviteStatus },
        { type: "String", val: commentsText },
      ];
      const cells = values
        .map((cell) => `<Cell><Data ss:Type="${cell.type}">${esc(cell.val)}</Data></Cell>`)
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("\n");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="sHeader">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#101A24" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="IIM Amritsar Candidates">
  <Table>
   <Row>${headerCells}</Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
}

export const DEFAULT_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q-apt-01",
    code: "APT-01",
    stage: "Stage 2: Research Aptitude Test",
    format: "mcq",
    competency: "Research Methodology",
    difficulty: "Intermediate",
    marks: 8,
    prompt:
      "A founder claims in their pitch deck: 'India's logistics market is ₹18 Lakh Crore; capturing just 1% gives us a ₹18,000 Crore SOM in 3 years.' Which of the following is the most rigorous investment analyst critique of this market sizing?",
    options: [
      "Top-down percentage capture ignores unit-level addressability; SOM must be built bottom-up from target customer segment count × realistic annual contract value (ACV) × achievable penetration given sales capacity.",
      "The founder should have used a 0.5% market share assumption instead of 1% to be conservative.",
      "Logistics is a low-margin sector so TAM is irrelevant for early-stage venture investors.",
      "The ₹18 Lakh Crore figure should be converted to USD before calculating SOM.",
    ],
    correctOptionIndex: 0,
    evaluationRubric:
      "Tests whether the candidate recognizes the classic '1% of a giant top-down TAM' fallacy and knows how to construct a bottom-up addressable market.",
    active: true,
  },
  {
    id: "q-apt-02",
    code: "APT-02",
    stage: "Stage 2: Research Aptitude Test",
    format: "data_interpretation",
    competency: "Financial Reasoning",
    difficulty: "Intermediate",
    marks: 10,
    prompt:
      "Examine the monthly unit economics of 'KisanMandi Express' (a B2B rural agri-input delivery startup) below. What is the true Contribution Margin 2 (CM2) per order and the primary operational risk?",
    contextData:
      "Average Order Value (AOV): ₹4,000 | Cost of Goods Sold (COGS): ₹3,280 | Packaging & Warehouse Handling: ₹120/order | Last-Mile Diesel Van Delivery Cost: ₹340/order | Customer Cashback & Sales Agent Commission: ₹310/order | Fixed Corporate HQ Rent & Engineering Salaries: ₹14 Lakhs/month.",
    options: [
      "CM2 is -₹50 per order (-1.25% of AOV); the business loses money on every incremental delivery before fixed HQ costs, meaning scaling order volume increases cash burn.",
      "CM2 is +₹720 per order (18% gross margin); the company simply needs more volume to cover ₹14 Lakhs fixed cost.",
      "CM2 is +₹260 per order because sales commissions and cashback are marketing investments, not variable costs.",
      "CM2 cannot be calculated without knowing the company's equity valuation.",
    ],
    correctOptionIndex: 0,
    evaluationRubric:
      "Gross Margin = 4000 - 3280 = +720. Variable fulfillment + variable CAC/commission = 120 + 340 + 310 = 770. CM2 = 720 - 770 = -50/order.",
    active: true,
  },
  {
    id: "q-apt-03",
    code: "APT-03",
    stage: "Stage 2: Research Aptitude Test",
    format: "mcq",
    competency: "Information Verification",
    difficulty: "Intermediate",
    marks: 8,
    prompt:
      "While researching an early-stage Indian manufacturing startup that claims '₹14 Crore audited FY25 revenue and 45 enterprise clients', which source provides the highest-confidence independent verification of their historical financial performance?",
    options: [
      "Ministry of Corporate Affairs (MCA) filings (Form AOC-4 / MGT-7 via Tofler/Zauba/Probe42) cross-checked against GST filing regularity and EPFO employee provident fund headcount trends.",
      "A sponsored article in a startup media portal quoting the founder's revenue projection.",
      "The startup's LinkedIn 'About' page and company follower count.",
      "An AI chatbot summary of the company's website.",
    ],
    correctOptionIndex: 0,
    evaluationRubric:
      "Evaluates whether the candidate knows primary Indian corporate verification sources (MCA AOC-4, GSTIN active status, EPFO headcount).",
    active: true,
  },
  {
    id: "q-apt-04",
    code: "APT-04",
    stage: "Stage 2: Research Aptitude Test",
    format: "data_interpretation",
    competency: "Attention to Detail",
    difficulty: "Advanced",
    marks: 10,
    prompt:
      "A SaaS startup reports 'Zero Logo Churn and 140% Net Revenue Retention (NRR) in Q3'. However, the cohort table in their data room shows the following. Which statement accurately identifies the inconsistency?",
    contextData:
      "Q1 Cohort: Started with 20 customers paying ₹50,000/mo each (₹10L MRR). In Q3, 14 of those customers are still active: 4 upgraded to ₹1,00,000/mo, and 10 pay ₹50,000/mo (Total Q3 MRR from Q1 cohort = ₹9L). Meanwhile, 8 brand-new customers signed up in Q3 paying ₹75,000/mo (₹6L new MRR).",
    options: [
      "Both claims are false: 6 of 20 Q1 customers churned (30% logo churn), and Q1 cohort MRR shrank from ₹10L to ₹9L (90% NRR). The founder mistakenly included ₹6L of new Q3 customer acquisition inside 'Net Revenue Retention'.",
      "Logo churn is 30%, but NRR is indeed 150% because total company MRR grew from ₹10L to ₹15L.",
      "Both claims are accurate because upgraded customers doubled their spend.",
      "NRR only measures gross margin, not monthly recurring revenue.",
    ],
    correctOptionIndex: 0,
    evaluationRubric:
      "Tests sharp attention to detail: NRR must be measured on the existing cohort (9L / 10L = 90%), never by mixing in new logo acquisition.",
    active: true,
  },
  {
    id: "q-apt-05",
    code: "APT-05",
    stage: "Stage 2: Research Aptitude Test",
    format: "mcq",
    competency: "Business Model Comprehension",
    difficulty: "Foundation",
    marks: 8,
    prompt:
      "Which of the following early-stage business models faces the highest working-capital intensity as revenue scales from ₹1 Cr to ₹10 Cr?",
    options: [
      "A B2B industrial raw-material supply platform that pays steel mills upfront (0-day credit) while offering EPC contractors 90-day credit terms.",
      "A vertical B2B SaaS platform for dental clinics charging annual upfront subscriptions.",
      "A marketplace connecting freelance designers with D2C brands taking a 15% escrow commission.",
      "An API developer tool charging usage-based monthly credit card billing.",
    ],
    correctOptionIndex: 0,
    evaluationRubric:
      "Paying suppliers on Day 0 while collecting from customers on Day 90 creates a 90-day cash conversion cycle trap that consumes equity capital as working capital.",
    active: true,
  },
  {
    id: "q-apt-06",
    code: "APT-06",
    stage: "Stage 2: Research Aptitude Test",
    format: "mcq",
    competency: "Analytical Reasoning",
    difficulty: "Intermediate",
    marks: 8,
    prompt:
      "Deevee Capital can invest up to ₹1 Crore in an early-stage startup. If a founder is raising ₹80 Lakhs at a ₹7.2 Crore pre-money valuation, what post-money ownership stake would an ₹80 Lakh investment represent?",
    options: [
      "10.0% (Post-money valuation = ₹7.2 Cr + ₹0.8 Cr = ₹8.0 Cr; ₹0.8 Cr / ₹8.0 Cr = 10%)",
      "11.11% (₹0.8 Cr / ₹7.2 Cr)",
      "8.0% (₹0.8 Cr / ₹10 Cr)",
      "12.5%",
    ],
    correctOptionIndex: 0,
    evaluationRubric:
      "Post-money = Pre-money (7.2 Cr) + Investment (0.8 Cr) = 8.0 Cr. Ownership = 0.8 / 8.0 = 10.0%.",
    active: true,
  },
  {
    id: "q-apt-07",
    code: "APT-07",
    stage: "Stage 2: Research Aptitude Test",
    format: "mcq",
    competency: "Research Methodology",
    difficulty: "Intermediate",
    marks: 8,
    prompt:
      "You are asked to discover promising pre-seed/seed Indian startups outside the top newspaper headlines. Which sourcing workflow is most likely to uncover high-signal, under-the-radar opportunities?",
    options: [
      "Cross-referencing IIT/IIM/IISc technology business incubator cohorts (e.g., IIT Madras Incubation Cell, CIIE.CO, SINE), DPIIT patent/grant recipients, and LinkedIn searches for 'Stealth' or 'Building in' among former product/engineering leads.",
      "Searching 'Top 10 Indian Startups 2026' on Google and copying the first blog post.",
      "Filtering only companies that have already raised $20M+ Series B rounds on Crunchbase.",
      "Looking exclusively at listed companies on NSE/BSE.",
    ],
    correctOptionIndex: 0,
    evaluationRubric:
      "Tests practical early-stage sourcing tradecraft across academic incubators, grant registries, and operator transitions.",
    active: true,
  },
  {
    id: "q-apt-08",
    code: "APT-08",
    stage: "Stage 2: Research Aptitude Test",
    format: "short_answer",
    competency: "Information Verification",
    difficulty: "Intermediate",
    marks: 12,
    prompt:
      "A D2C functional beverage startup claims: 'We are the #1 fastest-growing hydration brand in India with 65% repeat purchase rate and 12,000 retail stores.' Without asking the founder, list 4 concrete public signals or scrappy primary checks you would run in 45 minutes to test whether these claims are real or exaggerated.",
    evaluationRubric:
      "Award full marks (10-12) if candidate mentions: (1) Amazon/Flipkart/Blinkit/Zepto review volume, BSR rank & date history, (2) SimilarWeb/Meta Ad Library active ad duration & traffic, (3) EPFO employee count / MCA revenue filing check, (4) Calling 3 listed stockists/distributors or checking LinkedIn field sales headcount vs 12,000 store claim.",
    sampleStrongAnswer:
      "1. Check Amazon India Best Seller Rank (BSR) & review velocity + Quick-commerce (Blinkit/Swiggy Instamart) stock availability across 3 pin codes. 2. Check LinkedIn headcount: 12,000 general trade stores requires a sizable field sales/ASM team or distributor network—if they have only 4 employees on LinkedIn/EPFO, 12,000 stores is likely exaggerated. 3. Inspect Meta Ad Library to see how many active ads they run and landing page traffic via SimilarWeb. 4. Check MCA AOC-4 filings for actual revenue vs claimed scale.",
    active: true,
  },
  {
    id: "q-apt-09",
    code: "APT-09",
    stage: "Stage 2: Research Aptitude Test",
    format: "case_based",
    competency: "Business Model Comprehension",
    difficulty: "Advanced",
    marks: 14,
    prompt:
      "Case Mini-Prompt: 'BuildTrack AI' sells computer-vision helmet cameras to Indian civil construction EPC contractors for ₹25,000/camera + ₹2,000/month software fee to monitor worker safety compliance. Why might Indian mid-sized EPC contractors resist adopting this product despite its safety benefits, and what business model or value-proposition pivot would make it a must-have ROI purchase?",
    evaluationRubric:
      "Look for commercial realism: safety compliance alone is often treated as a cost center by mid-tier contractors unless tied to (a) labour productivity / attendance verification, (b) material theft/pilferage reduction, or (c) automated BoQ progress billing & delay penalty avoidance.",
    sampleStrongAnswer:
      "In Indian mid-sized EPC contracting, pure safety compliance is often viewed as a non-revenue cost center with high site-level device damage risk. However, if BuildTrack links camera telemetry to (1) daily subcontractor progress verification (preventing over-billing), (2) cement/steel pilferage prevention, and (3) client milestone billing proof, the ROI becomes immediate cash savings rather than a compliance vitamin.",
    active: true,
  },
  {
    id: "q-apt-10",
    code: "APT-10",
    stage: "Stage 2: Research Aptitude Test",
    format: "research_verification",
    competency: "Attention to Detail",
    difficulty: "Advanced",
    marks: 14,
    prompt:
      "Read the following excerpt from a candidate's draft memo: 'MedQuick Diagnostics operates 85 labs across Tier-3 Bihar and UP, generating ₹18 Cr ARR with 42% EBITDA margin, backed by Sequoia India. The Indian diagnostics market is growing at 28% CAGR according to a 2026 blog.' Identify at least 3 claims in this paragraph that must be separated into 'Requires Verification / Red Flag' before presenting to Deevee Capital's Investment Team.",
    evaluationRubric:
      "Must flag: (1) 42% EBITDA margin in Tier-3 diagnostics is unusually high (listed peers average 20-26%) — check if pathology reagent/collection centre commissions were omitted, (2) 'Backed by Sequoia India' (now Peak XV Partners) — verify on Crunchbase/MCA PAS-3 share allotment, (3) 28% industry CAGR from an unnamed blog is inflated (Indian diagnostics grows ~10-14% CAGR).",
    sampleStrongAnswer:
      "1. Investor claim: Sequoia India rebranded to Peak XV Partners in 2023; verify via MCA Form PAS-3 / Tracxn whether they actually invested. 2. Financial anomaly: 42% EBITDA margin at ₹18 Cr scale in Tier-3 diagnostics is nearly double industry benchmarks (Dr. Lal PathLabs / Metropolis operate at ~24-27% EBITDA)—verify whether franchise collection fees and doctor commissions were excluded. 3. Market growth: 28% CAGR from an unnamed blog is unreliable; cross-check against CRISIL/ICRA healthcare reports.",
    active: true,
  },
];

export const DEFAULT_RECRUITMENT_EMAIL_TEMPLATES: RecruitmentEmailTemplate[] = [
  {
    id: "tpl-invite-assessment",
    name: "Initial Portal & Assessment Invitation",
    stageTrigger: "Stage 1: Profile Screening",
    subject: "Invitation – Deevee Capital Internship Assessment",
    bodyText: `Dear {{candidateName}},

Thank you for expressing interest in the Investment Research & Startup Sourcing Intern role at Deevee Capital through the IIM Amritsar placement process.

Deevee Capital is a sector-agnostic early-stage investment initiative focused on discovering and backing promising founders and businesses across India (investing up to ₹1 Crore per opportunity). Our investment research interns work directly with the Investment Team to source under-the-radar Indian startups, evaluate business models and market sizing, conduct competitor diligence, and prepare preliminary investment screening reports.

 Internship Overview:
• Role: Investment Research & Startup Sourcing Intern
• Eligibility: First-Year MBA, IIM Amritsar
• Format: 100% Remote | Flexible Working Hours | Stipend: ₹10,000/month

Your application ({{candidateCode}}) has been registered for our multi-stage assessment process:
1. Research Aptitude & Verification Assessment (35 minutes, timed)
2. Practical 3-Startup Discovery & Research Trail Assignment (48-hour window, ~3–4 hours effort)
3. Preliminary Investment Screening Case & Live Research Defence (for shortlisted candidates)

Access Your Secure Candidate Assessment Portal:
{{portalInviteUrl}}

On first access, please verify your institutional email ({{candidateEmail}}) and set your personal account password to view your assessment instructions and submission deadlines.

Warm regards,
Investment & Talent Team
Deevee Capital
https://deeveecapital.com`,
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "tpl-assign-stage3",
    name: "Stage 3: Practical Startup Sourcing Assignment Notification",
    stageTrigger: "Stage 3: Startup Sourcing Assignment",
    subject: "Action Required: Deevee Capital Practical Startup Sourcing Assignment ({{candidateCode}})",
    bodyText: `Dear {{candidateName}},

Congratulations on advancing to Stage 3 of the Deevee Capital Internship Assessment process.

Your practical work-sample assignment is now unlocked in the Candidate Assessment Portal:
• Task: Discover 3 promising early-stage Indian startups (any sector), document your exact discovery trail and verifiable source links, separate verified facts from assumptions, and recommend 1 company for deeper diligence.
• Submission Window: 48 hours from assignment activation (Expected effort: 3–4 hours).

Access the Portal to view full instructions and submit your work:
{{portalInviteUrl}}

Warm regards,
Investment & Talent Team
Deevee Capital`,
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "tpl-deadline-reminder",
    name: "Assessment Deadline Reminder",
    stageTrigger: "Reminder",
    subject: "Reminder: Upcoming Submission Deadline – Deevee Capital Assessment ({{candidateCode}})",
    bodyText: `Dear {{candidateName}},

This is a friendly reminder that your Deevee Capital internship assessment submission is due soon. Please ensure your responses and any supporting files (PDF/DOCX/PPTX/XLSX) are submitted via the Candidate Portal before the deadline:

{{portalInviteUrl}}

Warm regards,
Investment & Talent Team
Deevee Capital`,
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "tpl-submission-confirmation",
    name: "Submission Received Confirmation",
    stageTrigger: "Submitted",
    subject: "Confirmation: Assessment Submission Received – Deevee Capital ({{candidateCode}})",
    bodyText: `Dear {{candidateName}},

We confirm receipt of your assessment submission for the Investment Research & Startup Sourcing Intern role at Deevee Capital.

Our investment team reviewers will evaluate your research methodology, source verification, and analytical reasoning. You can track your status anytime via the Candidate Portal:
{{portalInviteUrl}}

Warm regards,
Investment & Talent Team
Deevee Capital`,
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "tpl-interview-invite",
    name: "Stage 5: Interview & Research Defence Invitation",
    stageTrigger: "Stage 5: Interview & Defence",
    subject: "Interview Invitation: Deevee Capital Research Defence – {{candidateName}} ({{candidateCode}})",
    bodyText: `Dear {{candidateName}},

We were impressed by your startup research submission and would like to invite you to Stage 5: Live Interview & Research Defence with the Deevee Capital Investment Team.

During this 25-minute session, we will discuss the startups you sourced, your market sizing methodology, what you could not verify, and how you evaluate investment risks.

Please check the Candidate Portal for your scheduled slot and meeting link:
{{portalInviteUrl}}

Warm regards,
Investment & Talent Team
Deevee Capital`,
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "tpl-selection-offer",
    name: "Final Selection Offer",
    stageTrigger: "Selected",
    subject: "Internship Offer: Investment Research & Startup Sourcing Intern – Deevee Capital",
    bodyText: `Dear {{candidateName}},

Congratulations! Following your performance across our research assessments and live defence, we are pleased to offer you the position of Investment Research & Startup Sourcing Intern at Deevee Capital (100% Remote, Flexible Hours, ₹10,000/month stipend).

Please log into the Candidate Portal or reply to this email to confirm your acceptance and onboarding schedule:
{{portalInviteUrl}}

Warm regards,
Siddharth Kaushik
Deevee Capital`,
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "tpl-rejection-update",
    name: "Application Status Update (Not Selected)",
    stageTrigger: "Rejected",
    subject: "Update on Your Deevee Capital Internship Application ({{candidateCode}})",
    bodyText: `Dear {{candidateName}},

Thank you for the time, effort, and analytical thought you invested in the Deevee Capital Internship Assessment process.

While we received many strong applications from IIM Amritsar and are unable to move forward with your candidacy for this cohort, we appreciate your interest in Deevee Capital and wish you the very best in your MBA journey.

Warm regards,
Investment & Talent Team
Deevee Capital`,
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
];

export const DEFAULT_RECRUITMENT_WEIGHTS: RecruitmentScoringWeights = {
  researchAptitude: 15,
  startupDiscoverySourcing: 20,
  marketBusinessAnalysis: 20,
  financialCommercialUnderstanding: 10,
  criticalThinkingRisk: 15,
  communicationDocumentation: 10,
  interviewOwnership: 10,
};

export function calculateWeightedCompetencyScore(
  competencies: CompetencyScores,
  weights: RecruitmentScoringWeights = DEFAULT_RECRUITMENT_WEIGHTS
): number {
  const totalWeight =
    weights.researchAptitude +
    weights.startupDiscoverySourcing +
    weights.marketBusinessAnalysis +
    weights.financialCommercialUnderstanding +
    weights.criticalThinkingRisk +
    weights.communicationDocumentation +
    weights.interviewOwnership || 100;

  const weightedSum =
    competencies.researchAptitude * weights.researchAptitude +
    competencies.startupDiscoverySourcing * weights.startupDiscoverySourcing +
    competencies.marketBusinessAnalysis * weights.marketBusinessAnalysis +
    competencies.financialCommercialUnderstanding * weights.financialCommercialUnderstanding +
    competencies.criticalThinkingRisk * weights.criticalThinkingRisk +
    competencies.communicationDocumentation * weights.communicationDocumentation +
    competencies.interviewOwnership * weights.interviewOwnership;

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function buildInitialRecruitmentState(): RecruitmentModuleState {
  const now = "2026-11-06T00:00:00.000Z";
  const settings: RecruitmentSettings = {
    id: "iim-amritsar-2026",
    campaignTitle: "IIM Amritsar MBA Internship Recruitment 2026",
    institution: "IIM Amritsar",
    roleTitle: "Investment Research & Startup Sourcing Intern",
    eligibility: "First-Year MBA Students",
    workArrangement: "100% Remote",
    stipend: "₹10,000 per month",
    workingHours: "Flexible",
    reportingTo: "Investment Team",
    aiInterviewDurationMinutes: 25,
    proctoringStrictMode: true,
    stage2TimeLimitMinutes: 35,
    stage3WindowHours: 48,
    stage1ShortlistThreshold: 48,
    overallShortlistThreshold: 70,
    weights: DEFAULT_RECRUITMENT_WEIGHTS,
    workbookImported: true,
    workbookImportedAt: now,
    workbookFileName: "DeeVee Capital_IIM Amritsar_Profile Sheet .xlsx",
    updatedAt: now,
  };

  return {
    settings,
    candidates: buildCandidatesFromWorkbookRows(RAW_IIM_AMRITSAR_WORKBOOK_ROWS, 48),
    questions: DEFAULT_ASSESSMENT_QUESTIONS,
    submissions: [],
    aiInterviewSessions: [],
    startupCaseSets: DEFAULT_STARTUP_CASE_SETS,
    interviews: [],
    emailTemplates: DEFAULT_RECRUITMENT_EMAIL_TEMPLATES,
    emailLogs: [],
    scoreAuditLogs: [],
  };
}
