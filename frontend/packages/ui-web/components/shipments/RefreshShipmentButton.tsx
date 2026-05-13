"use client";

import { Button } from "../shadcn/button";
import { RefreshCw } from "lucide-react";
import { useRefreshShipment } from "@repo/domain/shipments";
import type { TrackingNumber } from "@repo/domain/shipments";
import { cn } from "@repo/core";

interface RefreshShipmentButtonProps {
  trackingNumber: TrackingNumber;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function RefreshShipmentButton({
  trackingNumber,
  className,
  variant = "outline",
  size = "icon",
  showText = false,
}: RefreshShipmentButtonProps) {
  const { refreshShipment, isPending } = useRefreshShipment();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("transition-all duration-300", className)}
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        refreshShipment(trackingNumber);
      }}
      title="Durumu Güncelle"
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
      {showText && <span className="ml-2">Güncelle</span>}
    </Button>
  );
}
