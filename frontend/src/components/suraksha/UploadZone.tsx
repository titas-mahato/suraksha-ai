import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { FileUp, FileText, ShieldCheck, Lock, Sparkles } from "lucide-react";

interface Props {
  onSubmit: (file: File) => void;
}

export function UploadZone({ onSubmit }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
  setFile(file);
  if (file) {
    setTimeout(() => onSubmit(file), 450);
  }
}, [onSubmit]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3" style={{ color: "var(--color-primary)" }} />
          AI-powered forensic underwriting
        </div>
        <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-foreground text-balance">
          Real-Time Document Fraud Detection
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[14.5px] text-muted-foreground text-balance">
          Upload a land record, financial statement, or legal document. Suraksha&apos;s agent
          ensemble surfaces tampering, metadata anomalies, and underwriting risk in seconds.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={[
          "relative w-full overflow-hidden rounded-xl border bg-surface shadow-elevate transition-all",
          dragOver ? "border-primary" : "border-border",
        ].join(" ")}
      >
        <div className="grid-bg absolute inset-0 opacity-50" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex w-full flex-col items-center justify-center gap-4 px-8 py-16 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface-2 shadow-elevate-sm">
            <FileUp className="h-6 w-6" style={{ color: "var(--color-primary)" }} strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[15px] font-medium text-foreground">
              {file ? file.name : "Drop a PDF or image to begin analysis"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              or <span className="font-medium text-primary">click to browse</span> · PDF, PNG, JPG up to 25 MB
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </button>

        <div className="relative grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-3">
          <TrustItem icon={<ShieldCheck className="h-3.5 w-3.5" />} title="SOC 2 aligned" sub="Encrypted in transit & at rest" />
          <TrustItem icon={<Lock className="h-3.5 w-3.5" />} title="Zero retention" sub="Documents purged post-analysis" />
          <TrustItem icon={<FileText className="h-3.5 w-3.5" />} title="Agent ensemble" sub="OCR · Metadata · CV · Layout · Risk" />
        </div>
      </motion.div>

      <button
        onClick={() => {
  const fakeFile = new File(
    ["demo"],
    "Sale_Deed_LR-2026-0098217.pdf",
    {
      type: "application/pdf",
    }
  );

  handleFile(fakeFile);
}}
        className="mt-5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Or try a sample tampered land record →
      </button>
    </div>
  );
}

function TrustItem({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-surface px-4 py-3">
      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
        {icon}
      </div>
      <div>
        <div className="text-[12.5px] font-medium text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
