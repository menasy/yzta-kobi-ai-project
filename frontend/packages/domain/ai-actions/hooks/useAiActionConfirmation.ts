"use client";

import { useCallback, useState } from "react";

type PendingDecision = "confirm" | "cancel" | null;

interface UseAiActionConfirmationOptions {
  onSubmitMessage: (content: string) => Promise<unknown>;
}

function buildConfirmationMessage(_actionId: string): string {
  return `Onaylıyorum.`;
}

function buildCancellationMessage(_actionId: string): string {
  return `Bu işlemi iptal et.`;
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
