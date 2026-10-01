const HOUR_MS=3_600_000;
const DAY_MS=24*HOUR_MS;
const HKT_OFFSET_MS=8*HOUR_MS;

export function currentRefreshWindowStartMs(nowMs) {
  const shifted=nowMs+HKT_OFFSET_MS;
  const dayStart=Math.floor(shifted/DAY_MS)*DAY_MS-HKT_OFFSET_MS;
  const hour=new Date(shifted).getUTCHours();
  return hour>=20 ? dayStart+20*HOUR_MS : hour>=8 ? dayStart+8*HOUR_MS : dayStart-4*HOUR_MS;
}

/** Assert that every public board, not only the export time, belongs to the latest slot. */
export function snapshotIsCurrent(data,nowMs) {
  const start=currentRefreshWindowStartMs(nowMs);
  const boards=new Map((data?.leaderboard?.boards ?? []).map(board=>[board.boardKey,board]));
  const required=["monthly-1","monthly-2","monthly-3","monthly-4","monthly-5","annual","wordsmith"];
  if (data?.leaderboard?.meta?.s6Visible) required.push("monthly-6");
  return required.every(key=>{
    const fetchedAt=boards.get(key)?.fetchedAt;
    return typeof fetchedAt==="number" && Number.isFinite(fetchedAt) && fetchedAt>=start;
  });
}
