"use client";

import { useMessages, useDismissMessage } from "@repo/state";
import type { MessageContainerProps } from "@repo/ui-contracts/message";
import { MessageCard } from "./MessageCard";
import styles from "./css/Message.module.css";

const POSITION_CLASS: Record<NonNullable<MessageContainerProps["position"]>, string> = {
  "top-right": styles.posTopRight ?? "",
  "top-left": styles.posTopLeft ?? "",
  "top-center": styles.posTopCenter ?? "",
  "bottom-right": styles.posBottomRight ?? "",
  "bottom-left": styles.posBottomLeft ?? "",
  "bottom-center": styles.posBottomCenter ?? "",
};

export function MessageContainer({
  maxVisible = 5,
  position = "top-right",
  className = "",
  testID,
}: MessageContainerProps) {
  const messages = useMessages();
  const dismissMessage = useDismissMessage();

  const visibleMessages = messages.slice(-maxVisible);

  if (visibleMessages.length === 0) {
    return null;
  }

  const posClass = POSITION_CLASS[position];
  const containerClasses = [styles.container, posClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={containerClasses}
      data-testid={testID ?? "message-container"}
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {visibleMessages.map((msg) => (
        <MessageCard
          key={msg.id}
          message={msg}
          onDismiss={dismissMessage}
        />
      ))}
    </div>
  );
}
