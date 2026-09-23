import type { LeaderboardDTO } from "../types";
import { cn } from "../lib/utils";
import { Crown, Medal } from "lucide-react";
import { RankChange } from "./RankChange";

const TIERS = [
  {
    rank: 1,
    label: "Gold",
    ring: "ring-amber-300",
    card: "bg-gradient-to-b from-amber-50 to-amber-100 border-amber-300",
    badge: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
    order: "order-1 sm:order-2",
    height: "sm:mt-0",
  },
  {
    rank: 2,
    label: "Silver",
    ring: "ring-slate-300",
    card: "bg-gradient-to-b from-slate-50 to-slate-150 border-slate-300",
    badge: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800",
    order: "order-2 sm:order-1",
    height: "sm:mt-10",
  },
  {
    rank: 3,
    label: "Bronze",
    ring: "ring-orange-300",
    card: "bg-gradient-to-b from-orange-50 to-orange-100 border-orange-300",
    badge: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
    order: "order-3 sm:order-3",
    height: "sm:mt-16",
  },
];

export function WordsmithPodium({ board }: { board: LeaderboardDTO }) {
  if (board.entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        No data available yet. Please check back after the next data refresh.
      </div>
    );
  }

  const byRank = new Map(board.entries.map(e => [e.rank, e]));
  // Places 4-10 are shown for recognition only; the top 3 win the awards.
  const runnersUp = board.entries
    .filter(e => e.rank >= 4 && e.rank <= 10)
    .sort((a, b) => a.rank - b.rank);

  return (
    <>
    <div className="grid grid-cols-1 gap-4 sm:-mt-6 sm:grid-cols-3 sm:items-end">
      {TIERS.map(tier => {
        const e = byRank.get(tier.rank);
        if (!e) return null;
        return (
          <div
            key={tier.rank}
            className={cn(
              "row-enter relative rounded-2xl border-2 p-5 text-center shadow-md ring-1",
              tier.card,
              tier.ring,
              tier.order,
              tier.height
            )}
          >
            {tier.rank === 1 && (
              <span className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-md ring-2 ring-white">
                <Crown className="h-5 w-5 text-white" fill="currentColor" strokeWidth={1.5} />
              </span>
            )}
            <div
              className={cn(
                "mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold shadow",
                tier.badge
              )}
            >
              {tier.rank}
            </div>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Medal className="h-3.5 w-3.5" /> {tier.label}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold text-foreground">{e.eName || "\u2014"}</h3>
            <p className="text-sm text-foreground">{e.cName}</p>
            <p className="text-xs text-muted-foreground">
              {e.class} {"\u00B7"} {e.group}
            </p>
            <div className="mt-4 rounded-xl bg-white/70 py-3">
              <p className="text-2xl font-extrabold tabular-nums text-brand-deep">
                {e.allAttempted.toLocaleString()}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">All Attempted Words</p>
            </div>
          </div>
        );
      })}
    </div>

      {runnersUp.length > 0 && (
        <div className="mt-10">
          {/* Divider clearly separating award winners from runners-up */}
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Runners-up {"\u00B7"} 4th {"\u2013"} 10th place
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {runnersUp.map((e, i) => (
              <div
                key={`${board.boardKey}-ru-${e.rank}-${e.classNo}-${i}`}
                className={cn(
                  "row-enter flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
                  i > 0 && "border-t border-border/70"
                )}
              >
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {e.rank}
                  </span>
                  <RankChange change={e.rankChange} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {e.eName || "\u2014"}
                    {e.cName && (
                      <span className="ml-2 text-sm font-medium text-muted-foreground">{e.cName}</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[e.class, e.group, e.classNo ? `No. ${e.classNo}` : ""]
                      .filter(Boolean)
                      .join(" \u00B7 ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-extrabold tabular-nums text-brand-deep">
                    {e.allAttempted.toLocaleString()}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Words</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
