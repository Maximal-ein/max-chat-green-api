"use client";

import {
  MoreVertical,
  Info,
  Download,
  Trash2,
  Pin as PinIcon,
  Pencil,
  Bell,
  BellOff,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatRow } from "@/lib/types";

interface Props {
  chat: ChatRow;
  onInfo: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  onRename: () => void;
  onExport: (format: "txt" | "json") => void;
  onDelete: () => void;
}

/**
 * The three-dots dropdown menu in the chat header.
 * Extracted to keep chat-header.tsx under 200 lines.
 */
export function ChatHeaderMenu({
  chat,
  onInfo,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onRename,
  onExport,
  onDelete,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Меню">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onInfo}>
          <Info className="h-4 w-4 mr-2" />
          Информация
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onTogglePin}>
          <PinIcon className="h-4 w-4 mr-2" />
          {chat.pinned ? "Открепить чат" : "Закрепить чат"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggleMute}>
          {chat.muted ? (
            <BellOff className="h-4 w-4 mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          {chat.muted ? "Включить уведомления" : "Отключить уведомления"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onRename}>
          <Pencil className="h-4 w-4 mr-2" />
          Переименовать чат
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="h-4 w-4 mr-2" />
            Экспорт чата
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => onExport("txt")}>
              Как .txt
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onExport("json")}>
              Как .json
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={onToggleArchive}>
          {chat.archived ? (
            <ArchiveRestore className="h-4 w-4 mr-2" />
          ) : (
            <Archive className="h-4 w-4 mr-2" />
          )}
          {chat.archived ? "Вернуть из архива" : "Архивировать"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить чат
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
