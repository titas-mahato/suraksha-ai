import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, AlertOctagon, AlertTriangle, CheckCircle2, Info, MapPin } from "lucide-react";
import type { AgentReport, Severity } from "@/lib/suraksha/mock-data";
import { formatPercent, severityColor } from "@/lib/suraksha/format";

interface Props {
  agent: AgentReport;
  active: boolean;
  onSelect: () => void;
}

const SeverityIcon: Record<Severity, React.ElementType> = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  ok: CheckCircle2,
  info: Info,
};

export function DynamicAgentCard({ agent, active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const color = `var(${agent.color_token})`;
  const sevColor = severityColor(agent.status);
  const Icon = SeverityIcon[agent.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={[
        "group relative cursor-pointer overflow-hidden rounded-xl border bg-surface shadow-elevate-sm transition-all",
        active ? "ring-2" : "hover:border-border-strong",
      ].join(" ")}
      style={{
        borderColor: active ? color : "var(--color-border)",
        // @ts-expect-error custom property
        "--tw-ring-color": active ? `color-mix(in oklab, ${color} 30%, transparent)` : undefined,
      }}
    >
      {/* Left accent stripe */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: color }}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {agent.category}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                {agent.agent_name}
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                style={{
                  background: `color-mix(in oklab, ${sevColor} 14%, transparent)`,
                  color: sevColor,
                }}
              >
                <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
                {agent.status}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              {agent.summary}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
        </div>

        {/* Mini metrics row */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniMetric label="Risk" value={formatPercent(agent.risk_score)} color={sevColor} fill={agent.risk_score} />
          <MiniMetric label="Confidence" value={formatPercent(agent.confidence)} fill={agent.confidence} />
        </div>

        {agent.highlights.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" style={{ color }} />
            <span>
              {agent.highlights.length} region{agent.highlights.length === 1 ? "" : "s"} flagged
              <span className="text-muted-foreground/60"> · click to inspect</span>
            </span>
          </div>
        )}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 border-t border-border pt-3">
                {agent.metrics && agent.metrics.length > 0 && (
                  <div>
                    <SectionLabel>Metrics</SectionLabel>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {agent.metrics.map((m) => (
                        <MiniMetric
                          key={m.label}
                          label={m.label}
                          value={m.format === "percent" ? formatPercent(m.value) : m.value.toFixed(2)}
                          fill={m.value}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <SectionLabel>Findings</SectionLabel>
                  <dl className="mt-1.5 divide-y divide-border overflow-hidden rounded-md border border-border">
                    {agent.findings.map((f) => (
                      <div key={f.label} className="flex items-baseline justify-between gap-3 bg-surface-2 px-2.5 py-1.5">
                        <dt className="text-[11.5px] text-muted-foreground">{f.label}</dt>
                        <dd
                          className="text-right font-mono text-[11.5px] font-medium tabular-nums"
                          style={{ color: f.severity ? severityColor(f.severity) : "var(--color-foreground)" }}
                        >
                          {f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {agent.highlights.length > 0 && (
                  <div>
                    <SectionLabel>Flagged regions</SectionLabel>
                    <ul className="mt-1.5 space-y-1">
                      {agent.highlights.map((h) => (
                        <li
                          key={h.id}
                          onClick={(e) => { e.stopPropagation(); onSelect(); }}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] hover:bg-surface-2"
                        >
                          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: color }} />
                          <span className="flex-1 truncate text-foreground">{h.label}</span>
                          <span className="font-mono text-[10.5px] text-muted-foreground">
                            {formatPercent(h.confidence)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
      {children}
    </div>
  );
}

function MiniMetric({
  label, value, color, fill,
}: { label: string; value: string; color?: string; fill?: number }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-2.5 py-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span
          className="font-mono text-[12px] font-semibold tabular-nums"
          style={{ color: color ?? "var(--color-foreground)" }}
        >
          {value}
        </span>
      </div>
      {fill !== undefined && (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full"
            style={{ background: color ?? "var(--color-primary)" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(1, Math.max(0, fill)) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
