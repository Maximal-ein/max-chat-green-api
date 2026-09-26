"use client";

import { cn } from "@/lib/utils";

/**
 * Three-dot typing animation shown in the chat header / message list footer
 * when the remote peer is typing.
 */
export function TypingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label="печатает"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Inline bubble shown at the bottom of the message list when peer is typing. */
export function TypingBubble({ name }: { name?: string }) {
  return (
    <div className="flex justify-start px-3 sm:px-6 py-1">
      <div className="bg-card border rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm flex items-center gap-2">
        <TypingDots className="text-muted-foreground" />
        {name && (
          <span className="text-[10px] text-muted-foreground ml-1">
            {name} печатает…
          </span>
        )}
      </div>
    </div>
  );
}
