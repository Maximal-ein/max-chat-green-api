"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { TypingBubble } from "./typing-indicator";
import { MessageSearchBar } from "./message-search-bar";
import { EditMessageDialog } from "./edit-message-dialog";
import { useChatStore } from "@/store/chat-store";
import { useSearch } from "@/hooks/use-search";
import { useMessages } from "@/hooks/use-messages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { groupMessagesByDay } from "@/lib/message-grouping";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MessageRow } from "@/lib/types";

interface Props {
  messages: MessageRow[];
  chatId?: string | null;
}

export function MessageList({ messages, chatId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastLenRef = useRef(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<MessageRow | null>(null);
  const isTyping = useChatStore((s) => (chatId ? s.typing[chatId] ?? false : false));
  const { removeMessage, editMessage } = useMessages(chatId);

  const searchQuery = useSearch((s) => s.query);
  const setMatches = useSearch((s) => s.setMatches);
  const setOpen = useSearch((s) => s.setOpen);
  const matchIds = useSearch((s) => s.matchIds);
  const cursor = useSearch((s) => s.cursor);

  const groups = useMemo(() => groupMessagesByDay(messages), [messages]);
  const byId = useMemo(() => {
    const map = new Map<string, MessageRow>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  // Compute search matches.
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    setMatches(q ? messages.filter((m) => m.text.toLowerCase().includes(q)).map((m) => m.id) : []);
  }, [searchQuery, messages, setMatches]);

  // Ctrl+F opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // Auto-scroll to bottom on new message / typing.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const trigger = messages.length + (isTyping ? 1 : 0);
    if (trigger !== lastLenRef.current) {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (dist < 200) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      lastLenRef.current = trigger;
    }
  }, [messages.length, isTyping]);

  // Scroll focused match into view.
  useEffect(() => {
    if (matchIds.length === 0) return;
    const id = matchIds[cursor];
    if (!id) return;
    const el = document.querySelector<HTMLElement>(`[data-msg-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [cursor, matchIds]);

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 300);
  };

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    if (id) await removeMessage(id);
  };

  const onEditSave = async (id: string, text: string) => {
    setEditTarget(null);
    try {
      await editMessage(id, text);
      toast.success("Сообщение изменено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось изменить");
    }
  };

  if (!messages.length) {
    return (
      <div ref={containerRef} className="flex-1 chat-bg flex items-center justify-center p-6 overflow-y-auto scrollbar-thin">
        <div className="text-center text-muted-foreground text-sm max-w-sm">
          <p className="font-medium">Сообщений пока нет</p>
          <p className="mt-1 text-xs">Отправьте первое сообщение, чтобы начать переписку.</p>
        </div>
      </div>
    );
  }

  const matchSet = new Set(matchIds);
  const focusedId = matchIds.length > 0 ? matchIds[cursor] : null;

  return (
    <div className="flex-1 chat-bg overflow-hidden relative">
      <MessageSearchBar />
      <div ref={containerRef} onScroll={onScroll} className="h-full overflow-y-auto scrollbar-thin py-4" role="log" aria-live="polite">
        {groups.map((g, gi) => (
          <div key={g.dateKey + gi} className="space-y-0.5">
            <div className="flex justify-center my-3 sticky top-1 z-10">
              <span className="px-3 py-1 rounded-full bg-muted/80 backdrop-blur text-[11px] font-medium text-muted-foreground shadow-sm">{g.label}</span>
            </div>
            {g.items.map((m, i) => {
              const prev = g.items[i - 1];
              const isMine = m.direction === "outgoing";
              const showTail = !prev || prev.direction !== m.direction || m.timestamp - prev.timestamp > 5 * 60;
              const quoted = m.replyToId ? (() => {
                const q = byId.get(m.replyToId!);
                return q ? { text: q.text, isMine: q.direction === "outgoing" } : null;
              })() : null;
              const isMatch = matchSet.has(m.id);
              const isFocused = m.id === focusedId;
              return (
                <div key={m.id} data-msg-id={m.id} className={cn("rounded transition-colors", isFocused && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background", isMatch && !isFocused && "bg-primary/5")}>
                  <MessageBubble message={m} isMine={isMine} showTail={showTail} quoted={quoted} onDelete={setDeleteTarget} onEdit={setEditTarget} />
                </div>
              );
            })}
          </div>
        ))}
        {isTyping && <TypingBubble />}
        <div className="h-2" />
      </div>

      <button type="button" onClick={scrollToBottom} className={cn("absolute bottom-4 right-4 z-20 h-10 w-10 rounded-full bg-card border shadow-lg text-foreground hover:bg-accent flex items-center justify-center transition-all", showScrollBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none")} aria-label="Прокрутить вниз">
        <ArrowDown className="h-5 w-5" />
      </button>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сообщение?</AlertDialogTitle>
            <AlertDialogDescription>
              Сообщение будет удалено только у вас. У получателя оно останется.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditMessageDialog
        message={editTarget}
        open={editTarget !== null}
        onOpenChange={(o) => !o && setEditTarget(null)}
        onSave={onEditSave}
      />
    </div>
  );
}
