"use client";

import { cn } from "@/lib/utils";
import { Pin, BellOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatRow } from "@/lib/types";

export function formatPhone(phone: string): string {
  if (/^7\d{10}$/.test(phone)) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`;
  }
  if (/^375\d{9}$/.test(phone)) {
    return `+375 ${phone.slice(3, 5)} ${phone.slice(5, 8)}-${phone.slice(8, 10)}-${phone.slice(10, 12)}`;
  }
  return phone ? `+${phone}` : "";
}

export function initialsOf(name: string, phone: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return phone ? phone.slice(-2) : "?";
}

export function formatChatTime(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return "";
  const d = new Date(unixSeconds * 1000);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "вчера";
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

// Deterministic gradient palette keyed off a string. Returns tailwind classes.
const AVATAR_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-pink-600",
  "from-indigo-500 to-violet-600",
  "from-red-500 to-rose-600",
  "from-yellow-500 to-amber-600",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function avatarGradient(key: string): string {
  return AVATAR_GRADIENTS[hashString(key) % AVATAR_GRADIENTS.length];
}

export function ChatListItem({
  chat,
  active,
  onClick,
}: {
  chat: ChatRow;
  active: boolean;
  onClick: () => void;
}) {
  const unread = chat.unreadCount > 0;
  const displayName = chat.name || formatPhone(chat.phoneNumber);
  return (
    <li>
      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          "w-full h-auto justify-start gap-3 px-2.5 py-2.5 rounded-lg text-left",
          "hover:bg-sidebar-accent transition-colors",
          active && "bg-sidebar-accent",
        )}
      >
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback
              className={cn(
                "bg-gradient-to-br text-white text-xs font-semibold",
                avatarGradient(displayName),
              )}
            >
              {initialsOf(chat.name || "", chat.phoneNumber)}
            </AvatarFallback>
          </Avatar>
          {unread && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-sidebar">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 min-w-0">
              {chat.pinned && (
                <Pin className="h-3 w-3 shrink-0 text-primary fill-primary" />
              )}
              <span
                className={cn(
                  "text-sm truncate",
                  unread ? "font-semibold text-sidebar-foreground" : "font-medium text-sidebar-foreground/90",
                )}
              >
                {displayName}
              </span>
              {chat.muted && (
                <BellOff className="h-3 w-3 shrink-0 text-sidebar-accent-foreground/50" />
              )}
            </span>
            <span
              className={cn(
                "text-[10px] shrink-0",
                unread ? "text-primary font-medium" : "text-sidebar-accent-foreground/60",
              )}
            >
              {formatChatTime(chat.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div
              className={cn(
                "text-xs truncate",
                unread ? "text-sidebar-foreground/80" : "text-sidebar-accent-foreground/70",
              )}
            >
              {chat.lastMessageText ? (
                chat.lastMessageText
              ) : (
                <span className="italic opacity-60">Нет сообщений</span>
              )}
            </div>
            {unread && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
            )}
          </div>
        </div>
      </Button>
    </li>
  );
}
