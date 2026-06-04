"use client";

import { useAiPanelOpen } from "@repo/state/stores/ui";
import { cn } from "@repo/core";
import type { ReactNode } from "react";

interface ResponsiveLayoutContainerProps {
  children: ReactNode;
}

export function ResponsiveLayoutContainer({
  children,
}: ResponsiveLayoutContainerProps) {
  const isOpen = useAiPanelOpen();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-background transition-all duration-300 ease-in-out",
        isOpen ? "md:pr-[440px]" : "md:pr-0"
      )}
    >
      {children}
    </div>
  );
}
