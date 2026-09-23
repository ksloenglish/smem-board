import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CalendarRange,
  ChevronDown,
  Clock3,
  Crown,
  Gift,
  ListOrdered,
  Medal,
  Printer,
  RefreshCw,
  Trophy,
} from "lucide-react";
import snapshot from "./generated/public-data.json";
import "./styles.css";

type RankChange = number | null;
type Entry = {
  rank: number;
  class: string;
  group: string;
  eName: string;
  cName: string;
  classNo: string;
  exerciseDone: number;
  daysWithExerciseDone: number;
  firstAttempted: number;
  allAttempted: number;
  retentionRate: string;
  rankChange: RankChange;
};
type Board = {
  boardKey: string;
  kind: "monthly" | "annual" | "wordsmith";
  form: string | null;
  title: string;
  period: string | null;
  fetchedAt: number | null;
  entries: Entry[];
};
type AwardWinner = Omit<Entry, "retentionRate" | "rankChange"> & { form: string; prize: string };
type AwardList = {
  awardType: "vocab" | "annual" | "wordsmith";
  formScope: string;
  winners: AwardWinner[];
  status: "success" | "error";
  message: string | null;
  generatedAt: number | null;
};
type AwardPeriod = {
  periodKey: string;
  type: "monthly" | "annual" | "s6final";
  label: string;
  schoolYear: string;
  startMs: number;
  endMs: number;
  annualStartMs: number | null;
  minDays: number;
  minFirstAttempted: number;
  prizeText: string | null;
  published: boolean;
  showS6: boolean;
};
type Snapshot = {
  generatedAt: number;
  leaderboard: { meta: { availableBoards: string[]; lastUpdated: number | null }; boards: Board[] };
  awards: { periods: AwardPeriod[]; winnersByPeriod: Record<string, AwardList[]> };
};

const data = snapshot as Snapshot;

const tabLabel = (key: string) => {
  if (key === "annual") return "K S Lo Top 20";
  if (key === "wordsmith") return "Wordsmith";
  return `S${key.replace("monthly-", "")}`;
};

function formatHkt(value: number | null | undefined, time = true): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(new Date(value));
}

function titleForList(list: AwardList) {
  if (list.awardType === "annual") return list.formScope === "6" ? "S6 Leaderboard Awards" : "K S Lo Top 20 Leaderboard Awards";
  if (list.awardType === "wordsmith") return list.formScope === "6" ? "S6 Wordsmith Awards" : "Wordsmith Awards";
  return `Vocab Challenge Awards — S${list.formScope}`;
}

function RankChangeIndicator({ change }: { change: RankChange }) {
  if (change === null) return <span className="rank-new">New</span>;
  if (change === 0) return <span className="rank-steady">—</span>;
  return <span className={change > 0 ? "rank-up" : "rank-down"}>{change > 0 ? "↑" : "↓"} {Math.abs(change)}</span>;
}

function RankBadge({ rank }: { rank: number }) {
  return <span className={`rank-badge rank-${Math.min(rank, 4)}`}>{rank}</span>;
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <img src="/smem-board/logo.png" alt="K S Lo English" className="logo" />
        <div>
          <p className="school-name">HKMA K S LO COLLEGE</p>
          <h1>SolidMemory Leaderboards</h1>
          <p className="tagline">Celebrating consistency and word power in English vocabulary learning</p>
        </div>
      </div>
    </header>
  );
}

