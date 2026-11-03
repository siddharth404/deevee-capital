import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { uploadPitchAttachment } from "@/lib/gcs";
import { requireAuthenticatedUser } from "@/lib/workspace/auth";
import {
  getWorkspaceDb,
  recordAuditAndActivity,
  saveWorkspaceDb,
} from "@/lib/workspace/db";
import { canViewStartup, hasPermission } from "@/lib/workspace/permissions";
import {
  ConfidentialityLevel,
  DocumentCategory,
  WorkspaceDocument,
} from "@/lib/workspace/types";

export const runtime = "nodejs";

function escapeCsvCell(val: unknown): string {
  const s = val == null ? "" : String(val).replace(/\r?\n/g, " ");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const authCheck = await requireAuthenticatedUser(request);
  if (!authCheck.ok) return authCheck.response;
  const { user } = authCheck;

  const { searchParams } = new URL(request.url);
  const exportType = searchParams.get("type") || "csv";
  const db = await getWorkspaceDb();

  // 1. Permission-Gated CSV Export of Startups
  if (exportType === "csv") {
    if (!hasPermission(user, "data.export")) {
      return NextResponse.json(
        {
          ok: false,
          error: "forbidden",
          message:
            "Export Restricted: Your role does not have 'data.export' permission to export the startup database.",
        },
        { status: 403 }
      );
    }

    const stageFilter = searchParams.get("stage") || "";
    const sectorFilter = searchParams.get("sector") || "";

    const startups = db.startups.filter((st) => {
      if (!canViewStartup(user, st)) return false;
      if (stageFilter && st.pipelineStage !== stageFilter) return false;
      if (sectorFilter && st.sector !== sectorFilter) return false;
      return true;
    });

    const headers = [
      "Startup ID",
      "Startup Name",
      "Website",
      "Sector",
      "Industry",
      "Pipeline Stage",
      "Priority",
      "Source",
      "Primary Founder",
      "Founder Email",
      "Funding Stage",
      "Funding Sought",
      "Current Revenue",
      "Assigned Lead",
      "Assigned Researcher",
      "Latest Decision",
      "Created At",
    ];

    const rows = startups.map((st) => [
      st.startupCode,
      st.name,
      st.website || "",
      st.sector,
      st.industry || "",
      st.pipelineStage,
      st.priority,
      st.source,
      st.founders[0]?.name || "",
      st.founders[0]?.email || "",
      st.funding.currentStage || "",
      st.funding.fundingSought || "",
      st.traction.currentRevenue || "",
      st.assignedLeadName || "",
      st.assignedResearcherName || "",
      st.latestDecision
        ? `${st.latestDecision.outcome} (${st.latestDecision.decidedByName})`
        : "Pending",
      st.createdAt,
    ]);

    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((r) => r.map(escapeCsvCell).join(",")),
    ].join("\n");

    await recordAuditAndActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "data.exported_csv",
      entityType: "startup",
      entityId: "csv-export",
      entityName: `${startups.length} startups`,
      summary: `${user.name} exported ${startups.length} startup records to CSV`,
    });
    await saveWorkspaceDb(db);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Deevee_Capital_DealFlow_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  // 2. PDF Startup Research & Evaluation Dossier Export
  if (exportType === "pdf_profile") {
    const startupId = searchParams.get("startupId") || "";
    const startup = db.startups.find((s) => s.id === startupId);

    if (!startup || !canViewStartup(user, startup)) {
      return NextResponse.json(
        { ok: false, message: "Startup not found or access denied." },
        { status: 403 }
      );
    }

    const research = db.research.find((r) => r.startupId === startup.id);
    const sources = db.research_sources.filter((s) => s.startupId === startup.id);
    const competitors = db.competitors.filter((c) => c.startupId === startup.id);
    const evaluations = db.evaluations.filter((e) => e.startupId === startup.id);

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    let y = 790;

    const navy = rgb(0.06, 0.1, 0.14);
    const gold = rgb(0.77, 0.68, 0.48);
    const slate = rgb(0.35, 0.38, 0.42);

    const ensureSpace = (needed: number) => {
      if (y - needed < 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 790;
      }
    };

    const drawLine = (text: string, size = 10, bold = false, color = navy) => {
      const clean = text.replace(/[^\x20-\x7E]/g, " ");
      const maxChars = Math.floor(495 / (size * 0.52));
      const words = clean.split(" ");
      let current = "";
      for (const w of words) {
        if ((current + " " + w).trim().length > maxChars) {
          ensureSpace(size + 6);
          page.drawText(current.trim(), {
            x: 50,
            y,
            size,
            font: bold ? fontBold : fontRegular,
            color,
          });
          y -= size + 5;
          current = w;
        } else {
          current = (current + " " + w).trim();
        }
      }
      if (current.trim()) {
        ensureSpace(size + 6);
        page.drawText(current.trim(), {
          x: 50,
          y,
          size,
          font: bold ? fontBold : fontRegular,
          color,
        });
        y -= size + 6;
      }
    };

    // Header
    drawLine("DEEVEE CAPITAL — INVESTMENT RESEARCH & EVALUATION DOSSIER", 13, true, navy);
    page.drawLine({
      start: { x: 50, y: y + 2 },
      end: { x: 545, y: y + 2 },
      thickness: 1.5,
      color: gold,
    });
    y -= 14;

    drawLine(`${startup.name} (${startup.startupCode})`, 16, true, navy);
    drawLine(
      `Stage: ${startup.pipelineStage} | Sector: ${startup.sector} | Source: ${startup.source} | Priority: ${startup.priority}`,
      9.5,
      false,
      slate
    );
    drawLine(
      `Lead: ${startup.assignedLeadName || "Unassigned"} | Primary Researcher: ${startup.assignedResearcherName || "Unassigned"}`,
      9.5,
      false,
      slate
    );
    y -= 8;

    drawLine("1. COMPANY & FOUNDER OVERVIEW", 11, true, navy);
    drawLine(`Description: ${startup.description || "N/A"}`, 9.5);
    for (const f of startup.founders) {
      drawLine(`Founder: ${f.name} (${f.role}) — ${f.email}`, 9.5);
    }
    drawLine(
      `Funding Stage: ${startup.funding.currentStage || "N/A"} | Sought: ${startup.funding.fundingSought || "N/A"}`,
      9.5
    );
    y -= 8;

    if (research) {
      drawLine("2. STRUCTURED RESEARCH SUMMARY", 11, true, navy);
      drawLine(`Research Status: ${research.status.toUpperCase()} (v${research.version})`, 9.5, true);
      if (research.marketResearch.tam) {
        drawLine(
          `TAM: ${research.marketResearch.tam} | Source: ${research.marketResearch.tamSource} | Methodology: ${research.marketResearch.tamMethodology}`,
          9.5
        );
      }
      if (research.conclusion.executiveSummary) {
        drawLine(`Executive Summary: ${research.conclusion.executiveSummary}`, 9.5);
      }
      if (research.conclusion.mainConcerns) {
        drawLine(`Main Concerns: ${research.conclusion.mainConcerns}`, 9.5);
      }
      if (research.conclusion.questionsForFounders) {
        drawLine(`Questions for Founders: ${research.conclusion.questionsForFounders}`, 9.5);
      }
      y -= 8;

      if (research.risksRedFlags.length > 0) {
        drawLine("3. RISK REGISTER & RED FLAGS", 11, true, navy);
        for (const r of research.risksRedFlags) {
          drawLine(
            `[${r.severity}] ${r.category}: ${r.description} (Mitigation: ${r.mitigation || "Pending"})`,
            9.5
          );
        }
        y -= 8;
      }
    }

    if (competitors.length > 0) {
      drawLine("4. COMPETITOR LANDSCAPE", 11, true, navy);
      for (const c of competitors) {
        drawLine(
          `${c.name} (${c.geography}): ${c.product} | Differentiation: ${c.differentiation}`,
          9.5
        );
      }
      y -= 8;
    }

    if (sources.length > 0) {
      drawLine("5. VERIFIED CITATIONS & EVIDENCE", 11, true, navy);
      for (const s of sources) {
        drawLine(
          `[${s.confidenceLevel}] ${s.sourceTitle} (${s.sourceType}): ${s.sourceUrl}`,
          9
        );
      }
      y -= 8;
    }

    if (evaluations.length > 0) {
      drawLine("6. INVESTMENT EVALUATION SCORECARDS", 11, true, navy);
      for (const ev of evaluations) {
        drawLine(
          `Reviewer: ${ev.evaluatorName} | Weighted Score: ${ev.weightedScore}/5.00 | Recommendation: ${ev.recommendation}`,
          10,
          true
        );
        drawLine(`Strengths: ${ev.strengths || "N/A"} | Weaknesses: ${ev.weaknesses || "N/A"}`, 9.5);
      }
      y -= 8;
    }

    if (startup.decisionHistory.length > 0) {
      drawLine("7. OFFICIAL INVESTMENT DECISION HISTORY", 11, true, navy);
      for (const d of startup.decisionHistory) {
        drawLine(
          `${d.decidedAt.slice(0, 10)} — ${d.outcome} by ${d.decidedByName}: ${d.reason}`,
          9.5
        );
      }
    }

    const pdfBytes = await pdfDoc.save();

    await recordAuditAndActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "data.exported_pdf",
      entityType: "startup",
      entityId: startup.id,
      entityName: startup.name,
      startupId: startup.id,
      summary: `${user.name} generated PDF Research & Evaluation Dossier for ${startup.name}`,
    });
    await saveWorkspaceDb(db);

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Deevee_Capital_Dossier_${startup.startupCode}.pdf"`,
      },
    });
  }

  return NextResponse.json({ ok: false, message: "Invalid export type." }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuthenticatedUser(request);
  if (!authCheck.ok) return authCheck.response;
  const { user } = authCheck;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = String(formData.get("title") || "").trim();
    const startupId = String(formData.get("startupId") || "").trim();
    const category = (formData.get("category") as DocumentCategory) || "Market Research";
    const confidentiality =
      (formData.get("confidentiality") as ConfidentialityLevel) || "standard";

    if (!file || file.size === 0) {
      return NextResponse.json(
        { ok: false, message: "Please select a document file to upload." },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, message: "File exceeds 25MB limit." },
        { status: 400 }
      );
    }

    // Interns cannot upload confidential investment memos or legal docs
    if (user.role === "RESEARCH_ANALYST" && confidentiality === "confidential") {
      return NextResponse.json(
        {
          ok: false,
          message: "Interns can only upload Standard or Restricted research documents.",
        },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadRes = await uploadPitchAttachment(
      `doc_${Date.now()}_${file.name}`,
      buffer,
      file.type || "application/pdf"
    );

    const db = await getWorkspaceDb();
    const startup = startupId ? db.startups.find((s) => s.id === startupId) : null;
    const now = new Date().toISOString();

    const doc: WorkspaceDocument = {
      id: `doc-${Date.now().toString(36)}`,
      startupId: startup?.id || null,
      startupName: startup?.name || null,
      title: title || file.name,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
      category,
      confidentiality,
      allowedRoles:
        confidentiality === "confidential"
          ? ["SUPER_ADMIN", "INVESTMENT_LEAD"]
          : ["SUPER_ADMIN", "INVESTMENT_LEAD", "REVIEWER", "RESEARCH_ANALYST"],
      allowedUserIds: [user.id, "user-siddharth", "user-ravi"],
      storagePath: uploadRes.sanitizedName,
      downloadUrl: uploadRes.url,
      version: 1,
      uploadedBy: user.id,
      uploadedByName: user.name,
      createdAt: now,
    };

    db.documents.unshift(doc);

    await recordAuditAndActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "document.uploaded",
      entityType: "document",
      entityId: doc.id,
      entityName: doc.title,
      startupId: startup?.id || null,
      summary: `${user.name} uploaded '${doc.title}' (${doc.category} — ${doc.confidentiality})`,
    });

    await saveWorkspaceDb(db);
    return NextResponse.json({ ok: true, document: doc });
  } catch (err) {
    console.error("[Workspace Upload] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Document upload failed." },
      { status: 500 }
    );
  }
}
