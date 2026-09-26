"use client";

import { X, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReply } from "@/hooks/use-reply";
import { formatPhone } from "./chat-list-item";

/**
 * Quote preview shown above the message input when the user is composing a
 * reply. Has a close button to cancel the reply.
 */
export function ReplyPreview() {
  const replyTo = useReply((s) => s.replyTo);
  const clear = useReply((s) => s.clear);

  if (!replyTo) return null;

  const author =
    replyTo.direction === "outgoing"
      ? "Вы"
      : formatPhone(/* phoneNumber unknown here */ "") || "Собеседник";

  return (
    <div className="flex items-start gap-2 px-3 sm:px-6 pt-2 pb-1 bg-card/60 border-t">
      <div className="flex-1 flex items-start gap-2 min-w-0">
        <Reply className="h-4 w-4 mt-0.5 shrink-0 text-primary rotate-180" />
        <div className="min-w-0 flex-1 border-l-2 border-primary pl-2">
          <div className="text-[11px] font-medium text-primary truncate">
            {author}
          </div>
          <div
            className={cn(
              "text-xs text-muted-foreground truncate",
              "max-w-full",
            )}
          >
            {replyTo.text}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={clear}
        className="shrink-0 h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
        aria-label="Отменить ответ"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