function LeaderboardTable({ board }: { board: Board }) {
  const isAnnual = board.kind === "annual";
  const highlightFirst = !isAnnual;
  const highlightAll = isAnnual;
  if (board.entries.length === 0) {
    return <div className="empty-state">No data is available yet for this leaderboard. Please check back after the next update.</div>;
  }
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="leaderboard-table">
          <colgroup>
            <col style={{ width: "6%" }} /><col style={{ width: "6%" }} /><col style={{ width: "8%" }} />
            <col style={{ width: "15%" }} /><col style={{ width: "10%" }} /><col style={{ width: "5%" }} />
            <col style={{ width: "11%" }} /><col style={{ width: "11%" }} /><col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} /><col style={{ width: "8%" }} />
          </colgroup>
          <thead><tr>
            <th>Rank</th><th>Class</th><th>Group</th><th>English Name</th><th>Chinese Name</th><th>No.</th>
            <th>Exercise Done</th><th className="emphasis">Days With Exercise Done</th>
            <th className={highlightFirst ? "emphasis" : ""}>First Attempted</th>
            <th className={highlightAll ? "emphasis" : ""}>All Attempted</th><th>Retention</th>
          </tr></thead>
          <tbody>{board.entries.map((entry, index) => <tr key={`${entry.rank}-${entry.classNo}-${index}`}>
            <td className="rank-cell"><RankBadge rank={entry.rank} /><RankChangeIndicator change={entry.rankChange} /></td>
            <td className="strong">{entry.class || "—"}</td><td className="muted">{entry.group || "—"}</td>
            <td className="strong name-cell">{entry.eName || "—"}</td><td className="name-cell">{entry.cName || "—"}</td><td className="muted centre">{entry.classNo || "—"}</td>
            <td className="centre">{entry.exerciseDone.toLocaleString()}</td><td className="centre score-primary">{entry.daysWithExerciseDone.toLocaleString()}</td>
            <td className={`centre ${highlightFirst ? "score-primary" : ""}`}>{entry.firstAttempted.toLocaleString()}</td>
            <td className={`centre ${highlightAll ? "score-primary" : ""}`}>{entry.allAttempted.toLocaleString()}</td><td className="centre muted">{entry.retentionRate || "—"}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Wordsmith({ board }: { board: Board }) {
  const winners = [1, 2, 3].map(rank => board.entries.find(entry => entry.rank === rank)).filter((entry): entry is Entry => Boolean(entry));
  const runnersUp = board.entries.filter(entry => entry.rank >= 4 && entry.rank <= 10);
  if (board.entries.length === 0) return <div className="empty-state">No data is available yet. Please check back after the next update.</div>;
  return <>
    <div className="podium">{winners.map(entry => <article key={entry.rank} className={`podium-card podium-${entry.rank}`}>
      {entry.rank === 1 && <Crown className="crown" fill="currentColor" />}
      <RankBadge rank={entry.rank} /><p className="medal"><Medal size={14} />{entry.rank === 1 ? "Gold" : entry.rank === 2 ? "Silver" : "Bronze"}</p>
      <h3>{entry.eName || "—"}</h3><p>{entry.cName || "—"}</p><p className="muted">{entry.class} · {entry.group}</p>
      <div className="word-count"><strong>{entry.allAttempted.toLocaleString()}</strong><span>All Attempted Words</span></div>
    </article>)}</div>
    {runnersUp.length > 0 && <section className="runners-up"><div className="section-rule"><span />Runners-up · 4th–10th place<span /></div>
      <div className="runner-card">{runnersUp.map(entry => <div className="runner" key={entry.rank}>
        <div className="runner-rank"><RankBadge rank={entry.rank} /><RankChangeIndicator change={entry.rankChange} /></div>
        <div className="runner-name"><strong>{entry.eName || "—"} <span>{entry.cName}</span></strong><small>{[entry.class, entry.group, entry.classNo && `No. ${entry.classNo}`].filter(Boolean).join(" · ")}</small></div>
        <div className="runner-score"><strong>{entry.allAttempted.toLocaleString()}</strong><small>Words</small></div>
      </div>)}</div>
    </section>}
  </>;
}

function Criteria({ type }: { type: "monthly" | "annual" | "wordsmith" }) {
  const [open, setOpen] = useState(false);
  const message = type === "annual"
    ? "Rankings are determined first by days with exercise done, then by all attempted words, and finally by first attempted words."
    : type === "wordsmith"
      ? "Rankings are determined by all attempted words on the K S Lo Top 20 Leaderboard. Only the top three students receive Wordsmith awards."
      : "Rankings are determined first by days with exercise done, then by words first attempted during the competition period, and finally by all attempted words.";
  return <div className="criteria"><button onClick={() => setOpen(value => !value)} aria-expanded={open}><span><ListOrdered size={17} /> How are rankings determined?</span><ChevronDown size={18} className={open ? "rotated" : ""} /></button>{open && <p>{message}</p>}</div>;
}

function Leaderboards() {
  const [activeKey, setActiveKey] = useState(data.leaderboard.meta.availableBoards[0] ?? "monthly-1");
  const board = data.leaderboard.boards.find(item => item.boardKey === activeKey);
  useEffect(() => { if (!data.leaderboard.meta.availableBoards.includes(activeKey)) setActiveKey(data.leaderboard.meta.availableBoards[0] ?? "monthly-1"); }, [activeKey]);
  const type = board?.kind ?? "monthly";
  return <>
    <nav className="board-nav"><div className="nav-inner"><span className="nav-label">Monthly</span>{data.leaderboard.meta.availableBoards.filter(key => key.startsWith("monthly-")).map(key => <button key={key} className={activeKey === key ? "active" : ""} onClick={() => setActiveKey(key)}>{tabLabel(key)}</button>)}<i />
      {data.leaderboard.meta.availableBoards.filter(key => !key.startsWith("monthly-")).map(key => <button key={key} className={activeKey === key ? "active" : ""} onClick={() => setActiveKey(key)}>{tabLabel(key)}</button>)}</div></nav>
    <main className="content">
      <div className="board-heading"><h2>{board?.title ?? "Monthly Leaderboard"}</h2><div className="metadata">{board?.period && <span className="period"><CalendarRange size={18} /> {board.period}</span>}<span><Clock3 size={17} /> Last updated: {formatHkt(data.leaderboard.meta.lastUpdated)} HKT</span></div></div>
      <Criteria type={type} />
      {board ? (board.kind === "wordsmith" ? <Wordsmith board={board} /> : <LeaderboardTable board={board} />) : <div className="empty-state">The latest board is being prepared. Please check back shortly.</div>}
      <p className="refresh-note"><RefreshCw size={14} /> Leaderboards refresh automatically twice daily, around 8am and 8pm HKT.</p>
    </main>
  </>;
}

function AwardTable({ list }: { list: AwardList }) {
  const showPrize = list.awardType !== "vocab";
  if (!list.winners.length) return <div className="empty-state compact">{list.message || "No eligible winners for this award."}</div>;
  return (
    <div className="table-card award-table-card"><div className="table-scroll"><table className="award-table">
      <thead><tr><th>Rank</th><th>Class</th><th>Group</th><th>English Name</th><th>Chinese Name</th><th>No.</th><th className="emphasis">Days With Exercise Done</th><th>First Attempted</th><th className={list.awardType !== "vocab" ? "emphasis" : ""}>All Attempted</th>{showPrize && <th>Prize</th>}</tr></thead>
      <tbody>{list.winners.map((winner, index) => <tr key={`${winner.rank}-${winner.classNo}-${index}`}>
        <td><RankBadge rank={winner.rank} /></td><td className="strong">{winner.class || "—"}</td><td className="muted">{winner.group || "—"}</td>
        <td className="strong name-cell">{winner.eName || "—"}</td><td className="name-cell">{winner.cName || "—"}</td><td className="centre muted">{winner.classNo || "—"}</td>
        <td className="centre score-primary">{winner.daysWithExerciseDone.toLocaleString()}</td><td className="centre">{winner.firstAttempted.toLocaleString()}</td>
        <td className={`centre ${list.awardType !== "vocab" ? "score-primary" : ""}`}>{winner.allAttempted.toLocaleString()}</td>
        {showPrize && <td className="prize">{winner.prize || "—"}</td>}
      </tr>)}</tbody>
    </table></div></div>
  );
}

function Awards() {
  const periods = useMemo(() => [...data.awards.periods].sort((a, b) => b.endMs - a.endMs), []);
  const [activeKey, setActiveKey] = useState(periods[0]?.periodKey ?? "");
  const period = periods.find(item => item.periodKey === activeKey);
  const lists = period ? data.awards.winnersByPeriod[period.periodKey] ?? [] : [];
  const ordered = [...lists].filter(list => !(list.awardType === "vocab" && list.formScope === "6" && !period?.showS6)).sort((a, b) => `${a.awardType}:${a.formScope}`.localeCompare(`${b.awardType}:${b.formScope}`, undefined, { numeric: true }));
  return <main className="content awards-content"><div className="page-title"><span><Trophy size={25} /></span><div><h2>SolidMemory Awards</h2><p>Published award results only</p></div><button className="print-button" onClick={() => window.print()}><Printer size={16} /> Print</button></div>
    {!periods.length ? <div className="empty-state">Published award results will appear here after review.</div> : <><div className="period-selector"><p><CalendarRange size={16} /> Select a competition period</p><div>{periods.map(item => <button className={item.periodKey === activeKey ? "active" : ""} onClick={() => setActiveKey(item.periodKey)} key={item.periodKey}>{item.label}</button>)}</div></div>
      {period && <><section className="award-criteria"><button className="criteria-toggle"><span><Gift size={18} /> Competition period</span><span>{formatHkt(period.startMs, false)} – {formatHkt(period.endMs, false)}</span></button>{period.type === "monthly" && <div className="award-copy"><p><Award size={17} /> The Vocab Challenge awards recognise students who meet the learning targets: <b>{period.minDays}</b> days with exercise done and <b>{period.minFirstAttempted}</b> first attempted words.</p>{period.prizeText && <p><Gift size={17} /> Prize: <b>{period.prizeText}</b></p>}</div>}</section>
      {!ordered.length ? <div className="empty-state">Winners for this period have not been published yet. Please check back soon.</div> : <div className="award-lists">{ordered.map(list => <section key={`${list.awardType}-${list.formScope}`}><h3>{titleForList(list)}</h3><AwardTable list={list} /></section>)}</div>}</>}</>}
  </main>;
}

function Footer() { return <footer><p>Keep building your streak on <a href="https://www.solidmemory.com/" target="_blank" rel="noreferrer">SolidMemory</a> and climb the rankings.</p><p>Visit <a href="https://english.kslo.hk/smem" target="_blank" rel="noreferrer">english.kslo.hk/smem</a> for details on the SolidMemory competitions and awards.</p><small>© 2026 HKMA K S Lo College · Static student site updated from the public leaderboard feed.</small></footer>; }

export default function App() {
  const [view, setView] = useState<"leaderboards" | "awards">("leaderboards");
  return <div className="app-shell"><SiteHeader /><div className="top-switch"><button onClick={() => setView("leaderboards")} className={view === "leaderboards" ? "active" : ""}>Leaderboards</button><button onClick={() => setView("awards")} className={view === "awards" ? "active" : ""}>Awards</button></div>{view === "leaderboards" ? <Leaderboards /> : <Awards />}<Footer /></div>;
}
