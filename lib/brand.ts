/** One stable color per brand, so a competitor looks the same in the chart, the table and the legend. */
export const YOU_COLOR = "#2563eb";
const RIVAL_COLORS = ["#e5484d", "#38bdf8", "#eab308", "#15803d", "#64748b", "#f97316"];

export function brandColor(name: string, isYou: boolean, rivals: string[]): string {
  if (isYou) return YOU_COLOR;
  // Sorted, so the color does not change when a competitor moves up or down the ranking.
  const index = [...rivals].sort().indexOf(name);
  return RIVAL_COLORS[Math.max(0, index) % RIVAL_COLORS.length];
}
