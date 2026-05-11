/**
 * Layout sistemi yapıları
 */
export const layout = {
  split: "split",
  stacked: "stacked",
  grid: "grid",
} as const;

export type LayoutKey = keyof typeof layout;
