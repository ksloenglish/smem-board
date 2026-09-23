import { type CSSProperties, useEffect, useMemo, useState, type ReactNode } from "react";
import { Award, CalendarRange, ChevronDown, Gift, ListOrdered, Printer, Trophy } from "lucide-react";
import type { AwardListDTO, AwardPeriodDTO, PublicSiteSnapshot } from "./types";
import { cn } from "./lib/utils";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { AwardTable } from "./components/AwardTable";
import { printZoomForAwardPeriod } from "./lib/awardPrintLayout";
import { formatHkt, formatHktDate } from "./lib/brand";

const FORM_LABEL: Record<string, string> = { "1": "S1", "2": "S2", "3": "S3", "4": "S4", "5": "S5", "6": "S6" };

function listTitle(list: AwardListDTO): string {
  if (list.awardType === "annual") return list.formScope === "6" ? "S6 Leaderboard Awards" : "K S Lo Top 20 Leaderboard Awards";
  if (list.awardType === "wordsmith") return list.formScope === "6" ? "S6 Wordsmith Awards" : "Wordsmith Awards";
  const form = FORM_LABEL[list.formScope] ?? `S${list.formScope}`;
  return `Vocab Challenge Awards — ${form}`;
}

export function AwardsPage({ snapshot, onHome }: { snapshot: PublicSiteSnapshot; onHome: () => void }) {
  const periods = useMemo(() => snapshot.awards.periods, [snapshot]);
  const [activeKey, setActiveKey] = useState<string>("");

  useEffect(() => {
    if (periods.length === 0) return;
    if (!periods.some(period => period.periodKey === activeKey)) {
      setActiveKey([...periods].sort((a, b) => b.endMs - a.endMs)[0].periodKey);
    }
  }, [periods, activeKey]);

  const activePeriod = periods.find(period => period.periodKey === activeKey) ?? null;
  const lists = activePeriod ? snapshot.awards.winnersByPeriod[activePeriod.periodKey] ?? [] : [];

  return (
    <div className="brand-backdrop flex min-h-screen flex-col">
      <SiteHeader onHome={onHome} />
      <nav className="no-print sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <button type="button" onClick={onHome} className="shrink-0 rounded-full bg-card px-3.5 py-1.5 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-[0.97]">Leaderboards</button>
            <span className="shrink-0 rounded-full bg-brand-strong px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm">Awards</span>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto flex-1 px-4 py-6 sm:py-8 print-full-width print-scale" style={{ "--print-zoom": String(activePeriod ? printZoomForAwardPeriod(activePeriod) : 0.72) } as CSSProperties}>
        <div className="mb-5 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow"><Trophy className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1"><h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">SolidMemory Awards</h2></div>
          <button type="button" onClick={() => window.print()} className="no-print inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-strong px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-deep active:scale-[0.97]">
            <Printer className="h-4 w-4" /><span className="hidden sm:inline">Print</span>
          </button>
        </div>

        {periods.length === 0 ? <EmptyAwards /> : <>
          <div className="no-print"><PeriodSelector periods={periods} activeKey={activeKey} onSelect={setActiveKey} /></div>
          {activePeriod && <AwardPeriodView period={activePeriod} lists={lists} />}
        </>}
      </main>
      <SiteFooter />
    </div>
  );
}

function PeriodSelector({ periods, activeKey, onSelect }: { periods: AwardPeriodDTO[]; activeKey: string; onSelect: (key: string) => void }) {
  const sorted = useMemo(() => [...periods].sort((a, b) => b.endMs - a.endMs), [periods]);
  return (
    <div className="mb-6">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><CalendarRange className="h-4 w-4 text-brand-strong" />Select a competition period</p>
      <div className="flex flex-wrap gap-2">
        {sorted.map(period => <button type="button" key={period.periodKey} onClick={() => onSelect(period.periodKey)} className={cn(
          "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
          activeKey === period.periodKey ? "bg-brand-strong text-white shadow-sm" : "bg-card text-muted-foreground ring-1 ring-border hover:bg-accent hover:text-foreground"
        )}>{period.label}</button>)}
      </div>
    </div>
  );
}

