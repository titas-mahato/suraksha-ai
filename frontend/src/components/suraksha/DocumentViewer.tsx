import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { AgentReport, Highlight } from "@/lib/suraksha/mock-data";

interface Props {
  agents: AgentReport[];
  // Which highlights are currently visible. If `null`, none. If an array of
  // highlight ids, only those. If 'all', every agent's highlights.
  active: "all" | string[] | null;
  // When the user picks a card, we focus a particular highlight (auto-scroll + pulse).
  focusHighlightId: string | null;
  title: string;
}

interface RenderableHighlight extends Highlight {
  color: string;
  agentName: string;
}

export function DocumentViewer({ agents, active, focusHighlightId, title }: Props) {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const docRef = useRef<HTMLDivElement>(null);

  const highlights = useMemo<RenderableHighlight[]>(() => {
    if (active === null) return [];
    const all = agents.flatMap((a) =>
      a.highlights.map((h) => ({ ...h, color: `var(${a.color_token})`, agentName: a.agent_name }))
    );
    if (active === "all") return all;
    return all.filter((h) => active.includes(h.id));
  }, [agents, active]);

  // Auto-scroll viewer to the focused highlight.
  useEffect(() => {
    if (!focusHighlightId || !docRef.current) return;
    const h = highlights.find((x) => x.id === focusHighlightId);
    if (!h) return;
    const el = docRef.current;
    const targetY = (h.y / 100) * el.scrollHeight - el.clientHeight / 2 + (h.h / 100) * el.scrollHeight / 2;
    el.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, [focusHighlightId, highlights]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="max-w-[420px] truncate font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <ToolButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </ToolButton>
          <span className="px-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            {page} / 1
          </span>
          <ToolButton onClick={() => setPage((p) => Math.min(1, p + 1))} disabled={page >= 1}>
            <ChevronRight className="h-3.5 w-3.5" />
          </ToolButton>
          <div className="mx-2 h-4 w-px bg-border" />
          <ToolButton onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
            <ZoomOut className="h-3.5 w-3.5" />
          </ToolButton>
          <span className="w-10 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <ToolButton onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <ZoomIn className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton onClick={() => setZoom(1)}>
            <Maximize2 className="h-3.5 w-3.5" />
          </ToolButton>
        </div>
      </div>

      {/* Document scroll area */}
      <div ref={docRef} className="scrollbar-thin relative flex-1 overflow-auto p-6">
        <div
          className="relative mx-auto bg-white shadow-elevate-lg"
          style={{
            width: "620px",
            maxWidth: "100%",
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {/* Mock land-record document */}
          <div className="relative" style={{ aspectRatio: "1 / 1.414" }}>
            <MockLandRecord />
            {/* Highlights overlay */}
            <AnimatePresence>
              {highlights.map((h) => (
                <HighlightOverlay
                  key={h.id}
                  h={h}
                  focused={h.id === focusHighlightId}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  children, onClick, disabled,
}: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function HighlightOverlay({ h, focused }: { h: RenderableHighlight; focused: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="absolute cursor-help"
      style={{
        left: `${h.x}%`,
        top: `${h.y}%`,
        width: `${h.w}%`,
        height: `${h.h}%`,
        background: `color-mix(in oklab, ${h.color} 18%, transparent)`,
        outline: `1.5px solid ${h.color}`,
        outlineOffset: 0,
        borderRadius: 3,
        boxShadow: focused
          ? `0 0 0 3px color-mix(in oklab, ${h.color} 28%, transparent)`
          : "none",
      }}
    >
      {focused && (
        <motion.div
          className="absolute inset-0 rounded-[3px]"
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ background: `color-mix(in oklab, ${h.color} 22%, transparent)` }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-0 top-full z-10 mt-1.5 w-64 rounded-lg border border-border bg-surface p-3 text-left shadow-elevate-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ background: h.color }} />
                <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: h.color }}>
                  {h.severity}
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-muted-foreground">
                {Math.round(h.confidence * 100)}% conf.
              </span>
            </div>
            <div className="mt-1.5 text-[12.5px] font-medium text-foreground">{h.label}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{h.agentName}</div>
            <div className="mt-2 text-[11.5px] leading-relaxed text-foreground/80">
              {h.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// A semi-realistic land-record mock document. Coordinates in mock-data.ts
// were authored against this layout (percent-based, so resilient to zoom).
function MockLandRecord() {
  return (
    <div className="absolute inset-0 px-[8%] py-[5%] text-[#1a1a2a]">
      <div className="text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Government of Karnataka
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Sub-Registrar Office · Bengaluru East
        </div>
        {/* Title — y≈14% */}
        <div className="mt-3 border-y border-neutral-300 py-2 text-[15px] font-serif font-semibold tracking-wide">
          DEED OF SALE
        </div>
        <div className="mt-1 text-[10px] text-neutral-500">
          Document No. LR-2026-0098217 · Stamp ₹ 84,500 · Reg. Fee ₹ 12,000
        </div>
      </div>

      <p className="mt-5 text-[11px] leading-[1.7] text-neutral-800">
        This DEED OF SALE is executed on this <b>12th day of March, 2026</b> at the office of the
        Sub-Registrar, Bengaluru East, between the parties hereinafter described, in respect of
        the immovable property described in the Schedule hereunder.
      </p>

      <div className="mt-4 space-y-2 text-[11px] leading-[1.7] text-neutral-800">
        <div>
          <span className="font-semibold">VENDOR: </span>
          Sri. Ramachandra Iyer S/o Late Krishnamurthy, aged 62 years, R/o No. 14, 4th Cross,
          Indiranagar, Bengaluru — 560038.
        </div>
        {/* Buyer line — y≈38% */}
        <div>
          <span className="font-semibold">PURCHASER: </span>
          <span style={{ fontFamily: "'Liberation Serif', serif", letterSpacing: "0.01em" }}>
            Smt. Anjali R. Pradhan
          </span>{" "}
          W/o Sri. Vikram Pradhan, aged 41 years, R/o Flat 7B, Prestige Greens, Whitefield,
          Bengaluru — 560066.
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-[1.7] text-neutral-800">
        WHEREAS the Vendor is the absolute owner of the property described in the Schedule herein,
        and has agreed to sell and the Purchaser has agreed to purchase the said property for a
        total consideration of:
      </p>

      {/* Consideration value — y≈47% */}
      <div className="mt-2 flex items-center justify-between rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-[12px]">
        <span className="font-semibold text-neutral-700">Total Consideration</span>
        <span className="font-mono font-semibold" style={{ letterSpacing: "0.02em" }}>
          ₹ 1,85,00,000 /- (One Crore Eighty Five Lakhs)
        </span>
      </div>

      <div className="mt-4 text-[11px] leading-[1.7] text-neutral-800">
        <div className="font-semibold">SCHEDULE OF PROPERTY</div>
        <div className="mt-1">
          All that piece and parcel of vacant residential land bearing Survey No. <b>142/3-B</b>,
          situated at Whitefield Village, Bidarahalli Hobli, Bengaluru East Taluk, measuring{" "}
          <b>2,400 sq.ft</b>, bounded by:
        </div>
        <ul className="mt-1 ml-4 list-disc text-[11px] text-neutral-700">
          <li>North: Property of Sri. Mahadev Naik</li>
          <li>South: 30 ft Road</li>
          <li>East: Site No. 142/3-A</li>
          <li>West: Storm-water drain</li>
        </ul>
      </div>

      {/* Signature block — y≈80% */}
      <div className="mt-6 grid grid-cols-2 gap-6 text-[11px]">
        <div>
          <div className="mb-6 text-neutral-600">Signature of Vendor</div>
          <div className="border-t border-neutral-400 pt-1 font-serif italic text-neutral-700">
            R. Iyer
          </div>
        </div>
        <div>
          <div className="mb-6 text-neutral-600">Signature of Purchaser</div>
          <div
            className="border-t border-neutral-400 pt-1 font-serif italic text-neutral-700"
            style={{ filter: "blur(0.3px)" }}
          >
            A. Pradhan
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-[9.5px] text-neutral-500">
        — Witnessed before the Sub-Registrar, Bengaluru East · Reg. No. 2456/2025-26 —
      </div>
    </div>
  );
}
