// use-reply: small Zustand store for the "message being replied to" context.
// When set, the message input shows a quote preview and the next sent message
// gets replyToId populated. Cleared on send or on user dismiss.

"use client";

import { create } from "zustand";
import type { MessageRow } from "@/lib/types";

interface ReplyState {
  /** The message the user is replying to, or null. */
  replyTo: MessageRow | null;
  /** Set the reply target (shows quote preview in input). */
  setReplyTo: (msg: MessageRow | null) => void;
  /** Clear the reply target. */
  clear: () => void;
}

export const useReply = create<ReplyState>((set) => ({
  replyTo: null,
  setReplyTo: (msg) => set({ replyTo: msg }),
  clear: () => set({ replyTo: null }),
}));
