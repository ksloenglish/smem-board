/**
 * Monthly award pages have five form tables (or six when S6 is enabled), so
 * their print scale must be denser than the shorter Annual/Wordsmith output.
 */
export function printZoomForAwardPeriod(period: {
  type: "monthly" | "annual" | "s6final";
  showS6: boolean;
}): number {
  if (period.type !== "monthly") return 0.72;
  return period.showS6 ? 0.54 : 0.62;
}
