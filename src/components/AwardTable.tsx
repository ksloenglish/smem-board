import type { AwardListDTO } from "../types";
import { awardTableColumnWidths } from "../lib/awardTableLayout";
import { cn } from "../lib/utils";

function rankBadgeClasses(rank: number): string {
  if (rank === 1) return "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-amber-200";
  if (rank === 2) return "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 ring-slate-100";
  if (rank === 3) return "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950 ring-orange-200";
  return "bg-accent text-accent-foreground ring-transparent";
}

/**
 * Renders one award winner list as a responsive table, styled to match the
 * school's official award PDFs:
 *  - "Days With Exercise Done" highlighted (primary criterion for every award)
 *  - the secondary criterion highlighted in green (First for Vocab, All for Annual)
 *  - a Prize column for Annual / Wordsmith (and S6 lists), hidden for Vocab Challenge
 */
export function AwardTable({ list }: { list: AwardListDTO }) {
  // Annual + Wordsmith show prizes; the monthly Vocab Challenge does not.
  const showPrize = list.awardType === "annual" || list.awardType === "wordsmith";
  // Annual ranks by Days -> All -> First; Vocab/Wordsmith emphasise differently.
  const highlightAll = list.awardType === "annual" || list.awardType === "wordsmith";
  const highlightFirst = list.awardType === "vocab";
  const widths = awardTableColumnWidths(showPrize);

  if (!list.winners || list.winners.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        {list.message || "No eligible winners for this award."}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        {/* On screen: auto layout + min-width so it wraps/scrolls like the
            leaderboard. In print: the `.print-fixed-cols` rules switch to a
            fixed layout with the colgroup widths below so all five tables
            line up on a single A4 sheet. */}
        <table className="award-table w-full min-w-[560px] border-collapse text-sm">
          <colgroup className="print-only-colgroup">
            <col style={{ width: widths[0] }} />{/* Rank */}
            <col style={{ width: widths[1] }} />{/* Class */}
            <col style={{ width: widths[2] }} />{/* Group */}
            <col style={{ width: widths[3] }} />{/* English Name */}
            <col style={{ width: widths[4] }} />{/* Chinese Name */}
            <col style={{ width: widths[5] }} />{/* No. */}
            <col style={{ width: widths[6] }} />{/* Days With Exercise Done */}
            <col style={{ width: widths[7] }} />{/* First Attempted */}
            <col style={{ width: widths[8] }} />{/* All Attempted */}
            {showPrize && <col style={{ width: widths[9] }} />}{/* Prize */}
          </colgroup>
          <thead>
            <tr className="bg-gradient-to-r from-brand-strong to-brand text-white">
              <th className="px-2 py-3 text-center font-semibold">Rank</th>
              <th className="px-2 py-3 text-left font-semibold">Class</th>
              <th className="px-2 py-3 text-left font-semibold">Group</th>
              <th className="px-3 py-3 text-left font-semibold">English Name</th>
              <th className="px-3 py-3 text-left font-semibold">Chinese Name</th>
              <th className="px-2 py-3 text-center font-semibold">No.</th>
              <th className="px-2 py-3 text-center font-semibold bg-white/15">Days With Exercise Done</th>
              <th className={cn("px-2 py-3 text-center font-semibold", highlightFirst && "bg-white/15")}>
                First Attempted
              </th>
              <th className={cn("px-2 py-3 text-center font-semibold", highlightAll && "bg-white/15")}>
                All Attempted
              </th>
              {showPrize && <th className="px-3 py-3 text-left font-semibold">Prize</th>}
            </tr>
          </thead>
          <tbody>
            {list.winners.map((w, i) => (
              <tr
                key={`${list.awardType}-${list.formScope}-${w.rank}-${w.classNo}-${i}`}
                className={cn(
                  "border-t border-border/70 transition-colors hover:bg-accent/50",
                  w.rank <= 3 && "bg-accent/30"
                )}
              >
                <td className="px-2 py-2.5">
                  <div className="flex items-center justify-center">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-2",
                        rankBadgeClasses(w.rank)
                      )}
                    >
                      {w.rank}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2.5 font-semibold text-foreground">{w.class || "\u2014"}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{w.group || "\u2014"}</td>
                <td className="px-3 py-2.5 font-medium text-foreground print-truncate">{w.eName || "\u2014"}</td>
                <td className="px-3 py-2.5 text-foreground print-truncate">{w.cName || "\u2014"}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{w.classNo || "\u2014"}</td>
                <td className="px-2 py-2.5 text-center tabular-nums font-semibold bg-accent/60 text-brand-deep">
                  {w.daysWithExerciseDone}
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5 text-center tabular-nums",
                    highlightFirst && "bg-accent/60 font-semibold text-brand-deep"
                  )}
                >
                  {w.firstAttempted.toLocaleString()}
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5 text-center tabular-nums",
                    highlightAll && "bg-accent/60 font-semibold text-brand-deep"
                  )}
                >
                  {w.allAttempted.toLocaleString()}
                </td>
                {showPrize && (
                  <td className="px-3 py-2.5 text-sm leading-snug font-medium text-foreground/90 text-pretty">
                    {w.prize || "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
