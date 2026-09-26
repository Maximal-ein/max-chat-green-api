// use-chats: load chats for the active account, create new chat, delete chat.

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import type { ChatRow } from "@/lib/types";

export function useChats() {
  const account = useChatStore((s) => s.account);
  const chats = useChatStore((s) => s.chats);
  const setChats = useChatStore((s) => s.setChats);
  const upsertChat = useChatStore((s) => s.upsertChat);
  const patchChat = useChatStore((s) => s.patchChat);
  const removeChat = useChatStore((s) => s.removeChat);

  const accountId = account?.id ?? null;

  // Keep a ref to loadChats so createChat can refresh the list without
  // creating a stale closure.
  const loadChatsRef = useRef<() => Promise<void>>(async () => {});

  const loadChats = useCallback(async () => {
    if (!accountId) return;
    // Load all chats including archived so the sidebar can toggle visibility.
    const res = await fetch(`/api/chats?accountId=${accountId}&includeArchived=true`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.chats)) {
      setChats(data.chats as ChatRow[]);
    }
  }, [accountId, setChats]);

  // Sync the ref in an effect so we never mutate it during render.
  useEffect(() => {
    loadChatsRef.current = loadChats;
  }, [loadChats]);

  const createChat = useCallback(
    async (phoneNumber: string, name?: string): Promise<ChatRow> => {
      if (!accountId) throw new Error("Not logged in");
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, phoneNumber, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.chat) {
        throw new Error(data?.error || "Failed to create chat");
      }
      const chat = data.chat as ChatRow;
      upsertChat(chat);
      // Refresh the entire chat list so previews stay in sync.
      void loadChatsRef.current?.();
      return chat;
    },
    [accountId, upsertChat],
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!accountId) return;
      try {
        await fetch(`/api/chats/${chatId}?accountId=${accountId}`, {
          method: "DELETE",
        });
      } catch {
        // ignore
      }
      removeChat(chatId);
    },
    [accountId, removeChat],
  );

  // Mark all messages in a chat as read by updating the server-side
  // lastOpenedAt timestamp. Also locally clears the unread badge.
  const markAsRead = useCallback(
    async (chatId: string) => {
      if (!accountId) return;
      // Optimistically clear the unread badge WITHOUT overwriting other fields.
      patchChat(chatId, { unreadCount: 0 });
      try {
        await fetch(`/api/chats/${chatId}/read?accountId=${accountId}`, {
          method: "PATCH",
        });
      } catch {
        // ignore network errors; badge will resync on next loadChats
      }
    },
    [accountId, patchChat],
  );

  // Toggle the pinned flag on a chat (pinned chats appear at top of sidebar).
  const togglePin = useCallback(
    async (chatId: string, pinned: boolean) => {
      if (!accountId) return;
      patchChat(chatId, { pinned });
      try {
        await fetch(`/api/chats/${chatId}/pin?accountId=${accountId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned }),
        });
      } catch {
        // ignore network errors
      }
    },
    [accountId, patchChat],
  );

  // Rename a chat (set custom display name). Pass null/empty to clear.
  const renameChat = useCallback(
    async (chatId: string, name: string | null) => {
      if (!accountId) return;
      patchChat(chatId, { name });
      try {
        await fetch(`/api/chats/${chatId}/rename?accountId=${accountId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      } catch {
        // ignore network errors
      }
    },
    [accountId, patchChat],
  );

  // Toggle mute on a chat (muted chats don't play sound on new messages).
  const toggleMute = useCallback(
    async (chatId: string, muted: boolean) => {
      if (!accountId) return;
      patchChat(chatId, { muted });
      try {
        await fetch(`/api/chats/${chatId}/mute?accountId=${accountId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ muted }),
        });
      } catch {
        // ignore network errors
      }
    },
    [accountId, patchChat],
  );

  // Toggle archive on a chat (archived chats are hidden from sidebar).
  const toggleArchive = useCallback(
    async (chatId: string, archived: boolean) => {
      if (!accountId) return;
      patchChat(chatId, { archived });
      try {
        await fetch(`/api/chats/${chatId}/archive?accountId=${accountId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived }),
        });
      } catch {
        // ignore network errors
      }
    },
    [accountId, patchChat],
  );

  return {
    chats,
    loadChats,
    createChat,
    deleteChat,
    markAsRead,
    togglePin,
    renameChat,
    toggleMute,
    toggleArchive,
    hasAccount: Boolean(accountId),
  };
}
