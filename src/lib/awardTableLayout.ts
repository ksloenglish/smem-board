/**
 * Screen and print column widths for AwardTable. Special awards need a wider
 * prize column so certificate-and-coupon text reads as a compact phrase,
 * rather than one word per line.
 */
export function awardTableColumnWidths(showPrize: boolean): readonly string[] {
  if (showPrize) {
    return ["5%", "6%", "8%", "16%", "11%", "4%", "11%", "9%", "10%", "20%"] as const;
  }
  return ["6%", "7%", "9%", "23%", "12%", "6%", "13%", "12%", "12%"] as const;
}
