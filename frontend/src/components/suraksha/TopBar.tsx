import { motion } from "framer-motion";
import { ShieldCheck, Upload, CircleDot } from "lucide-react";

type Status = "idle" | "processing" | "complete";

interface Props {
  status: Status;
  onUpload: () => void;
  documentId?: string;
}

export function TopBar({ status, onUpload, documentId }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-elevate-sm">
              <ShieldCheck className="h-4.5 w-4.5" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight text-foreground">
                Suraksha AI
              </div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Document Fraud Intelligence
              </div>
            </div>
          </div>
          {documentId && (
            <div className="hidden items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground md:flex">
              <span className="font-mono text-[11px] text-foreground/70">{documentId}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-elevate-sm transition-colors hover:bg-surface-2"
          >
            <Upload className="h-3.5 w-3.5" />
            New document
          </button>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    idle: { color: "var(--color-muted-foreground)", label: "Awaiting upload" },
    processing: { color: "var(--color-info)", label: "Analysing" },
    complete: { color: "var(--color-success)", label: "Analysis complete" },
  } as const;
  const s = map[status];
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
      <motion.span
        animate={status === "processing" ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 1.2, repeat: status === "processing" ? Infinity : 0 }}
        className="inline-flex h-2 w-2 items-center justify-center"
      >
        <CircleDot className="h-2 w-2" style={{ color: s.color }} fill={s.color} strokeWidth={0} />
      </motion.span>
      <span style={{ color: s.color }}>{s.label}</span>
    </div>
  );
}
