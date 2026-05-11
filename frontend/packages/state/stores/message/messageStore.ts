import { createStore } from "zustand/vanilla";
import { MESSAGE_DURATIONS } from "@repo/ui-contracts/message";
import type { MessageStore } from "./types";

export const createMessageStore = () => {
  const timers = new Map<string, NodeJS.Timeout>();

  return createStore<MessageStore>()((set, get) => ({
    messages: [],

    showMessage: (input) => {
      const id = crypto.randomUUID();
      const message = {
        ...input,
        id,
        duration: input.duration ?? MESSAGE_DURATIONS.DEFAULT,
      };

      set((state) => {
        // Prevent duplicate if same type, title, and description exists
        const isDuplicate = state.messages.some(
          (m) =>
            m.type === message.type &&
            m.title === message.title &&
            m.description === message.description
        );

        if (isDuplicate) {
          // If duplicate, we might just want to refresh the timer
          const existingMsg = state.messages.find(
            (m) =>
              m.type === message.type &&
              m.title === message.title &&
              m.description === message.description
          )!;
          
          if (existingMsg.duration && existingMsg.duration > 0) {
            const existingTimer = timers.get(existingMsg.id);
            if (existingTimer) {
              clearTimeout(existingTimer);
            }
            timers.set(
              existingMsg.id,
              setTimeout(() => {
                get().dismissMessage(existingMsg.id);
              }, existingMsg.duration)
            );
          }
          return state;
        }

        return {
          messages: [...state.messages, message],
        };
      });

      if (message.duration && message.duration > 0) {
        timers.set(
          id,
          setTimeout(() => {
            get().dismissMessage(id);
          }, message.duration)
        );
      }
    },

    showSuccess: (title, description, duration) =>
      get().showMessage({ type: "success", title, description, duration }),

    showError: (title, description, duration) =>
      get().showMessage({ type: "error", title, description, duration }),

    showNotification: (title, description, duration) =>
      get().showMessage({ type: "notification", title, description, duration }),

    dismissMessage: (id) => {
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
      }));
    },

    clearAllMessages: () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      set({ messages: [] });
    },
  }));
};
