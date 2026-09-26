// use-messages: load & send messages for the active chat.

"use client";

import { useCallback } from "react";
import { useChatStore } from "@/store/chat-store";
import type { MessageRow } from "@/lib/types";

// Stable empty array so useSyncExternalStore doesn't loop.
const EMPTY: MessageRow[] = [];

export function useMessages(chatId: string | null) {
  const account = useChatStore((s) => s.account);
  // Always return the same array reference when there are no messages for the chat.
  const messages = useChatStore((s) =>
    chatId ? (s.messages[chatId] ?? EMPTY) : EMPTY,
  );
  const setMessages = useChatStore((s) => s.setMessages);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);

  const accountId = account?.id ?? null;

  const loadMessages = useCallback(async () => {
    if (!accountId || !chatId) return;
    const res = await fetch(
      `/api/messages?accountId=${accountId}&chatId=${chatId}`,
    );
    const data = await res.json();
    if (res.ok && Array.isArray(data.messages)) {
      setMessages(chatId, data.messages as MessageRow[]);
    }
  }, [accountId, chatId, setMessages]);

  const sendMessage = useCallback(
    async (text: string, replyToId?: string | null): Promise<MessageRow> => {
      if (!accountId || !chatId) throw new Error("Not ready");
      const trimmed = text.trim();
      if (!trimmed) throw new Error("Empty message");

      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          chatId,
          text: trimmed,
          replyToId: replyToId ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.message) {
        throw new Error(data?.error || "Failed to send message");
      }
      const msg = data.message as MessageRow;
      appendMessage(chatId, msg);
      if (data.error) {
        // We still returned the failed message; surface the error via throw
        // so the UI can show a toast, but keep the bubble.
        throw new Error(data.error);
      }
      return msg;
    },
    [accountId, chatId, appendMessage],
  );

  const applyIncoming = useCallback(
    (msg: MessageRow) => appendMessage(chatId ?? "", msg),
    [chatId, appendMessage],
  );

  const applyStatus = useCallback(
    (messageId: string, status: MessageRow["status"]) => {
      if (!chatId) return;
      updateMessage(chatId, messageId, { status });
    },
    [chatId, updateMessage],
  );

  const removeMessage = useCallback(
    async (messageId: string) => {
      if (!accountId) return;
      // Optimistically remove from local store.
      useChatStore.setState((state) => {
        const list = state.messages[chatId ?? ""] ?? [];
        return {
          messages: {
            ...state.messages,
            [chatId ?? ""]: list.filter((m) => m.id !== messageId),
          },
        };
      });
      try {
        await fetch(`/api/messages/${messageId}?accountId=${accountId}`, {
          method: "DELETE",
        });
      } catch {
        // ignore network errors
      }
    },
    [accountId, chatId],
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      if (!accountId || !chatId) return;
      // Optimistically update local store.
      updateMessage(chatId, messageId, { text });
      try {
        const res = await fetch(`/api/messages/${messageId}/edit?accountId=${accountId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to edit message");
        }
      } catch (err) {
        // Revert on failure by reloading messages.
        void loadMessages();
        throw err;
      }
    },
    [accountId, chatId, updateMessage, loadMessages],
  );

  return {
    messages,
    loadMessages,
    sendMessage,
    applyIncoming,
    applyStatus,
    removeMessage,
    editMessage,
  };
}
