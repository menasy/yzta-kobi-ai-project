export type MessageType = "success" | "error" | "notification";

export interface MessageItem {
  id: string;
  type: MessageType;
  title: string;
  description?: string;
  duration?: number;
}

export type ShowMessageInput = Omit<MessageItem, "id">;

export interface MessageCardProps {
  message: MessageItem;
  onDismiss: (id: string) => void;
  className?: string;
  testID?: string;
}

export interface MessageContainerProps {
  maxVisible?: number;
  position?:
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center";
  className?: string;
  testID?: string;
}

export const MESSAGE_DURATIONS = {
  SHORT: 3000,
  DEFAULT: 5000,
  LONG: 8000,
  STICKY: 0, // 0 means auto-dismiss is disabled
} as const;