function AwardPeriodView({ period, lists }: { period: AwardPeriodDTO; lists: AwardListDTO[] }) {
  const ordered = useMemo(() => {
    const typeOrder: Record<string, number> = { vocab: 0, annual: 1, wordsmith: 2 };
    return [...lists]
      .filter(list => !(list.awardType === "vocab" && list.formScope === "6" && !period.showS6))
      .sort((a, b) => {
        const type = (typeOrder[a.awardType] ?? 9) - (typeOrder[b.awardType] ?? 9);
        return type !== 0 ? type : a.formScope.localeCompare(b.formScope, undefined, { numeric: true });
      });
  }, [lists, period.showS6]);

  if (ordered.length === 0) return <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">Winners for this period have not been published yet. Please check back soon.</div>;

  const vocabLists = ordered.filter(list => list.awardType === "vocab");
  const annualLists = ordered.filter(list => list.awardType === "annual");
  const wordsmithLists = ordered.filter(list => list.awardType === "wordsmith");
  const lastGenerated = ordered.map(list => list.generatedAt).filter((time): time is number => typeof time === "number").sort((a, b) => b - a)[0];

  return (
    <div className="space-y-8">
      <CriteriaCard period={period}>
        {vocabLists.length > 0 && <div className="mt-3 space-y-2 text-sm leading-relaxed text-amber-950/90">
          <p className="flex gap-2"><Award className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" /><span>The Vocab Challenge awards are presented to the top five students in each form who have met the learning targets{period.minDays > 0 || period.minFirstAttempted > 0 ? <> (at least <span className="inline-block rounded-md bg-brand-strong/15 px-1.5 py-0.5 font-bold text-brand-deep">{period.minDays}</span> days with exercise done and <span className="inline-block rounded-md bg-brand-strong/15 px-1.5 py-0.5 font-bold text-brand-deep">{period.minFirstAttempted}</span> first attempted words)</> : null}.</span></p>
          <p className="flex gap-2"><ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" /><span>Rankings are determined first by the number of days with exercise done, then by the number of words first attempted during the competition period, and finally by the number of all attempted words.</span></p>
          {period.prizeText && <p className="flex items-center gap-2"><Gift className="h-4 w-4 shrink-0 text-brand-strong" /><span className="flex flex-wrap items-center gap-x-2 gap-y-1">Prize:<span className="inline-block rounded-md bg-brand-strong/15 px-2 py-0.5 text-sm font-extrabold text-brand-deep">{period.prizeText}</span></span></p>}
        </div>}
        {(annualLists.length > 0 || wordsmithLists.length > 0) && <div className="mt-3 space-y-2 text-sm leading-relaxed text-amber-950/90">
          {annualLists.length > 0 && <p className="flex gap-2"><Award className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" /><span>The Leaderboard Awards are presented to students who remain on the SolidMemory K S Lo Top 20 Leaderboard by the end of the competition period, ranked first by days with exercise done, then by all attempted words, and finally by first attempted words.</span></p>}
          {wordsmithLists.length > 0 && <p className="flex gap-2"><ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" /><span>The Wordsmith Awards are presented to the top three students with the highest number of attempted words on the SolidMemory K S Lo Top 20 Leaderboard by the end of the competition period.</span></p>}
        </div>}
      </CriteriaCard>

      {vocabLists.length > 0 && <section className="print-keep-together space-y-6"><SectionHeading icon={<Award className="h-5 w-5" />} title="Vocab Challenge Awards" />{vocabLists.map(list => <AwardListBlock key={`${list.awardType}-${list.formScope}`} list={list} />)}</section>}
      {annualLists.length > 0 && <section className="print-keep-together space-y-6"><SectionHeading icon={<Trophy className="h-5 w-5" />} title="K S Lo Top 20 Leaderboard Awards" />{annualLists.map(list => <AwardListBlock key={`${list.awardType}-${list.formScope}`} list={list} hideHeading />)}</section>}
      {wordsmithLists.length > 0 && <section className="print-keep-together space-y-6"><SectionHeading icon={<Gift className="h-5 w-5" />} title="Wordsmith Awards" />{wordsmithLists.map(list => <AwardListBlock key={`${list.awardType}-${list.formScope}`} list={list} hideHeading />)}</section>}
      {lastGenerated && <p className="print-lastupdated text-right text-xs text-muted-foreground">Last updated: {formatHkt(lastGenerated)} HKT</p>}
    </div>
  );
}

function CriteriaCard({ period, children }: { period: AwardPeriodDTO; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="print-keep-together rounded-2xl border border-amber-300/70 bg-amber-50/80">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left sm:px-5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-amber-900"><CalendarRange className="h-4 w-4 shrink-0 text-brand-strong" />Competition Period:<span className="text-base font-extrabold tracking-tight text-brand-deep sm:text-lg">{formatHktDate(period.startMs)} – {formatHktDate(period.endMs)}</span></span>
      <ChevronDown className={cn("no-print h-4 w-4 shrink-0 text-brand-strong transition-transform duration-200", open && "rotate-180")} />
    </button>
    <div className={cn("px-4 pb-4 sm:px-5 sm:pb-5", open ? "block" : "hidden print-show")}>{children}</div>
  </div>;
}

function SectionHeading({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="flex items-center gap-2.5"><span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-strong/10 text-brand-strong">{icon}</span><h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">{title}</h3></div>;
}

function AwardListBlock({ list, hideHeading }: { list: AwardListDTO; hideHeading?: boolean }) {
  return <div className="space-y-2.5">{!hideHeading && <h4 className="font-display text-lg font-bold text-brand-deep">{listTitle(list)}</h4>}<AwardTable list={list} /></div>;
}

function EmptyAwards() {
  return <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center"><span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-brand-strong"><Trophy className="h-7 w-7" /></span><h3 className="font-display text-lg font-bold text-foreground">Awards are on their way</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Winner lists will appear here once the first competition period concludes. The first awards will be the Vocab Challenge results for June 2026.</p></div>;
}
