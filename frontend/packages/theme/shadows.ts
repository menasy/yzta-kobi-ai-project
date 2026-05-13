/**
 * Shadow token sistemi
 * Semantic isimlerle — component'lerde doğrudan kullanılır
 */
export const shadows = {
  // Temel gölgeler
  none: "none",
  sm:   "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md:   "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg:   "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl:   "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl":"0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner:"inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",

  // Semantic özel gölgeler
  card:    "0 2px 8px 0 rgb(0 0 0 / 0.08)",
  dropdown:"0 4px 16px 0 rgb(0 0 0 / 0.12)",
  modal:   "0 20px 60px -10px rgb(0 0 0 / 0.3)",
  sidebar: "2px 0 8px 0 rgb(0 0 0 / 0.06)",

  // Brand glow (primary renk odaklı)
  primaryGlow: "0 0 0 3px hsl(var(--primary) / 0.2)",
  focusRing:   "0 0 0 2px hsl(var(--ring))",
} as const;

export type ShadowKey = keyof typeof shadows;
