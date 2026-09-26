"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, X, Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Search bar shown at the top-right of the message list when Ctrl+F is pressed.
 * Lets the user type a query and navigate between matches with up/down arrows.
 */
export function MessageSearchBar() {
  const open = useSearch((s) => s.open);
  const query = useSearch((s) => s.query);
  const matchIds = useSearch((s) => s.matchIds);
  const cursor = useSearch((s) => s.cursor);
  const setOpen = useSearch((s) => s.setOpen);
  const setQuery = useSearch((s) => s.setQuery);
  const next = useSearch((s) => s.next);
  const prev = useSearch((s) => s.prev);
  const clear = useSearch((s) => s.clear);
  const inputRef = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState(query);

  // Sync local input → store (debounced via effect).
  useEffect(() => {
    const id = window.setTimeout(() => setQuery(local), 200);
    return () => window.clearTimeout(id);
  }, [local, setQuery]);

  // Focus input when opened. Clear local text when closed (deferred).
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    // Defer the clear so it doesn't run synchronously in the effect body.
    const id = window.setTimeout(() => setLocal(""), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!open) return null;

  const count = matchIds.length;
  const label = count > 0 ? `${cursor + 1} из ${count}` : "нет совпадений";

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      clear();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) prev();
      else next();
    }
  };

  return (
    <div className="absolute top-2 right-3 z-30 flex items-center gap-1 bg-card border rounded-lg shadow-lg px-2 py-1.5">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <Input
        ref={inputRef}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Поиск в чате…"
        className="h-7 w-44 sm:w-56 border-0 focus-visible:ring-0 px-1 text-sm"
      />
      <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap px-1">
        {label}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={prev}
        disabled={count === 0}
        aria-label="Предыдущее совпадение"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={next}
        disabled={count === 0}
        aria-label="Следующее совпадение"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setOpen(false)}
        aria-label="Закрыть поиск"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
