import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Stage {
  id: string;
  label: string;
  sublabel: string;
}

const STAGES: Stage[] = [
  { id: "ocr",   label: "OCR Extraction",          sublabel: "Decoding text & fields" },
  { id: "type",  label: "Document Classification", sublabel: "Identifying document template" },
  { id: "meta",  label: "Metadata Forensics",      sublabel: "Inspecting file ancestry" },
  { id: "cv",    label: "CV Tampering Analysis",   sublabel: "Running ELA & copy-move detection" },
  { id: "align", label: "Font & Alignment",        sublabel: "Detecting layout drift" },
  { id: "risk",  label: "Risk Scoring",            sublabel: "Aggregating agent verdicts" },
];

interface Props {
  onComplete: () => void;
  fileName: string;
}

export function ProcessingPipeline({ onComplete, fileName }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= STAGES.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActive((a) => a + 1), 650);
    return () => clearTimeout(t);
  }, [active, onComplete]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-2xl flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Analysing
        </div>
        <div className="mt-1 font-mono text-sm text-foreground">{fileName}</div>
      </motion.div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-surface shadow-elevate">
        <div className="relative h-1 w-full overflow-hidden bg-surface-2">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (active / STAGES.length) * 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <ul className="divide-y divide-border">
          {STAGES.map((s, i) => {
            const done = i < active;
            const inProgress = i === active;
            return (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                <StageIcon done={done} inProgress={inProgress} />
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium text-foreground">{s.label}</div>
                  <div className="text-[11.5px] text-muted-foreground">{s.sublabel}</div>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {done ? "OK" : inProgress ? "…" : ""}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function StageIcon({ done, inProgress }: { done: boolean; inProgress: boolean }) {
  if (done) {
    return (
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: "color-mix(in oklab, var(--color-success) 16%, transparent)" }}
      >
        <Check className="h-3.5 w-3.5" style={{ color: "var(--color-success)" }} strokeWidth={3} />
      </div>
    );
  }
  if (inProgress) {
    return (
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: "color-mix(in oklab, var(--color-primary) 16%, transparent)" }}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }
  return <div className="h-6 w-6 rounded-full border border-border bg-surface-2" />;
}
