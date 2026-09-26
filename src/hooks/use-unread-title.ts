"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";

/**
 * Updates the document title to show the total unread count.
 * When there are unread messages, the title becomes "(N) MAX Chat — GREEN-API".
 * When there are none, it reverts to "MAX Chat — GREEN-API".
 */
export function useUnreadTitle() {
  const chats = useChatStore((s) => s.chats);

  useEffect(() => {
    const total = chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
    const base = "MAX Chat — GREEN-API";
    document.title = total > 0 ? `(${total > 99 ? "99+" : total}) ${base}` : base;
  }, [chats]);
}
