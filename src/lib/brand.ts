export const SCHOOL_NAME = "HKMA K S Lo College";
export const APP_NAME = "SolidMemory Leaderboards";
export const SMEM_LINK = "https://english.kslo.hk/smem";
export const SOLIDMEMORY_LINK = "https://www.solidmemory.com/";

export function formatHkt(ms: number | null | undefined): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

export function formatHktDate(ms: number | null | undefined): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

export type BoardTab = {
  key: string;
  short: string;
  label: string;
  group: "monthly" | "annual" | "wordsmith";
};

export const MONTHLY_TABS: BoardTab[] = [
  { key: "monthly-1", short: "S1", label: "Monthly S1", group: "monthly" },
  { key: "monthly-2", short: "S2", label: "Monthly S2", group: "monthly" },
  { key: "monthly-3", short: "S3", label: "Monthly S3", group: "monthly" },
  { key: "monthly-4", short: "S4", label: "Monthly S4", group: "monthly" },
  { key: "monthly-5", short: "S5", label: "Monthly S5", group: "monthly" },
  { key: "monthly-6", short: "S6", label: "Monthly S6", group: "monthly" },
];

export const SPECIAL_TABS: BoardTab[] = [
  { key: "annual", short: "Top 20", label: "K S Lo Top 20", group: "annual" },
  { key: "wordsmith", short: "Wordsmith", label: "Wordsmith", group: "wordsmith" },
];
