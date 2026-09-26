"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useChats } from "@/hooks/use-chats";
import { useChatStore } from "@/store/chat-store";
import {
  avatarGradient,
  formatPhone,
  initialsOf,
} from "@/components/chat/chat-list-item";
import { ChatHeaderMenu } from "./chat-header-menu";
import { ChatInfoSheet } from "./chat-info-sheet";
import { RenameChatDialog } from "./rename-chat-dialog";
import { TypingDots } from "./typing-indicator";
import { toast } from "sonner";
import type { ChatRow } from "@/lib/types";

interface Props {
  chat: ChatRow;
  onBack: () => void;
}

export function ChatHeader({ chat, onBack }: Props) {
  const { deleteChat, togglePin, renameChat, toggleMute, toggleArchive } = useChats();
  const account = useChatStore((s) => s.account);
  const online = useChatStore((s) => s.online);
  const isTyping = useChatStore((s) => s.typing[chat.id] ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const [, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const exportUrl = (format: "txt" | "json") =>
    `/api/chats/${chat.id}/export?accountId=${account?.id ?? ""}&format=${format}`;

  const onExport = (format: "txt" | "json") => window.open(exportUrl(format), "_blank");
  const onTogglePin = async () => {
    await togglePin(chat.id, !chat.pinned);
    toast.success(chat.pinned ? "Чат откреплён" : "Чат закреплён");
  };
  const onToggleMute = async () => {
    await toggleMute(chat.id, !chat.muted);
    toast.success(chat.muted ? "Уведомления включены" : "Уведомления отключены");
  };
  const onToggleArchive = async () => {
    await toggleArchive(chat.id, !chat.archived);
    toast.success(chat.archived ? "Чат возвращён из архива" : "Чат архивирован");
  };
  const onRename = async (name: string | null) => {
    await renameChat(chat.id, name);
    toast.success(name ? "Чат переименован" : "Имя чата сброшено");
  };

  const title = chat.name || formatPhone(chat.phoneNumber);
  const subtitle = isTyping ? "печатает…" : chat.name ? formatPhone(chat.phoneNumber) : online ? "в сети" : "не в сети";

  const onDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteChat(chat.id);
      toast.success("Чат удалён");
    } catch {
      toast.error("Не удалось удалить чат");
    }
  };

  return (
    <header className="border-b bg-card/95 backdrop-blur px-3 sm:px-4 py-2.5 flex items-center gap-2 shrink-0">
      <Button variant="ghost" size="icon" className="sm:hidden -ml-1" onClick={onBack} aria-label="Назад">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <button type="button" onClick={() => setInfoOpen(true)} className="flex items-center gap-2 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className={`bg-gradient-to-br text-white text-xs font-semibold ${avatarGradient(title)}`}>
            {initialsOf(chat.name || "", chat.phoneNumber)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{title}</div>
          <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
            {isTyping ? (
              <TypingDots className="text-primary" />
            ) : (
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${online ? "bg-primary animate-pulse" : "bg-muted-foreground/50"}`} aria-hidden />
            )}
            <span className={isTyping ? "text-primary" : ""}>{subtitle}</span>
          </div>
        </div>
      </button>
      <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Позвонить" disabled>
        <Phone className="h-5 w-5" />
      </Button>
      <ChatHeaderMenu
        chat={chat}
        onInfo={() => setInfoOpen(true)}
        onTogglePin={onTogglePin}
        onToggleMute={onToggleMute}
        onToggleArchive={onToggleArchive}
        onRename={() => setRenameOpen(true)}
        onExport={onExport}
        onDelete={() => setConfirmDelete(true)}
      />
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить чат?</AlertDialogTitle>
            <AlertDialogDescription>
              Все сообщения этого чата будут удалены без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <RenameChatDialog chat={chat} open={renameOpen} onOpenChange={setRenameOpen} onRename={onRename} />
      <ChatInfoSheet chat={chat} open={infoOpen} onOpenChange={setInfoOpen} />
    </header>
  );
}
