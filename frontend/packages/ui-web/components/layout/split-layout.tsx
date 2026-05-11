import React from "react";
import { cn } from "@repo/core";

export interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  asidePosition?: "left" | "right";
  asideSize?: "sm" | "md" | "lg";
  stickyAside?: boolean;
  aside: React.ReactNode;
}

const asideSizeMap = {
  sm: "md:w-64",
  md: "md:w-80",
  lg: "md:w-96",
};

/**
 * Detail/Sidebar, Dashboard vb. yerlerde kullanılan layout.
 * Mobile'da stacked (alt alta), Desktop'ta iki kolon.
 */
export function SplitLayout({
  children,
  className,
  asidePosition = "right",
  asideSize = "md",
  stickyAside = false,
  aside,
  ...props
}: SplitLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-page-y",
        asidePosition === "left" ? "md:flex-row-reverse" : "md:flex-row",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {children}
      </div>
      
      <aside
        className={cn(
          "w-full flex-shrink-0",
          asideSizeMap[asideSize],
          stickyAside && "md:sticky md:top-page-y md:self-start"
        )}
      >
        {aside}
      </aside>
    </div>
  );
}
