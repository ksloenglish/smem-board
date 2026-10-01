import { describe, expect, it } from "vitest";
import { currentRefreshWindowStartMs, snapshotIsCurrent } from "./public-freshness.mjs";

const ts=value=>Date.parse(value);
const data=at=>({ leaderboard: { meta:{s6Visible:false}, boards:[
  ...[1,2,3,4,5].map(form=>({boardKey:`monthly-${form}`,fetchedAt:at})),
  {boardKey:"annual",fetchedAt:at},{boardKey:"wordsmith",fetchedAt:at}
] }});

describe("GitHub Pages source freshness",()=>{
  it("uses the latest 08:00/20:00 HKT boundary, including midnight rollover",()=>{
    expect(currentRefreshWindowStartMs(ts("2026-10-01T00:08:00Z"))).toBe(ts("2026-10-01T00:00:00Z"));
    expect(currentRefreshWindowStartMs(ts("2026-10-01T12:08:00Z"))).toBe(ts("2026-10-01T12:00:00Z"));
    expect(currentRefreshWindowStartMs(ts("2026-10-01T23:00:00Z"))).toBe(ts("2026-10-01T12:00:00Z"));
  });
  it("rejects a new export made from old or partially updated boards",()=>{
    const now=ts("2026-10-01T00:10:00Z");
    const old=data(ts("2026-09-30T12:30:00Z"));
    expect(snapshotIsCurrent(old,now)).toBe(false);
    const current=data(ts("2026-10-01T00:03:00Z"));
    expect(snapshotIsCurrent(current,now)).toBe(true);
    current.leaderboard.boards[3].fetchedAt=ts("2026-09-30T12:30:00Z");
    expect(snapshotIsCurrent(current,now)).toBe(false);
    current.leaderboard.boards.pop();
    expect(snapshotIsCurrent(current,now)).toBe(false);
  });
  it("requires visible S6 too, without leaking a hidden Form 6 board",()=>{
    const now=ts("2026-10-01T00:10:00Z");
    const current=data(now);
    current.leaderboard.meta.s6Visible=true;
    expect(snapshotIsCurrent(current,now)).toBe(false);
    current.leaderboard.boards.push({boardKey:"monthly-6",fetchedAt:now});
    expect(snapshotIsCurrent(current,now)).toBe(true);
  });
});
