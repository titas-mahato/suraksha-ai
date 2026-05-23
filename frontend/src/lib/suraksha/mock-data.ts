// Mock backend response — frontend renders entirely from this shape so
// future agents can be added without UI changes.

export type Severity = "info" | "ok" | "warning" | "critical";

export interface Highlight {
  id: string;
  // Coordinates are percentages of the document viewer (0-100), so the
  // overlay scales with any document size.
  x: number;
  y: number;
  w: number;
  h: number;
  page?: number;
  label: string;
  severity: Severity;
  confidence: number;
  explanation: string;
}

export interface Finding {
  label: string;
  value: string;
  severity?: Severity;
}

export interface Metric {
  label: string;
  value: number; // 0..1
  format?: "percent" | "score";
}

export interface AgentReport {
  agent_id: string;
  agent_name: string;
  category: string;
  // 'color' is a CSS variable name — the renderer picks it up dynamically so
  // new agent types map to their own palette without UI changes.
  color_token:
    | "--color-agent-ocr"
    | "--color-agent-meta"
    | "--color-agent-cv"
    | "--color-agent-align"
    | "--color-agent-risk";
  status: Severity;
  confidence: number;
  risk_score: number;
  summary: string;
  findings: Finding[];
  metrics?: Metric[];
  highlights: Highlight[];
}

export interface RiskAssessment {
  fraud_score: number; // 0..1
  confidence: number; // 0..1
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation:
    | "PASSED AUTOMATED UNDERWRITING"
    | "FLAG FOR MANUAL REVIEW"
    | "REQUIRES ADDITIONAL VERIFICATION"
    | "REJECT / HIGH FRAUD RISK";
  rationale: string;
}

export interface AnalysisResponse {
  document_id: string;
  document_type: string;
  document_title: string;
  jurisdiction: string;
  pages: number;
  analyzed_at: string;
  risk_assessment: RiskAssessment;
  agents: AgentReport[];
}

