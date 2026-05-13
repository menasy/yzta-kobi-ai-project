import React from "react";
import { cn } from "@repo/core";
import { ResponsiveAlign, ResponsiveJustify } from "@repo/ui-contracts";

export interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "column" | "row";
  align?: ResponsiveAlign;
  justify?: ResponsiveJustify;
}

const alignMap: Record<ResponsiveAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyMap: Record<ResponsiveJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * Esnek Flex container'ı. 
 */
export function ResponsiveStack({
  children,
  className,
  direction = "column",
  align = "stretch",
  justify = "start",
  ...props
}: ResponsiveStackProps) {
  return (
    <div
      className={cn(
        "flex gap-4",
        direction === "column" ? "flex-col" : "flex-row",
        alignMap[align],
        justifyMap[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
