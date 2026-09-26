"use client";

import { useEffect, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { EmptyChat } from "@/components/chat/empty-state";
import { ConnectionBanner } from "@/components/chat/connection-banner";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/hooks/use-auth";
import { useChats } from "@/hooks/use-chats";
import { useMessages } from "@/hooks/use-messages";
import { useNotifications } from "@/hooks/use-notifications";
import { useUnreadTitle } from "@/hooks/use-unread-title";
import { useChatStore } from "@/store/chat-store";

export function ChatApp() {
  const { account } = useAuth();
  const { chats, loadChats, markAsRead } = useChats();
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);
  const setSidebarOpen = useChatStore((s) => s.setSidebarOpen);

  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Initial chat list load.
  useEffect(() => {
    if (account?.id) void loadChats();
  }, [account?.id, loadChats]);

  // Start polling for incoming notifications whenever we have an account.
  useNotifications(Boolean(account?.id));

  // Update document title with total unread count.
  useUnreadTitle();

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const { messages, loadMessages } = useMessages(activeChatId);

  useEffect(() => {
    if (activeChatId) void loadMessages();
  }, [activeChatId, loadMessages]);

  // Mark chat as read when opened (clears unread badge).
  useEffect(() => {
    if (activeChatId && activeChat?.unreadCount && activeChat.unreadCount > 0) {
      void markAsRead(activeChatId);
    }
  }, [activeChatId, activeChat?.unreadCount, markAsRead]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background relative">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:block shrink-0 transition-[width] duration-200 border-r border-sidebar-border",
          sidebarOpen ? "w-80" : "w-0",
        )}
      >
        {sidebarOpen && (
          <div className="h-full w-80">
            <Sidebar />
          </div>
        )}
      </aside>

      {/* Mobile sidebar (drawer) */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebar(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] shadow-xl">
            <Sidebar onSelect={() => setMobileSidebar(false)} />
          </div>
        </div>
      )}

      {/* Main panel */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <ConnectionBanner />
        {activeChat ? (
          <>
            <ChatHeader
              chat={activeChat}
              onBack={() => setActiveChatId(null)}
            />
            <MessageList messages={messages} chatId={activeChat.id} />
            <MessageInput chatId={activeChat.id} />
          </>
        ) : (
          <EmptyChat />
        )}

        {/* Mobile open-sidebar button (top-left) */}
        <button
          type="button"
          onClick={() => setMobileSidebar(true)}
          className="md:hidden absolute top-2 left-2 z-10 h-9 w-9 flex items-center justify-center rounded-lg bg-card border shadow text-foreground"
          aria-label="Открыть панель чатов"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop sidebar collapse toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "hidden md:flex absolute top-3 z-20 h-7 w-7 items-center justify-center rounded-full",
            "bg-card border shadow text-muted-foreground hover:text-foreground transition-all",
            sidebarOpen ? "left-[316px]" : "left-3",
          )}
          aria-label={sidebarOpen ? "Свернуть панель" : "Развернуть панель"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        {/* Top-right logout (when no chat selected on desktop) */}
        {!activeChat && (
          <div className="hidden md:flex absolute top-2 right-2 z-10">
            <LogoutButton />
          </div>
        )}
      </main>
    </div>
  );
}
