import React from "react";
import { cn } from "@repo/core";
import { ResponsiveDensity } from "@repo/ui-contracts";

export interface ResponsiveSectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "compact";
  density?: ResponsiveDensity;
}

/**
 * Sayfa içindeki ana bölümleri ayırmak için kullanılır.
 * Fluid py-section-y veya py-page-y margin/padding sağlar.
 */
export function ResponsiveSection({
  children,
  className,
  variant = "default",
  density = "comfortable",
  ...props
}: ResponsiveSectionProps) {
  return (
    <section
      className={cn(
        // Variant
        variant === "muted" && "bg-muted",
        
        // Density based padding/margin
        density === "compact" && "py-page-y",
        density === "comfortable" && "py-section-y",
        density === "spacious" && "py-section-y md:py-24", // Daha geniş
        
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
