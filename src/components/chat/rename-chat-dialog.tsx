"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ChatRow } from "@/lib/types";
import { formatPhone } from "./chat-list-item";

interface Props {
  chat: ChatRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onRename: (name: string | null) => void;
}

/**
 * Dialog for editing a chat's custom display name.
 * Pre-fills with the current name (or empty if none).
 */
export function RenameChatDialog({ chat, open, onOpenChange, onRename }: Props) {
  const [name, setName] = useState(chat.name ?? "");

  // Reset the input when the dialog opens (deferred to avoid effect-set-state).
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => setName(chat.name ?? ""), 0);
    return () => window.clearTimeout(id);
  }, [open, chat.name]);

  const placeholder = formatPhone(chat.phoneNumber);

  const onSave = () => {
    const trimmed = name.trim();
    onRename(trimmed.length > 0 ? trimmed : null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSave();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Переименовать чат</DialogTitle>
          <DialogDescription>
            Введите новое имя для чата. Оставьте пустым, чтобы использовать номер телефона.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="chat-name">Имя чата</Label>
          <Input
            id="chat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            maxLength={100}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
