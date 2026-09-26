// Global Zustand store for the chat application.
// Holds the active session, list of chats, messages per chat, and active chat id.
// Backend persistence is handled separately by hooks that call our API routes.

import { create } from "zustand";
import type {
  AccountRow,
  ChatRow,
  MessageRow,
} from "@/lib/types";

/** Sort: pinned chats first, then by lastMessageAt descending. */
function chatSorter(a: ChatRow, b: ChatRow): number {
  const ap = a.pinned ? 1 : 0;
  const bp = b.pinned ? 1 : 0;
  if (ap !== bp) return bp - ap;
  return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
}

export interface ChatState {
  // --- session ---
  account: AccountRow | null;
  setAccount: (account: AccountRow | null) => void;

  // --- connection status ---
  online: boolean;
  setOnline: (online: boolean) => void;

  // --- chats ---
  chats: ChatRow[];
  setChats: (chats: ChatRow[]) => void;
  upsertChat: (chat: ChatRow) => void;
  /** Partial update of a single chat by id. Preserves unspecified fields. */
  patchChat: (chatId: string, patch: Partial<ChatRow>) => void;
  removeChat: (chatId: string) => void;

  // --- messages keyed by chatId ---
  messages: Record<string, MessageRow[]>;
  setMessages: (chatId: string, messages: MessageRow[]) => void;
  appendMessage: (chatId: string, message: MessageRow) => void;
  updateMessage: (
    chatId: string,
    id: string,
    patch: Partial<MessageRow>,
  ) => void;

  // --- active chat ---
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;

  // --- typing indicators keyed by chatId (set true when peer is typing) ---
  typing: Record<string, boolean>;
  setTyping: (chatId: string, isTyping: boolean) => void;

  // --- ui ---
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  /** Reset everything (logout). */
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),

  online: true,
  setOnline: (online) => set({ online }),

  chats: [],
  setChats: (chats) =>
    set({
      chats: [...chats].sort(chatSorter),
    }),
  upsertChat: (chat) =>
    set((state) => {
      const existing = state.chats.findIndex((c) => c.id === chat.id);
      const next = [...state.chats];
      if (existing >= 0) {
        next[existing] = { ...next[existing], ...chat };
      } else {
        next.unshift(chat);
      }
      next.sort(chatSorter);
      return { chats: next };
    }),
  patchChat: (chatId, patch) =>
    set((state) => {
      const idx = state.chats.findIndex((c) => c.id === chatId);
      if (idx < 0) return state;
      const next = [...state.chats];
      next[idx] = { ...next[idx], ...patch };
      // Re-sort if lastMessageAt or pinned changed.
      if (patch.lastMessageAt !== undefined || patch.pinned !== undefined) {
        next.sort(chatSorter);
      }
      return { chats: next };
    }),
  removeChat: (chatId) =>
    set((state) => {
      const messages = { ...state.messages };
      delete messages[chatId];
      return {
        chats: state.chats.filter((c) => c.id !== chatId),
        messages,
        activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
      };
    }),

  messages: {},
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: [...messages] },
    })),
  appendMessage: (chatId, message) =>
    set((state) => {
      const list = state.messages[chatId] ?? [];
      const exists = list.some(
        (m) =>
          (m.externalId && message.externalId && m.externalId === message.externalId) ||
          m.id === message.id,
      );
      if (exists) return state;
      return {
        messages: { ...state.messages, [chatId]: [...list, message] },
      };
    }),
  updateMessage: (chatId, id, patch) =>
    set((state) => {
      const list = state.messages[chatId] ?? [];
      return {
        messages: {
          ...state.messages,
          [chatId]: list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        },
      };
    }),

  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),

  typing: {},
  setTyping: (chatId, isTyping) =>
    set((state) => {
      // Skip if no change to avoid extra re-renders.
      if ((state.typing[chatId] ?? false) === isTyping) return state;
      return { typing: { ...state.typing, [chatId]: isTyping } };
    }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  reset: () =>
    set({
      account: null,
      chats: [],
      messages: {},
      activeChatId: null,
      typing: {},
      online: true,
      sidebarOpen: true,
    }),
}));
