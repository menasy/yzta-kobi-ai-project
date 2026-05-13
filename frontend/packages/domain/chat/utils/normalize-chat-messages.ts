import type { ChatConversationMessage, ChatRenderableMessage } from "../types/chat.types";

import { extractStructuredChatMessageMetadata } from "./extract-structured-chat-metadata";

export function normalizeConversationMessages(
  messages: readonly ChatConversationMessage[],
): ChatRenderableMessage[] {
  return messages.map((message) => {
    const metadata = extractStructuredChatMessageMetadata(message);

    return {
      id: String(message.id),
      role: message.role,
      content: message.content,
      createdAt: message.created_at,
      pendingAction: metadata.pendingAction,
      pendingActionGroup: metadata.pendingActionGroup,
      actionExecution: metadata.actionExecution,
      insight: metadata.insight,
      error: metadata.error,
    };
  });
}
