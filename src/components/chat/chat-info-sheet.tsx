"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  avatarGradient,
  formatPhone,
  initialsOf,
} from "@/components/chat/chat-list-item";
import type { ChatRow } from "@/lib/types";

interface Props {
  chat: ChatRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function ChatInfoSheet({ chat, open, onOpenChange }: Props) {
  const title = chat.name || formatPhone(chat.phoneNumber);
  const lastMsgDate = chat.lastMessageAt
    ? new Date(chat.lastMessageAt * 1000).toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sr-only">Информация о чате</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center pt-6 pb-4">
          <Avatar className="h-24 w-24">
            <AvatarFallback
              className={`bg-gradient-to-br text-white text-3xl font-semibold ${avatarGradient(title)}`}
            >
              {initialsOf(chat.name || "", chat.phoneNumber)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-xl font-semibold text-center break-words">
            {title}
          </h2>
          {chat.name && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatPhone(chat.phoneNumber)}
            </p>
          )}
        </div>
        <div className="space-y-3 px-1">
          <InfoRow label="Номер телефона" value={formatPhone(chat.phoneNumber)} />
          <InfoRow label="MAX chatId" value={chat.chatId || "—"} mono />
          <InfoRow
            label="Последнее сообщение"
            value={chat.lastMessageText || "—"}
          />
          <InfoRow label="Время последнего сообщения" value={lastMsgDate} />
          {chat.pinned && <InfoRow label="Статус" value="📌 Закреплён" />}
          {chat.muted && <InfoRow label="Уведомления" value="🔇 Отключены" />}
          {chat.archived && <InfoRow label="Архив" value="📦 В архиве" />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={`text-sm mt-1 break-words ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