export const mockResponse: AnalysisResponse = {
  document_id: "LR-2026-0098217",
  document_type: "Land Sale Deed",
  document_title: "Sale Deed — Survey No. 142/3-B, Whitefield, Bengaluru",
  jurisdiction: "Sub-Registrar Office, Bengaluru East",
  pages: 1,
  analyzed_at: new Date().toISOString(),
  risk_assessment: {
    fraud_score: 0.82,
    confidence: 0.91,
    risk_level: "HIGH",
    recommendation: "FLAG FOR MANUAL REVIEW",
    rationale:
      "Multiple agents detected concurrent tampering signatures: edited consideration value, "
      + "metadata inconsistency between scan date and notarisation date, and ELA anomalies "
      + "around the signature block.",
  },
  agents: [
    {
      agent_id: "ocr",
      agent_name: "OCR & NLP Extraction",
      category: "Text Intelligence",
      color_token: "--color-agent-ocr",
      status: "ok",
      confidence: 0.97,
      risk_score: 0.08,
      summary: "Document text extracted cleanly. Field structure matches a standard sale deed template.",
      findings: [
        { label: "Pages processed", value: "1 / 1" },
        { label: "Recognised fields", value: "18" },
        { label: "Language", value: "English + Kannada" },
        { label: "Template match", value: "Karnataka Sale Deed v3.2", severity: "ok" },
      ],
      metrics: [
        { label: "Recognition accuracy", value: 0.97, format: "percent" },
        { label: "Field completeness", value: 0.94, format: "percent" },
      ],
      highlights: [
        {
          id: "ocr-1",
          x: 8, y: 14, w: 84, h: 6,
          label: "Document title",
          severity: "info",
          confidence: 0.99,
          explanation: "Title block extracted with high confidence.",
        },
      ],
    },
    {
      agent_id: "meta",
      agent_name: "Metadata Forensics",
      category: "File Forensics",
      color_token: "--color-agent-meta",
      status: "warning",
      confidence: 0.88,
      risk_score: 0.64,
      summary:
        "PDF metadata indicates the file was last modified in Adobe Photoshop 25.6, three days "
        + "after the stated notarisation date.",
      findings: [
        { label: "Producer", value: "Adobe Photoshop 25.6", severity: "warning" },
        { label: "Created", value: "2026-03-12 09:14" },
        { label: "Modified", value: "2026-03-15 22:47", severity: "warning" },
        { label: "Notarised on (text)", value: "2026-03-12" },
        { label: "Delta", value: "+3 days after notarisation", severity: "critical" },
      ],
      metrics: [
        { label: "Metadata coherence", value: 0.36, format: "percent" },
      ],
      highlights: [
        {
          id: "meta-1",
          x: 6, y: 6, w: 88, h: 6,
          label: "Header / metadata band",
          severity: "warning",
          confidence: 0.88,
          explanation: "Modification timestamp inconsistent with notarisation date.",
        },
      ],
    },
    {
      agent_id: "cv",
      agent_name: "CV Tampering Detection",
      category: "Image Forensics",
      color_token: "--color-agent-cv",
      status: "critical",
      confidence: 0.93,
      risk_score: 0.86,
      summary:
        "Error-Level Analysis detected localised re-compression around the consideration value "
        + "and signature block, consistent with raster-level edits.",
      findings: [
        { label: "ELA peak region", value: "Consideration field", severity: "critical" },
        { label: "Sharpness delta", value: "+38% vs surrounding text", severity: "critical" },
        { label: "Copy-move score", value: "0.71", severity: "warning" },
        { label: "Compression layers", value: "3 (expected 1)", severity: "warning" },
      ],
      metrics: [
        { label: "Tampering likelihood", value: 0.86, format: "percent" },
        { label: "ELA peak intensity", value: 0.78, format: "percent" },
      ],
      highlights: [
        {
          id: "cv-1",
          x: 50, y: 47, w: 38, h: 6,
          label: "Edited consideration value",
          severity: "critical",
          confidence: 0.94,
          explanation:
            "Pixel sharpness, JPEG quantisation tables and ELA all diverge sharply from "
            + "the surrounding paragraph. The numeric value appears to have been overwritten.",
        },
        {
          id: "cv-2",
          x: 55, y: 80, w: 30, h: 10,
          label: "Suspicious signature region",
          severity: "critical",
          confidence: 0.88,
          explanation:
            "Signature exhibits cloned stroke patterns and a re-compression boundary "
            + "around its bounding box.",
        },
      ],
    },
    {
      agent_id: "align",
      agent_name: "Font & Alignment Analysis",
      category: "Layout Forensics",
      color_token: "--color-agent-align",
      status: "warning",
      confidence: 0.84,
      risk_score: 0.57,
      summary:
        "Baseline of the buyer's name drifts 2.3px relative to neighbouring lines and uses a "
        + "subtly different font weight.",
      findings: [
        { label: "Baseline drift", value: "2.3 px", severity: "warning" },
        { label: "Font family", value: "Times New Roman vs. Liberation Serif", severity: "warning" },
        { label: "Kerning anomaly", value: "Present in buyer field", severity: "warning" },
      ],
      metrics: [
        { label: "Layout consistency", value: 0.43, format: "percent" },
      ],
      highlights: [
        {
          id: "align-1",
          x: 28, y: 38, w: 50, h: 4,
          label: "Buyer name — font mismatch",
          severity: "warning",
          confidence: 0.84,
          explanation:
            "Glyph metrics differ from the rest of the line. Likely re-typed in a different "
            + "editor before re-flattening.",
        },
      ],
    },
    {
      agent_id: "risk",
      agent_name: "Risk Aggregation",
      category: "Underwriting Intelligence",
      color_token: "--color-agent-risk",
      status: "critical",
      confidence: 0.91,
      risk_score: 0.82,
      summary:
        "Composite risk derived from agent ensemble. Cross-agent corroboration on the "
        + "consideration field elevates this above MEDIUM.",
      findings: [
        { label: "Agents reporting risk", value: "3 of 5", severity: "warning" },
        { label: "Cross-corroborated regions", value: "2", severity: "critical" },
        { label: "Underwriting policy", value: "Manual review required" },
      ],
      metrics: [
        { label: "Composite fraud score", value: 0.82, format: "percent" },
        { label: "Cross-agent agreement", value: 0.74, format: "percent" },
      ],
      highlights: [],
    },
  ],
};
