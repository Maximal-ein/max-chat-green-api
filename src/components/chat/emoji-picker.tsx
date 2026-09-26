"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMOJI_CATEGORIES = {
  "Смайлы": ["😀", "😂", "🥰", "😍", "😎", "🤔", "😅", "😭", "😡", "👍", "👎", "👏", "🙏", "💪", "🎉", "🔥", "❤️", "💔", "✨", "⭐"],
  "Жесты": ["👋", "🤚", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "👈", "👉", "👆", "👇", "☝️", "🫶", "🫰", "🤝", "✊"],
  "Сердца": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️"],
  "Животные": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄", "🐝", "🦋", "🐢", "🐙"],
  "Еда": ["🍎", "🍊", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥥", "🍅", "🥑", "🍔", "🍕", "🌭", "🍟", "🍿", "🍩"],
} as const;

interface Props {
  onPick: (emoji: string) => void;
}

/**
 * A lightweight emoji picker popover. Opens on click of the smile button.
 * Has 5 categories of 20 emojis each. Clicking an emoji calls onPick and
 * closes the popover.
 */
export function EmojiPicker({ onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<keyof typeof EMOJI_CATEGORIES>("Смайлы");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onEmoji = (emoji: string) => {
    onPick(emoji);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(!open)}
        aria-label="Эмодзи"
        title="Эмодзи"
      >
        <Smile className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute bottom-10 right-0 z-30 w-64 bg-card border rounded-lg shadow-xl overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-thin border-b">
            {(Object.keys(EMOJI_CATEGORIES) as (keyof typeof EMOJI_CATEGORIES)[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-1.5 text-[10px] whitespace-nowrap border-b-2 transition-colors",
                  category === cat
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 p-2 max-h-48 overflow-y-auto scrollbar-thin">
            {EMOJI_CATEGORIES[category].map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onEmoji(emoji)}
                className="text-xl hover:bg-accent rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
