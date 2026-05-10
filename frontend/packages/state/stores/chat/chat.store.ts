"use client";

import { create } from "zustand";

/**
 * Chat Store — Zustand
 *
 * Session ID ve optimistic mesajları tutar.
 * Token veya auth verisi içermez.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isOptimistic?: boolean;
}

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  setSessionId: (sessionId: string) => void;
  addMessage: (message: ChatMessage) => void;
  removeOptimisticMessage: (id: string) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
  initSession: () => string;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  messages: [],
  isTyping: false,

  setSessionId: (sessionId) => set({ sessionId }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  removeOptimisticMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  setTyping: (isTyping) => set({ isTyping }),

  clearMessages: () => set({ messages: [], sessionId: null }),

  initSession: () => {
    const existing = get().sessionId;
    if (existing) return existing;
    const newId = crypto.randomUUID();
    set({ sessionId: newId });
    return newId;
  },
}));
