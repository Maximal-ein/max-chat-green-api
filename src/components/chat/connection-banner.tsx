"use client";

import { useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

/**
 * Thin banner shown at the top of the chat area when the connection to
 * GREEN-API is lost. Provides a manual retry button.
 */
export function ConnectionBanner() {
  const online = useChatStore((s) => s.online);
  const [retrying, setRetrying] = useState(false);
  // Banner is only shown when offline — no hidden state needed.
  if (online) return null;

  const onRetry = () => {
    setRetrying(true);
    // The polling hook will reset `online` to true if the next poll succeeds.
    setTimeout(() => setRetrying(false), 1500);
  };

  return (
    <div
      className={cn(
        "shrink-0 px-4 py-1.5 flex items-center justify-center gap-2",
        "bg-amber-500/10 border-b border-amber-500/30 text-amber-700 dark:text-amber-300",
        "text-xs font-medium",
      )}
      role="status"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>Соединение с GREEN-API потеряно. Автоповтор…</span>
      <button
        type="button"
        onClick={onRetry}
        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-amber-500/20"
      >
        <RefreshCw className={cn("h-3 w-3", retrying && "animate-spin")} />
        Повторить
      </button>
    </div>
  );
}
