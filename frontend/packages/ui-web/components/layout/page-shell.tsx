import React from "react";
import { cn } from "@repo/core";
import { ResponsiveContainer } from "./responsive-container";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  containerSize?: React.ComponentProps<typeof ResponsiveContainer>["size"];
}

/**
 * Sayfa genel yapısını (header, content, footer) yöneten shell.
 */
export function PageShell({
  children,
  className,
  header,
  footer,
  containerSize = "xl",
  ...props
}: PageShellProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)} {...props}>
      {header && <header className="flex-shrink-0">{header}</header>}
      
      <main className="flex-grow py-page-y">
        <ResponsiveContainer size={containerSize}>
          {children}
        </ResponsiveContainer>
      </main>

      {footer && <footer className="flex-shrink-0">{footer}</footer>}
    </div>
  );
}
