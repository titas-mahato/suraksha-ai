import type { Severity } from "./mock-data";

export function severityColor(sev: Severity): string {
  switch (sev) {
    case "critical": return "var(--color-critical)";
    case "warning": return "var(--color-warning)";
    case "ok": return "var(--color-success)";
    case "info":
    default: return "var(--color-info)";
  }
}

export function severityLabel(sev: Severity): string {
  return { critical: "Critical", warning: "Warning", ok: "Clear", info: "Info" }[sev];
}

export function riskLevelColor(level: string): string {
  switch (level) {
    case "CRITICAL": return "var(--color-critical)";
    case "HIGH": return "var(--color-warning)";
    case "MEDIUM": return "var(--color-info)";
    case "LOW":
    default: return "var(--color-success)";
  }
}

export function tokenToColor(token: string): string {
  return `var(${token})`;
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}
