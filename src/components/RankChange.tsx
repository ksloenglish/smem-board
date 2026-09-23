import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Renders a rank-change indicator.
 * positive = moved up (green), negative = moved down (red), 0 = unchanged, null = new.
 */
export function RankChange({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-strong"
        title="New on this leaderboard"
      >
        <Sparkles className="h-3 w-3" />
        New
      </span>
    );
  }
  if (change === 0) {
    return (
      <span className="inline-flex items-center text-muted-foreground" title="No change">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums",
        up ? "text-emerald-600" : "text-rose-600"
      )}
      title={up ? `Up ${change}` : `Down ${Math.abs(change)}`}
    >
      {up ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
      {Math.abs(change)}
    </span>
  );
}
