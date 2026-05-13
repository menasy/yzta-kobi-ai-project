"use client";

import { cn } from "@repo/core";
import {
  getAiActionTypeLabel,
  useAiActionConfirmation,
  type AiPendingActionPreview,
} from "@repo/domain/ai-actions";
import { useUser } from "@repo/state/stores/auth";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card, CardContent, CardHeader, CardTitle } from "../shadcn/card";
import { Badge } from "../shadcn/badge";
import { PendingActionAffectedResources } from "./PendingActionAffectedResources";
import { PendingActionConfirmControls } from "./PendingActionConfirmControls";
import { PendingActionPreview } from "./PendingActionPreview";
import { PendingActionSafetyBadge } from "./PendingActionSafetyBadge";

interface PendingActionCardProps {
  pendingAction: AiPendingActionPreview;
  onActionMessage?: (content: string) => Promise<unknown>;
  className?: string;
}

function getExpiryLabel(expiresAt?: string | null): string {
  if (!expiresAt) {
    return "Sınırlı süre geçerli";
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now();

  if (Number.isNaN(remainingMs)) {
    return "Sınırlı süre geçerli";
  }

  if (remainingMs <= 0) {
    return "Süresi doldu";
  }

  const remainingMinutes = Math.ceil(remainingMs / 60_000);
  if (remainingMinutes < 60) {
    return `${remainingMinutes} dk kaldı`;
  }

  const remainingHours = Math.floor(remainingMinutes / 60);
  const tailMinutes = remainingMinutes % 60;

  if (tailMinutes === 0) {
    return `${remainingHours} sa kaldı`;
  }

  return `${remainingHours} sa ${tailMinutes} dk kaldı`;
}

export function PendingActionCard({
  pendingAction,
  onActionMessage,
  className,
}: PendingActionCardProps) {
  const user = useUser();
  const isAdmin = user?.role === "admin";
  const canSubmit =
    Boolean(onActionMessage) &&
    isAdmin &&
    pendingAction.requiresConfirmation &&
    pendingAction.status === "pending";

  const { confirmAction, cancelAction, isPending, pendingDecision } =
    useAiActionConfirmation({
      onSubmitMessage: async (content) => {
        if (!onActionMessage) {
          return;
        }

        await onActionMessage(content);
      },
    });

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/95 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <PendingActionSafetyBadge safetyLevel={pendingAction.safetyLevel} />
          <Badge variant="outline" className="px-2.5 py-1 text-[11px]">
            {getAiActionTypeLabel(pendingAction.actionType)}
          </Badge>
          <Badge variant="outline" className="px-2.5 py-1 text-[11px]">
            {getExpiryLabel(pendingAction.expiresAt)}
          </Badge>
        </div>

        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-foreground">
            {pendingAction.title}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {pendingAction.summary}
            </ReactMarkdown>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <PendingActionAffectedResources
          resources={pendingAction.affectedResources}
        />
        <PendingActionPreview preview={pendingAction.preview} />

        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Gerekçe
          </span>
          <div className="text-sm text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {pendingAction.reason}
            </ReactMarkdown>
          </div>
        </div>

        {!isAdmin ? (
          <p className="text-xs text-muted-foreground">
            Bu aksiyon yalnızca admin kullanıcı tarafından onaylanabilir.
          </p>
        ) : null}

        <PendingActionConfirmControls
          onConfirm={() => confirmAction(pendingAction.actionId)}
          onCancel={() => cancelAction(pendingAction.actionId)}
          isPending={isPending}
          pendingDecision={pendingDecision}
          disabled={!canSubmit}
        />
      </CardContent>
    </Card>
  );
}
