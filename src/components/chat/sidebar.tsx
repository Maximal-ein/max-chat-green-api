"use client";

import { MessageCircle, Search, X, Archive } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/chat-store";
import { NewChatDialog } from "./new-chat-dialog";
import { ChatListItem } from "./chat-list-item";
import { SidebarFooter } from "./sidebar-footer";

interface Props {
  onSelect?: () => void;
}

export function Sidebar({ onSelect }: Props) {
  const chats = useChatStore((s) => s.chats);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const totalUnread = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    [chats],
  );

  const archivedCount = useMemo(
    () => chats.filter((c) => c.archived).length,
    [chats],
  );

  const filtered = useMemo(() => {
    const visible = chats.filter((c) =>
      showArchived ? c.archived : !c.archived,
    );
    if (!query.trim()) return visible;
    const q = query.toLowerCase();
    return visible.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q.replace(/\D/g, "")),
    );
  }, [chats, query, showArchived]);

  // Keyboard shortcut: Ctrl/Cmd+K focuses the search input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand header */}
      <div className="px-4 pt-4 pb-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="leading-tight flex-1">
            <div className="font-semibold text-sm">MAX Chat</div>
            <div className="text-[10px] text-sidebar-accent-foreground/70">
              GREEN-API клиент
            </div>
          </div>
          {totalUnread > 0 ? (
            <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {totalUnread > 99 ? "99+" : totalUnread}
            </div>
          ) : (
            <div className="text-[10px] text-sidebar-accent-foreground/50 px-1.5 py-0.5 rounded bg-sidebar-accent/60">
              {chats.length}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-accent-foreground/50" />
          <Input
            ref={searchRef}
            placeholder="Поиск (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-7 h-9 bg-sidebar-accent/60 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-accent-foreground/50 focus-visible:bg-sidebar-accent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-sidebar-accent-foreground/60 hover:text-sidebar-foreground"
              aria-label="Очистить поиск"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* New chat */}
      <div className="p-3 border-b border-sidebar-border">
        <NewChatDialog />
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-sidebar-accent-foreground/70">
                {showArchived
                  ? "Нет архивированных чатов"
                  : query
                    ? "Ничего не найдено"
                    : "Нет чатов. Создайте новый чат, чтобы начать."}
              </p>
            </div>
          ) : (
            <ul role="list" className="space-y-0.5 px-1.5">
              {filtered.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  active={chat.id === activeChatId}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    onSelect?.();
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>

      {/* Archived chats toggle */}
      {archivedCount > 0 && (
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-accent-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Скрыть архив" : "Архив"}
            <span className="ml-auto text-[10px] bg-sidebar-accent px-1.5 py-0.5 rounded">
              {archivedCount}
            </span>
          </Button>
        </div>
      )}

      <SidebarFooter />
    </div>
  );
}
