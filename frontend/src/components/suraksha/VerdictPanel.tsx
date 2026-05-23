import { motion } from "framer-motion";
import { AlertOctagon, AlertTriangle, CheckCircle2, Layers, ShieldAlert } from "lucide-react";
import type { AnalysisResponse } from "@/lib/suraksha/mock-data";
import { formatPercent, riskLevelColor } from "@/lib/suraksha/format";

interface Props {
  data: AnalysisResponse;
  active: boolean;
  onToggleAll: () => void;
}

export function VerdictPanel({ data, active, onToggleAll }: Props) {
  const { risk_assessment: ra } = data;
  const color = riskLevelColor(ra.risk_level);

  const Icon =
    ra.risk_level === "CRITICAL" ? AlertOctagon
    : ra.risk_level === "HIGH" ? ShieldAlert
    : ra.risk_level === "MEDIUM" ? AlertTriangle
    : CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl border bg-surface shadow-elevate"
      style={{
        borderColor: active
          ? color
          : "var(--color-border)",
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: `color-mix(in oklab, ${color} 14%, transparent)` }}
            >
              <Icon className="h-5 w-5" style={{ color }} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Final Assessment
              </div>
              <div className="mt-0.5 text-[18px] font-semibold tracking-tight text-foreground">
                {ra.recommendation}
              </div>
            </div>
          </div>
          <button
            onClick={onToggleAll}
            className={[
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-foreground hover:bg-surface-2",
            ].join(" ")}
          >
            <Layers className="h-3.5 w-3.5" />
            {active ? "Hide overlays" : "Show all overlays"}
          </button>
        </div>

        {/* Stat row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard label="Fraud score" value={formatPercent(ra.fraud_score)} color={color} prominent />
          <StatCard label="Confidence" value={formatPercent(ra.confidence)} />
          <StatCard label="Risk level" value={ra.risk_level} color={color} />
        </div>

        {/* Risk meter */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Composite fraud likelihood</span>
            <span className="font-mono tabular-nums" style={{ color }}>{formatPercent(ra.fraud_score)}</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${ra.fraud_score * 100}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            {/* Tick marks */}
            <div className="pointer-events-none absolute inset-0 flex">
              {[25, 50, 75].map((t) => (
                <span key={t} className="block w-px bg-border" style={{ marginLeft: `${t}%` }} />
              ))}
            </div>
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9.5px] text-muted-foreground">
            <span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>CRITICAL</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function StatCard({
  label, value, color, prominent,
}: { label: string; value: string; color?: string; prominent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-1">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={["mt-0.5 font-semibold tracking-tight tabular-nums", prominent ? "text-[22px]" : "text-[16px]"].join(" ")}
        style={{ color: color ?? "var(--color-foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}
