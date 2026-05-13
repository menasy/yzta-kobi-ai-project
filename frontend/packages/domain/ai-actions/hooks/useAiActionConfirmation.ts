"use client";

import { useCallback, useState } from "react";

type PendingDecision = "confirm" | "cancel" | null;

interface UseAiActionConfirmationOptions {
  onSubmitMessage: (content: string) => Promise<unknown>;
}

function buildConfirmationMessage(actionId: string): string {
  return `Onaylıyorum. Action ID: ${actionId}`;
}

function buildCancellationMessage(actionId: string): string {
  return `Bu aksiyonu iptal et. Action ID: ${actionId}`;
}

export function useAiActionConfirmation({
  onSubmitMessage,
}: UseAiActionConfirmationOptions) {
  const [pendingDecision, setPendingDecision] = useState<PendingDecision>(null);

  const confirmAction = useCallback(
    async (actionId: string) => {
      if (pendingDecision) {
        return;
      }

      setPendingDecision("confirm");
      try {
        await onSubmitMessage(buildConfirmationMessage(actionId));
      } finally {
        setPendingDecision(null);
      }
    },
    [onSubmitMessage, pendingDecision],
  );

  const cancelAction = useCallback(
    async (actionId: string) => {
      if (pendingDecision) {
        return;
      }

      setPendingDecision("cancel");
      try {
        await onSubmitMessage(buildCancellationMessage(actionId));
      } finally {
        setPendingDecision(null);
      }
    },
    [onSubmitMessage, pendingDecision],
  );

  return {
    confirmAction,
    cancelAction,
    pendingDecision,
    isPending: pendingDecision !== null,
  } as const;
}
