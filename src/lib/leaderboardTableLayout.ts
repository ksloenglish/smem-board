/**
 * Phone-specific leaderboard table layout. The desktop and print layouts keep
 * their natural sizing; on a phone, a compact fixed grid lets the first six
 * identity columns fit before horizontal scrolling is needed.
 */
export const LEADERBOARD_TABLE_CLASS_NAME =
  "leaderboard-table w-full min-w-[680px] sm:min-w-[820px] border-collapse text-sm";

/** Keeps horizontal scrolling local to the table without changing desktop or print sizing. */
export const LEADERBOARD_TABLE_SCROLL_CLASS_NAME =
  "leaderboard-table-scroll overflow-x-auto";

export const MOBILE_LEADERBOARD_COLUMN_WIDTHS = [
  "6%",  // Rank
  "6%",  // Class
  "8%",  // Group
  "14%", // English name
  "9%",  // Chinese name
  "5%",  // Number
  "10%", // Exercise done
  "11%", // Days with exercise done
  "10%", // First attempted
  "10%", // All attempted
  "11%", // Retention — room for the full header on phone screens
] as const;
