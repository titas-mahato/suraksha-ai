import { useState } from "react";
import { VerdictPanel } from "./VerdictPanel";
import { DynamicAgentCard } from "./DynamicAgentCard";
import type { AnalysisResponse } from "@/lib/suraksha/mock-data";

interface Props {
  data: AnalysisResponse;
  onActiveHighlightsChange: (active: "all" | string[] | null, focus: string | null) => void;
}

export function AnalysisPanel({ data, onActiveHighlightsChange }: Props) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  function selectAgent(agentId: string) {
    const agent = data.agents.find((a) => a.agent_id === agentId);
    if (!agent) return;
    setShowAll(false);
    setSelectedAgentId(agentId);
    const ids = agent.highlights.map((h) => h.id);
    onActiveHighlightsChange(
      ids.length ? ids : null,
      ids[0] ?? null,
    );
  }

  function toggleAll() {
    if (showAll) {
      setShowAll(false);
      setSelectedAgentId(null);
      onActiveHighlightsChange(null, null);
    } else {
      setShowAll(true);
      setSelectedAgentId(null);
      onActiveHighlightsChange("all", null);
    }
  }

  return (
    <aside className="flex h-full flex-col border-l border-border bg-background">
      <div className="flex h-[49px] items-center justify-between border-b border-border bg-surface px-5">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Analysis report
          </div>
          <div className="text-[13px] font-medium text-foreground">
            {data.document_type} · <span className="font-mono text-muted-foreground">{data.document_id}</span>
          </div>
        </div>
        <div className="text-right text-[10.5px] text-muted-foreground">
          <div>{data.agents.length} agents</div>
          <div className="font-mono">{new Date(data.analyzed_at).toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-4">
        <VerdictPanel data={data} active={showAll} onToggleAll={toggleAll} />

        <div className="px-1 pt-2 text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Agent ensemble · {data.agents.length}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {data.agents.map((agent) => (
            <DynamicAgentCard
              key={agent.agent_id}
              agent={agent}
              active={selectedAgentId === agent.agent_id}
              onSelect={() => selectAgent(agent.agent_id)}
            />
          ))}
        </div>

        <div className="px-1 pb-4 pt-2 text-center text-[10.5px] text-muted-foreground">
          End of report · {data.jurisdiction}
        </div>
      </div>
    </aside>
  );
}
