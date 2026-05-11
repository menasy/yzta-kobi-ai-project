/**
 * Density sistemi
 * Componentlerin iç içe geçerken kullanacağı boşluk yoğunlukları
 */
export const density = {
  compact: "compact",
  comfortable: "comfortable",
  spacious: "spacious",
} as const;

export type DensityKey = keyof typeof density;
