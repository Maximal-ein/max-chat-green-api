"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Copy,
  Reply as ReplyIcon,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { MessageRow } from "@/lib/types";
import { useReply } from "@/hooks/use-reply";
import { MarkdownText } from "./markdown-text";
import { MessageContextMenu } from "./message-context-menu";

interface Props {
  message: MessageRow;
  isMine: boolean;
  showTail: boolean;
  quoted?: { text: string; isMine: boolean } | null;
  onDelete?: (id: string) => void;
  onEdit?: (message: MessageRow) => void;
}

function formatTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatusIcon({ status }: { status: MessageRow["status"] }) {
  if (status === "pending") return <Clock className="h-3 w-3 inline-block" aria-label="отправляется" />;
  if (status === "failed") return <AlertCircle className="h-3 w-3 inline-block text-destructive" aria-label="ошибка" />;
  if (status === "read") return <CheckCheck className="h-3.5 w-3.5 inline-block" aria-label="прочитано" />;
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 inline-block text-primary-foreground/60" aria-label="доставлено" />;
  return <Check className="h-3 w-3 inline-block" aria-label="отправлено" />;
}

export function MessageBubble({ message, isMine, showTail, quoted, onDelete, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const setReplyTo = useReply((s) => s.setReplyTo);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API may be unavailable; ignore silently
    }
  };

  const onReply = () => setReplyTo(message);

  const fullDate = new Date(message.timestamp * 1000).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={cn("group flex w-full px-3 sm:px-6", isMine ? "justify-end" : "justify-start", "mt-0.5")}>
          <div className={cn("relative max-w-[78%] sm:max-w-[65%] md:max-w-[55%]", isMine ? "items-end" : "items-start")}>
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2 shadow-sm relative break-words transition-colors",
                isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-card-foreground border rounded-bl-md",
                message.status === "failed" && "ring-2 ring-destructive/40",
              )}
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              {quoted && (
                <div className={cn("mb-1.5 pl-2 border-l-2 rounded-r", isMine ? "border-primary-foreground/60 bg-primary-foreground/10" : "border-primary bg-primary/10")}>
                  <div className={cn("text-[10px] font-medium", isMine ? "text-primary-foreground/80" : "text-primary")}>{quoted.isMine ? "Вы" : "Собеседник"}</div>
                  <div className={cn("text-xs truncate max-w-[220px] sm:max-w-[280px]", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>{quoted.text}</div>
                </div>
              )}
              <MarkdownText text={message.text} className={isMine ? "text-primary-foreground" : "text-card-foreground"} />
              <div className={cn("flex items-center gap-1 justify-end mt-0.5 text-[10px]", isMine ? "text-primary-foreground/80" : "text-muted-foreground")}>
                <span title={fullDate}>{formatTime(message.timestamp)}</span>
                {isMine && <StatusIcon status={message.status} />}
              </div>
            </div>

            {/* Hover actions */}
            <div className={cn("absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5", isMine ? "-left-32 flex-row-reverse" : "-right-32")}>
              <button type="button" onClick={onReply} className="h-6 w-6 rounded-full bg-card border shadow text-muted-foreground hover:text-primary flex items-center justify-center" aria-label="Ответить" title="Ответить">
                <ReplyIcon className="h-3 w-3" />
              </button>
              {isMine && onEdit && (
                <button type="button" onClick={() => onEdit(message)} className="h-6 w-6 rounded-full bg-card border shadow text-muted-foreground hover:text-primary flex items-center justify-center" aria-label="Редактировать" title="Редактировать">
                  <Pencil className="h-3 w-3" />
                </button>
              )}
              <button type="button" onClick={onCopy} className="h-6 w-6 rounded-full bg-card border shadow text-muted-foreground hover:text-foreground flex items-center justify-center" aria-label="Скопировать сообщение" title="Скопировать">
                {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              </button>
              {onDelete && (
                <button type="button" onClick={() => onDelete(message.id)} className="h-6 w-6 rounded-full bg-card border shadow text-muted-foreground hover:text-destructive flex items-center justify-center" aria-label="Удалить сообщение" title="Удалить">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <MessageContextMenu
        message={message}
        isMine={isMine}
        copied={copied}
        onReply={onReply}
        onCopy={onCopy}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </ContextMenu>
  );
}
