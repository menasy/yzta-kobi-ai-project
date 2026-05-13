/**
 * Border radius scale
 * var(--radius) CSS değişkenine dayalı — globals.css'te tanımlanır
 */
export const radius = {
  none: "0px",
  sm:   "calc(var(--radius) - 4px)",  // ~2px default
  DEFAULT: "calc(var(--radius) - 2px)", // ~4px default
  md:   "var(--radius)",              // ~6px default
  lg:   "calc(var(--radius) + 2px)",  // ~8px default
  xl:   "calc(var(--radius) + 4px)",  // ~10px default
  "2xl":"calc(var(--radius) + 8px)",  // ~14px default
  "3xl":"calc(var(--radius) + 16px)", // ~22px default
  full: "9999px",
} as const;

export type RadiusKey = keyof typeof radius;
