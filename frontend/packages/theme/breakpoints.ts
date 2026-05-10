/**
 * Responsive breakpoint sistemi
 * Tailwind'in varsayılan breakpoint'leriyle birebir uyumlu
 */
export const breakpoints = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl": "1536px",
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * Container max-width'leri — sayfa içerik alanı için
 */
export const containerMaxWidth = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl": "1400px",
} as const;
