import type { LeaderboardDTO } from "../types";
import { cn } from "../lib/utils";
import {
  LEADERBOARD_TABLE_CLASS_NAME,
  LEADERBOARD_TABLE_SCROLL_CLASS_NAME,
  MOBILE_LEADERBOARD_COLUMN_WIDTHS,
} from "../lib/leaderboardTableLayout";
import { RankChange } from "./RankChange";

function rankBadgeClasses(rank: number): string {
  if (rank === 1) return "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-amber-200";
  if (rank === 2) return "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 ring-slate-100";
  if (rank === 3) return "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950 ring-orange-200";
  return "bg-accent text-accent-foreground ring-transparent";
}

/**
 * Renders a monthly or annual leaderboard as a responsive table.
 * The numeric ranking columns are highlighted depending on board kind.
 */
export function LeaderboardTable({ board }: { board: LeaderboardDTO }) {
  const isAnnual = board.kind === "annual";
  // Highlight the primary criterion columns.
  // Monthly: Days, First, All (in that priority). Annual: Days, All, First.
  const highlightDays = true;
  const highlightFirst = !isAnnual;
  const highlightAll = isAnnual;

  if (board.entries.length === 0) {
    const message =
      board.kind === "monthly"
        ? "No students have achieved the learning targets so far. Check back as the competition period progresses."
        : "No data available yet for this leaderboard. Please check back after the next data refresh.";
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        {message}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className={LEADERBOARD_TABLE_SCROLL_CLASS_NAME}>
        <table className={LEADERBOARD_TABLE_CLASS_NAME}>
          <colgroup className="leaderboard-mobile-cols">
            {MOBILE_LEADERBOARD_COLUMN_WIDTHS.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-gradient-to-r from-brand-strong to-brand text-white">
              <th className="px-2 py-3 text-center font-semibold w-16">Rank</th>
              <th className="px-2 py-3 text-left font-semibold w-16">Class</th>
              <th className="px-2 py-3 text-left font-semibold">Group</th>
              <th className="px-3 py-3 text-left font-semibold">English Name</th>
              <th className="px-3 py-3 text-left font-semibold">Chinese Name</th>
              <th className="px-2 py-3 text-center font-semibold w-14">No.</th>
              <th className="px-2 py-3 text-center font-semibold">Exercise Done</th>
              <th className={cn("px-2 py-3 text-center font-semibold", highlightDays && "bg-white/15")}>
                Days With Exercise Done
              </th>
              <th className={cn("px-2 py-3 text-center font-semibold", highlightFirst && "bg-white/15")}>
                First Attempted
              </th>
              <th className={cn("px-2 py-3 text-center font-semibold", highlightAll && "bg-white/15")}>
                All Attempted
              </th>
              <th className="px-2 py-3 text-center font-semibold">Retention</th>
            </tr>
          </thead>
          <tbody>
            {board.entries.map((e, i) => (
              <tr
                key={`${board.boardKey}-${e.rank}-${e.classNo}-${i}`}
                className={cn(
                  "border-t border-border/70 transition-colors hover:bg-accent/50",
                  e.rank <= 3 && "bg-accent/30"
                )}
              >
                <td className="px-2 py-2.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ring-2 sm:h-7 sm:w-7 sm:text-xs",
                        rankBadgeClasses(e.rank)
                      )}
                    >
                      {e.rank}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-center">
                    <RankChange change={e.rankChange} />
                  </div>
                </td>
                <td className="px-2 py-2.5 font-semibold text-foreground">{e.class || "\u2014"}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{e.group || "\u2014"}</td>
                <td className="leaderboard-name px-3 py-2.5 font-medium text-foreground">{e.eName || "\u2014"}</td>
                <td className="leaderboard-name px-3 py-2.5 text-foreground">{e.cName || "\u2014"}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{e.classNo || "\u2014"}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">{e.exerciseDone}</td>
                <td
                  className={cn(
                    "px-2 py-2.5 text-center tabular-nums font-semibold",
                    highlightDays && "bg-accent/60 text-brand-deep"
                  )}
                >
                  {e.daysWithExerciseDone}
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5 text-center tabular-nums",
                    highlightFirst ? "bg-accent/60 font-semibold text-brand-deep" : ""
                  )}
                >
                  {e.firstAttempted.toLocaleString()}
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5 text-center tabular-nums",
                    highlightAll ? "bg-accent/60 font-semibold text-brand-deep" : ""
                  )}
                >
                  {e.allAttempted.toLocaleString()}
                </td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{e.retentionRate || "\u2014"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
