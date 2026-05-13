import type { OptimisticChatMessage } from "@repo/state/stores/chat/types";

import type { ChatRenderableMessage } from "../types/chat.types";

function isSameMessage(
  serverMessage: ChatRenderableMessage,
  clientMessage: OptimisticChatMessage,
): boolean {
  return (
    serverMessage.role === clientMessage.role &&
    serverMessage.content === clientMessage.content
  );
}

export function mergeChatMessages(
  serverMessages: readonly ChatRenderableMessage[],
  optimisticMessages: readonly OptimisticChatMessage[],
): ChatRenderableMessage[] | OptimisticChatMessage[] {
  if (serverMessages.length === 0) {
    return [...optimisticMessages];
  }

  const pendingClientMessages = optimisticMessages.filter((message) => {
    if (message.id === "welcome-message") {
      return false;
    }

    if (message.isOptimistic) {
      return true;
    }

    return !serverMessages.some((serverMessage) =>
      isSameMessage(serverMessage, message),
    );
  });

  return [...serverMessages, ...pendingClientMessages];
}
