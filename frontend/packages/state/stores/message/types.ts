import type { MessageItem, ShowMessageInput } from "@repo/ui-contracts/message";

export interface MessageState {
  messages: MessageItem[];
}

export interface MessageActions {
  showMessage: (input: ShowMessageInput) => void;
  showSuccess: (title: string, description?: string, duration?: number) => void;
  showError: (title: string, description?: string, duration?: number) => void;
  showNotification: (title: string, description?: string, duration?: number) => void;
  dismissMessage: (id: string) => void;
  clearAllMessages: () => void;
}

export type MessageStore = MessageState & MessageActions;
