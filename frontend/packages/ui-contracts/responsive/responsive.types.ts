/**
 * Responsive tipler
 */
export type ResponsiveDensity = "compact" | "comfortable" | "spacious";
export type ResponsiveSize = "sm" | "md" | "lg" | "xl" | "full";
export type ResponsiveLayout = "stacked" | "split" | "grid";

export type ResponsiveAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type ResponsiveJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

export interface ResponsiveComponentProps {
  /**
   * Componentin yoğunluğu
   */
  density?: ResponsiveDensity;
  
  /**
   * Componentin boyutu
   */
  size?: ResponsiveSize;
  
  /**
   * Tailwind classları
   */
  className?: string;
}
