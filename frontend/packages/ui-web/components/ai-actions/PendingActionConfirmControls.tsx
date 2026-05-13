"use client";

import { Button } from "../shadcn/button";

interface PendingActionConfirmControlsProps {
  onConfirm: () => Promise<unknown>;
  onCancel: () => Promise<unknown>;
  isPending: boolean;
  pendingDecision: "confirm" | "cancel" | null;
  disabled?: boolean;
}

export function PendingActionConfirmControls({
  onConfirm,
  onCancel,
  isPending,
  pendingDecision,
  disabled = false,
}: PendingActionConfirmControlsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        type="button"
        onClick={() => {
          void onConfirm();
        }}
        disabled={disabled || isPending}
        className="flex-1"
        aria-label="Aksiyonu onayla"
      >
        {pendingDecision === "confirm" ? "Onaylanıyor..." : "Onayla"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void onCancel();
        }}
        disabled={disabled || isPending}
        className="flex-1"
        aria-label="Aksiyonu iptal et"
      >
        {pendingDecision === "cancel" ? "İptal ediliyor..." : "Vazgeç"}
      </Button>
    </div>
  );
}
