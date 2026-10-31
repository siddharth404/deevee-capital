import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PitchEmailData } from "./email";

/**
 * Strips or converts non-WinAnsi characters (such as ₹, smart quotes, em dashes)
 * to ensure pdf-lib standard fonts do not throw encoding exceptions.
 */
function sanitizePdfText(text: string | undefined | null): string {
  if (!text) return "";
  return String(text)
    .replace(/₹/g, "INR ")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "*")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

/**
 * Generates an institutional Executive Pitch Memorandum PDF for Deevee Capital
 */
export async function generatePitchMemoPdf(data: PitchEmailData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Load standard fonts
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // A4 Page size (595.28 x 841.89 points)
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Colors
  const navy = rgb(0.063, 0.102, 0.141); // #101A24
  const gold = rgb(0.776, 0.678, 0.478); // #C6AD7A
  const charcoal = rgb(0.09, 0.098, 0.11); // #17191C
  const grey = rgb(0.467, 0.506, 0.545); // #77818B
  const lightBg = rgb(0.969, 0.961, 0.941); // #F7F5F0
  const borderGrey = rgb(0.88, 0.86, 0.82);

  // 1. Top Decorative Header Bar
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width: width,
    height: 90,
    color: navy,
  });

  // Top Accent Gold Line
  page.drawRectangle({
    x: 0,
    y: height - 93,
    width: width,
    height: 3,
    color: gold,
  });

  // Header Title
  page.drawText("DEEVEE CAPITAL", {
    x: 44,
    y: height - 48,
    size: 22,
    font: timesBold,
    color: lightBg,
  });

  page.drawText("FOUNDER PITCH MEMORANDUM · CONFIDENTIAL", {
    x: 44,
    y: height - 68,
    size: 8.5,
    font: helveticaBold,
    color: gold,
  });

  // Date and Reference badge in header
  const istDate = new Date(data.submittedAt).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  page.drawText(`REF: ${data.referenceId}`, {
    x: width - 180,
    y: height - 48,
    size: 11,
    font: helveticaBold,
    color: lightBg,
  });

  page.drawText(`${istDate} IST`, {
    x: width - 180,
    y: height - 66,
    size: 8.5,
    font: helvetica,
    color: gold,
  });

  let currentY = height - 125;

  // 2. Executive Overview Box
  page.drawRectangle({
    x: 40,
    y: currentY - 140,
    width: width - 80,
    height: 140,
    color: lightBg,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  // Section Header: Company Overview
  page.drawText("COMPANY & FOUNDER SUMMARY", {
    x: 55,
    y: currentY - 22,
    size: 9.5,
    font: helveticaBold,
    color: navy,
  });

  // Divider line
  page.drawLine({
    start: { x: 55, y: currentY - 30 },
    end: { x: width - 55, y: currentY - 30 },
    thickness: 0.5,
    color: borderGrey,
  });

  // Left Column (Startup details)
  const drawField = (label: string, value: string, x: number, y: number, isLink = false) => {
    const cleanLabel = sanitizePdfText(label).toUpperCase();
    const cleanValue = sanitizePdfText(value).slice(0, 45);

    page.drawText(cleanLabel, {
      x,
      y,
      size: 7.5,
      font: helveticaBold,
      color: grey,
    });
    page.drawText(cleanValue, {
      x,
      y: y - 13,
      size: 10,
      font: isLink ? helveticaOblique : helveticaBold,
      color: navy,
    });
  };

  drawField("Startup Name", data.startupName, 55, currentY - 50);
  drawField("Primary Sector", data.sector, 55, currentY - 82);
  drawField("Development Stage", data.stage, 55, currentY - 114);

  // Right Column (Founder details)
  drawField("Founder Name", data.founderName, 310, currentY - 50);
  drawField("Contact Email", data.founderEmail, 310, currentY - 82);
  drawField("Capital Sought", data.fundingSought || "Not specified", 310, currentY - 114);

  currentY -= 160;

  // 3. Links Section (Website & Deck)
  if (data.websiteUrl || data.pitchDeckUrl) {
    page.drawRectangle({
      x: 40,
      y: currentY - 45,
      width: width - 80,
      height: 45,
      color: rgb(1, 1, 1),
      borderColor: borderGrey,
      borderWidth: 1,
    });

    if (data.websiteUrl) {
      page.drawText("WEBSITE / DEMO:", {
        x: 55,
        y: currentY - 20,
        size: 8,
        font: helveticaBold,
        color: grey,
      });
      page.drawText(sanitizePdfText(data.websiteUrl).slice(0, 48), {
        x: 145,
        y: currentY - 20,
        size: 9,
        font: helvetica,
        color: navy,
      });
    }

    if (data.pitchDeckUrl) {
      page.drawText("PITCH DECK URL:", {
        x: 55,
        y: currentY - 35,
        size: 8,
        font: helveticaBold,
        color: grey,
      });
      page.drawText(sanitizePdfText(data.pitchDeckUrl).slice(0, 60), {
        x: 145,
        y: currentY - 35,
        size: 9,
        font: helvetica,
        color: navy,
      });
    }

    currentY -= 65;
  }

  // 4. Problem & Business Description Section
  page.drawText("EXECUTIVE PROBLEM & THESIS DESCRIPTION", {
    x: 44,
    y: currentY,
    size: 10,
    font: helveticaBold,
    color: navy,
  });

  page.drawLine({
    start: { x: 44, y: currentY - 6 },
    end: { x: width - 44, y: currentY - 6 },
    thickness: 1,
    color: navy,
  });

  currentY -= 24;

  // Simple clean word-wrapping for description
  const maxWidth = width - 88;
  const fontSize = 10;
  const lineHeight = 15;
  const cleanDescription = sanitizePdfText(data.description);
  const words = cleanDescription.split(/\s+/);
  let currentLine = "";
  const lines: string[] = [];

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = helvetica.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Render lines with background box
  const boxHeight = Math.max(lines.length * lineHeight + 24, 80);
  page.drawRectangle({
    x: 40,
    y: currentY - boxHeight,
    width: width - 80,
    height: boxHeight,
    color: lightBg,
    borderColor: navy,
    borderWidth: 0.5,
  });

  let textY = currentY - 18;
  for (const line of lines) {
    if (textY < 90) break; // Safeguard bottom margin
    page.drawText(line, {
      x: 55,
      y: textY,
      size: fontSize,
      font: helvetica,
      color: charcoal,
      lineHeight,
    });
    textY -= lineHeight;
  }

  // 5. Footer with Confidentiality Note
  page.drawLine({
    start: { x: 40, y: 55 },
    end: { x: width - 40, y: 55 },
    thickness: 0.5,
    color: borderGrey,
  });

  page.drawText(
    "CONFIDENTIAL & PROPRIETARY — PREPARED FOR DEEVEE CAPITAL INVESTMENT TEAM",
    {
      x: 44,
      y: 42,
      size: 7.5,
      font: helveticaBold,
      color: grey,
    }
  );

  page.drawText(
    "Associated with Dee Vee Projects Limited (dvplindia.in) · Recorded via deeveecapital.com",
    {
      x: 44,
      y: 30,
      size: 7.5,
      font: helvetica,
      color: grey,
    }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
