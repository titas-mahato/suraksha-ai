import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { TopBar } from "@/components/suraksha/TopBar";
import { UploadZone } from "@/components/suraksha/UploadZone";
import { ProcessingPipeline } from "@/components/suraksha/ProcessingPipeline";
import { DocumentViewer } from "@/components/suraksha/DocumentViewer";
import { AnalysisPanel } from "@/components/suraksha/AnalysisPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Suraksha AI — Document Fraud Intelligence" },
      {
        name: "description",
        content:
          "Real-time AI document fraud detection for bank underwriting.",
      },
    ],
  }),
  component: Index,
});

type Stage = "upload" | "processing" | "ready";

function Index() {
  const [stage, setStage] = useState<Stage>("upload");

  const [fileName, setFileName] = useState<string>("");

  const [active, setActive] = useState<"all" | string[] | null>(null);

  const [focusId, setFocusId] = useState<string | null>(null);

  const [analysisData, setAnalysisData] = useState<any>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopBar
        status={
          stage === "upload"
            ? "idle"
            : stage === "processing"
              ? "processing"
              : "complete"
        }
        onUpload={() => {
          setStage("upload");
          setActive(null);
          setFocusId(null);
        }}
        documentId={analysisData?.document_id}
      />

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* UPLOAD SCREEN */}
          {stage === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full overflow-auto"
            >
              <UploadZone
                onSubmit={async (file: File) => {

                  setFileName(file.name);

                  setStage("processing");

                  try {

                    const formData = new FormData();

                    formData.append("file", file);

                    const response = await fetch(
                      "http://127.0.0.1:8000/api/v1/analyze",
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    const data = await response.json();

                    console.log(data);

                    // Temporary frontend compatibility layer
                    const transformedData = {
                      document_id: data.document_id,

                      document_title: data.filename,

                      risk_assessment: data.risk_assessment,

                      agents: [
                        {
                          id: "ocr-agent",

                          agent_name: "OCR Agent",

                          category: "Extraction",

                          status: "ok",

                          summary:
                            "Extracts structured text, entities, and layout content from uploaded documents.",

                          confidence: 0.93,

                          risk_score: 0.08,

                          color_token: "--agent-ocr",

                          metrics: [
                            {
                              label: "OCR Confidence",
                              value: 0.93,
                              format: "percent",
                            },
                          ],

                          findings: [
                            {
                              label: "Extracted Characters",
                              value: String(data.ocr_data?.text?.length || 0),
                            },

                            {
                              label: "OCR Status",
                              value: "Text extraction successful",
                            },
                          ],

                          highlights: [],
                        },
                        {
                          id: "classification-agent",

                          agent_name: "Classification Agent",

                          category: "NLP",

                          status: "ok",

                          summary:
                            "Uses NLP and keyword intelligence to classify underwriting documents.",

                          confidence: 0.89,

                          risk_score: 0.05,

                          color_token: "--agent-classifier",

                          metrics: [
                            {
                              label: "Classification Confidence",
                              value: 0.89,
                              format: "percent",
                            },
                          ],

                          findings: [
                            {
                              label: "Detected Document Type",
                              value: String(data.document_type || "Unknown"),
                            },
                          ],

                          highlights: [],
                        },
                        {
                          id: "metadata-agent",

                          agent_name: "Metadata Agent",

                          category: "Forensics",

                          status: data.metadata_summary?.is_edited_externally
                            ? "warning"
                            : "ok",

                          summary:
                            "Analyzes PDF metadata, creator tools, timestamps, and suspicious editing traces.",

                          confidence: 0.88,

                          risk_score: data.metadata_summary?.is_edited_externally
                            ? 0.65
                            : 0.12,

                          color_token: "--agent-metadata",

                          metrics: [
                            {
                              label: "Metadata Risk",
                              value: data.metadata_summary?.is_edited_externally ? 0.65 : 0.12,
                              format: "percent",
                            },
                          ],

                          findings: Object.entries(data.metadata_summary || {}).map(
                            ([key, value]) => ({
                              label: key,
                              value: String(value),
                            })
                          ),

                          highlights: [],
                        },

                        {
                          id: "cv-agent",

                          agent_name: "CV Fraud Agent",

                          category: "Computer Vision",

                          status: data.cv_fraud_metrics?.splicing_detected
                            ? "critical"
                            : "ok",

                          summary:
                            "Performs ELA analysis, splicing detection, and compression anomaly inspection.",

                          confidence: 0.91,

                          risk_score: data.cv_fraud_metrics?.ela_anomaly_score || 0.1,

                          color_token: "--agent-cv",

                          metrics: [
                            {
                              label: "ELA Score",
                              value: data.cv_fraud_metrics?.ela_anomaly_score || 0,
                              format: "percent",
                            },
                          ],

                          findings: Object.entries(data.cv_fraud_metrics || {}).map(
                            ([key, value]) => ({
                              label: key,
                              value: String(value),
                            })
                          ),

                          highlights: [],
                        },

                        {
                          id: "alignment-agent",

                          agent_name: "Font & Alignment Agent",

                          category: "Typography",

                          status: data.alignment_metrics?.baseline_shift_detected
                            ? "warning"
                            : "ok",

                          summary:
                            "Detects baseline shifts, spacing inconsistencies, and sharpness mismatches.",

                          confidence: 0.84,

                          risk_score: data.alignment_metrics?.baseline_shift_detected
                            ? 0.58
                            : 0.14,

                          color_token: "--agent-alignment",

                          metrics: [
                            {
                              label: "Sharpness",
                              value:
                                Math.min(
                                  (data.alignment_metrics?.raw_sharpness_score || 0) / 3000,
                                  1
                                ),
                              format: "percent",
                            },
                          ],

                          findings: Object.entries(data.alignment_metrics || {}).map(
                            ([key, value]) => ({
                              label: key,
                              value: String(value),
                            })
                          ),

                          highlights: [],
                        },
                        {
  id: "risk-agent",

  agent_name: "Risk Scoring Agent",

  category: "Decision",

  status:
    data.risk_assessment?.fraud_score > 0.6
      ? "critical"
      : data.risk_assessment?.fraud_score > 0.25
      ? "warning"
      : "ok",

  summary:
    "Aggregates all forensic agent outputs into a final underwriting verdict.",

  confidence: data.risk_assessment?.confidence || 0.88,

  risk_score: data.risk_assessment?.fraud_score || 0,

  color_token: "--agent-risk",

  metrics: [
    {
      label: "Fraud Probability",
      value: data.risk_assessment?.fraud_score || 0,
      format: "percent",
    },
  ],

  findings: [
    {
      label: "Recommendation",
      value: String(
        data.risk_assessment?.recommendation || "Unknown"
      ),
    },
  ],

  highlights: [],
},
                      ],
                    };

                    setAnalysisData(transformedData);

                    setStage("ready");

                  } catch (error) {

                    console.error(error);

                  }
                }}
              />
            </motion.div>
          )}

          {/* PROCESSING SCREEN */}
          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full overflow-auto"
            >
              <ProcessingPipeline
                fileName={fileName}
                onComplete={() => { }}
              />
            </motion.div>
          )}

          {/* RESULTS SCREEN */}
          {stage === "ready" && analysisData && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid h-full grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]"
            >
              <DocumentViewer
                agents={analysisData.agents}
                active={active}
                focusHighlightId={focusId}
                title={analysisData.document_title}
              />

              <AnalysisPanel
                data={analysisData}
                onActiveHighlightsChange={(a, f) => {
                  setActive(a);
                  setFocusId(f);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}