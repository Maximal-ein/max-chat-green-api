"use client";

import {
  Check,
  Copy,
  Reply as ReplyIcon,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import type { MessageRow } from "@/lib/types";

interface Props {
  message: MessageRow;
  isMine: boolean;
  copied: boolean;
  onReply: () => void;
  onCopy: () => void;
  onEdit?: (message: MessageRow) => void;
  onDelete?: (id: string) => void;
}

/**
 * The right-click context menu content for a message bubble.
 * Extracted to keep message-bubble.tsx under 200 lines.
 */
export function MessageContextMenu({
  message,
  isMine,
  copied,
  onReply,
  onCopy,
  onEdit,
  onDelete,
}: Props) {
  return (
    <ContextMenuContent className="w-48">
      <ContextMenuItem onSelect={onReply}>
        <ReplyIcon className="h-4 w-4 mr-2" />
        Ответить
      </ContextMenuItem>
      <ContextMenuItem onSelect={onCopy}>
        {copied ? (
          <Check className="h-4 w-4 mr-2 text-primary" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {copied ? "Скопировано" : "Копировать"}
      </ContextMenuItem>
      {isMine && onEdit && (
        <ContextMenuItem onSelect={() => onEdit(message)}>
          <Pencil className="h-4 w-4 mr-2" />
          Редактировать
        </ContextMenuItem>
      )}
      <ContextMenuSeparator />
      {onDelete && (
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onDelete(message.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить
        </ContextMenuItem>
      )}
    </ContextMenuContent>
  );
}
