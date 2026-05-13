import React from "react";
import { cn } from "@repo/core";
import { ResponsiveSize } from "@repo/ui-contracts";

export interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ResponsiveSize;
}

const sizeClasses: Record<ResponsiveSize, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

/**
 * Sayfa içeriğinin genişliğini sınırlayan ana container.
 * Mobile'da px-page-x (fluid) padding kullanır.
 */
export function ResponsiveContainer({
  children,
  className,
  size = "xl",
  ...props
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-page-x",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
