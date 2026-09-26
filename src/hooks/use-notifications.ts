// use-notifications: polls /api/notifications/poll on an interval.
// Pushes saved incoming messages into the store, updates statuses for outgoing ones,
// toggles typing indicators, and plays a sound on new incoming messages.

"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import type { MessageRow } from "@/lib/types";
import { toast } from "sonner";
import { useSoundSettings } from "@/hooks/use-sound";

const POLL_INTERVAL_MS = 3500;
const RECEIVE_TIMEOUT = 5; // seconds, matches green-api long-poll window

interface PollResponse {
  notification: unknown;
  savedMessage?: MessageRow | null;
  statusUpdate?: {
    chatId: string;
    messageId: string;
    status: MessageRow["status"];
  } | null;
  typingUpdate?: { chatId: string; isTyping: boolean } | null;
  chatId?: string | null;
  error?: string;
}

export function useNotifications(enabled: boolean) {
  const account = useChatStore((s) => s.account);
  const patchChat = useChatStore((s) => s.patchChat);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const setOnline = useChatStore((s) => s.setOnline);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const soundEnabled = useSoundSettings((s) => s.enabled);

  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || !account?.id) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled || inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch("/api/notifications/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: account.id,
            receiveTimeout: RECEIVE_TIMEOUT,
          }),
        });
        if (!res.ok) {
          setOnline(false);
          return;
        }
        setOnline(true);
        const data = (await res.json()) as PollResponse;
        if (data.error) return; // soft error; do not toast every 3.5s

        if (data.savedMessage) {
          const msg = data.savedMessage;
          appendMessage(msg.chatId, msg);
          const isActive = msg.chatId === activeChatId;
          const existingChat = useChatStore.getState().chats.find(
            (c) => c.id === msg.chatId,
          );
          const unreadInc = msg.direction === "incoming" && !isActive ? 1 : 0;
          patchChat(msg.chatId, {
            lastMessageText: msg.text,
            lastMessageAt: msg.timestamp,
            unreadCount: (existingChat?.unreadCount ?? 0) + unreadInc,
            updatedAt: new Date(msg.timestamp * 1000).toISOString(),
          });
          // Clear typing when an actual message arrives.
          setTyping(msg.chatId, false);
          if (msg.direction === "incoming") {
            // Suppress sound if the chat is muted.
            const isMuted = existingChat?.muted ?? false;
            if (!isActive && soundEnabled && !isMuted) playIncomingSound();
            if (!isActive) {
              toast.message("Новое сообщение", {
                description: msg.text.slice(0, 80),
              });
            }
          }
        }

        if (data.statusUpdate) {
          updateMessage(
            data.statusUpdate.chatId,
            data.statusUpdate.messageId,
            { status: data.statusUpdate.status },
          );
        }

        if (data.typingUpdate) {
          setTyping(data.typingUpdate.chatId, data.typingUpdate.isTyping);
        }
      } catch {
        setOnline(false);
      } finally {
        inFlight.current = false;
        if (!cancelled) {
          timer = setTimeout(tick, POLL_INTERVAL_MS);
        }
      }
    };

    timer = setTimeout(tick, 100);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    enabled,
    account?.id,
    activeChatId,
    appendMessage,
    updateMessage,
    patchChat,
    setTyping,
    setOnline,
    soundEnabled,
  ]);
}

// Web Audio API-based short "pop" — no asset file needed.
function playIncomingSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.26);
    // Close the context to free resources.
    osc.onended = () => ctx.close();
  } catch {
    // Audio API may be unavailable; ignore.
  }
}
