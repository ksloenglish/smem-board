import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BadgeCheck, CalendarRange, ChevronDown, Clock, ListOrdered, RefreshCw, Trophy } from "lucide-react";
import type { PublicSiteSnapshot } from "./types";
import { cn } from "./lib/utils";
import { MONTHLY_TABS, SPECIAL_TABS, formatHkt } from "./lib/brand";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { LeaderboardTable } from "./components/LeaderboardTable";
import { WordsmithPodium } from "./components/WordsmithPodium";

const CRITERIA: Record<string, string> = {
  monthly:
    "Rankings are determined first by the number of days with exercise done, then by the number of words first attempted during the competition period, and finally by the number of all attempted words.",
  wordsmith:
    "Rankings are determined by the total number of all attempted words on the SolidMemory K S Lo Top 20 Leaderboard by 31 August each school year.",
};

export function LeaderboardPage({ snapshot, onAwards }: { snapshot: PublicSiteSnapshot; onAwards: () => void }) {
  const [activeKey, setActiveKey] = useState<string>("monthly-1");
  const availableMonthly = useMemo(() => {
    const available = new Set(snapshot.leaderboard.meta.availableBoards);
    return MONTHLY_TABS.filter(tab => available.has(tab.key));
  }, [snapshot]);

  useEffect(() => {
    const available = new Set(snapshot.leaderboard.meta.availableBoards);
    if (!available.has(activeKey)) setActiveKey(snapshot.leaderboard.meta.availableBoards[0] ?? "monthly-1");
  }, [snapshot, activeKey]);

  const board = snapshot.leaderboard.boards.find(item => item.boardKey === activeKey);
  const group = activeKey.startsWith("monthly") ? "monthly" : activeKey === "annual" ? "annual" : "wordsmith";

  return (
    <div className="brand-backdrop flex min-h-screen flex-col">
      <SiteHeader onHome={() => setActiveKey("monthly-1")} />
      <nav className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <span className="mr-1 hidden shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">Monthly</span>
            {availableMonthly.map(tab => (
              <TabButton key={tab.key} active={activeKey === tab.key} onClick={() => setActiveKey(tab.key)}>{tab.short}</TabButton>
            ))}
            <span className="mx-2 h-5 w-px shrink-0 bg-border" />
            {SPECIAL_TABS.map(tab => (
              <TabButton key={tab.key} active={activeKey === tab.key} onClick={() => setActiveKey(tab.key)}>{tab.label}</TabButton>
            ))}
            <span className="mx-2 h-5 w-px shrink-0 bg-border" />
            <button
              type="button"
              onClick={onAwards}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-3.5 py-1.5 text-sm font-semibold text-amber-950 shadow-sm transition-all duration-200 hover:from-amber-300 hover:to-amber-400 active:scale-[0.97]"
            >
              <Trophy className="h-3.5 w-3.5" /> Awards
            </button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto flex-1 px-4 py-6 sm:py-8">
        <div className="mb-5">
          <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{board?.title ?? "Monthly Leaderboard"}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {board?.period && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
                <CalendarRange className="h-4 w-4" /> {board.period}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
              <Clock className="h-4 w-4" /> Last updated: {formatHkt(snapshot.leaderboard.meta.lastUpdated ?? board?.fetchedAt)} HKT
            </span>
          </div>
        </div>

        <CriteriaNote>
          {group === "annual" ? (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-brand/30 bg-accent/40 p-3 text-sm text-foreground/90">
                <ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
                <p>Rankings are determined first by the number of days with exercise done during the competition period, then by the number of all attempted words since the first day of using SolidMemory, and finally by the number of first attempted words during the competition period.</p>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-brand/30 bg-accent/40 p-3 text-sm text-foreground/90">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
                <p>To be eligible for the annual awards, students must average at least 5 words per day over the competition period with reference to their days with exercise done, unless they have attempted 10,000 words or more.</p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-brand/30 bg-accent/40 p-3 text-sm text-foreground/90">
              <ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
              <p>{CRITERIA[group]}</p>
            </div>
          )}
        </CriteriaNote>

        {board ? (
          group === "wordsmith" ? <WordsmithPodium board={board} /> : <LeaderboardTable board={board} />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">This leaderboard is not currently available.</div>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" /> Leaderboards refresh automatically twice daily (around 8am and 8pm HKT).
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
      active ? "bg-brand-strong text-white shadow-sm" : "bg-card text-muted-foreground ring-1 ring-border hover:bg-accent hover:text-foreground"
    )}>{children}</button>
  );
}

function CriteriaNote({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <button type="button" onClick={() => setOpen(current => !current)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 rounded-lg border border-brand/25 bg-accent/30 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
        <span className="flex items-center gap-2"><ListOrdered className="h-4 w-4 text-brand-strong" />How are rankings determined?</span>
        <ChevronDown className={cn("h-4 w-4 text-brand-strong transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="mt-2 space-y-3">{children}</div>}
    </div>
  );
}
