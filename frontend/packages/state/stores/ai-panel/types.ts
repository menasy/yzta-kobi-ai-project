/**
 * AI Panel ChatStore — Type Re-exports
 *
 * Panel, tam sayfa chat ile aynı ChatStore tiplerini ve aynı store instance'ını
 * kullanır. Bu dosya yalnızca eski import path'leri için type re-export sağlar.
 */
export type {
  AssistantMessageInput,
  ChatActions,
  ChatMessageRole,
  ChatState,
  ChatStore,
  ChatStoreInitialState,
  OptimisticChatMessage,
} from "../chat/types";
