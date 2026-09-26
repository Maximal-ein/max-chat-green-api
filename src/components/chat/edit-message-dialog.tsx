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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { MessageRow } from "@/lib/types";

interface Props {
  message: MessageRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (id: string, text: string) => void;
}

/**
 * Dialog for editing the text of an outgoing message.
 * Pre-fills with the current message text.
 */
export function EditMessageDialog({ message, open, onOpenChange, onSave }: Props) {
  const [text, setText] = useState<string>(message?.text ?? "");

  // Reset the input when the dialog opens (deferred to avoid effect-set-state).
  useEffect(() => {
    if (!open || !message) return;
    const id = window.setTimeout(() => setText(message.text ?? ""), 0);
    return () => window.clearTimeout(id);
  }, [open, message]);

  if (!message) return null;

  const safeText = text ?? "";
  const onSaveClick = () => {
    const trimmed = safeText.trim();
    if (trimmed && trimmed !== message.text) {
      onSave(message.id, trimmed);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать сообщение</DialogTitle>
          <DialogDescription>
            Изменения видны только у вас.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Textarea
            value={safeText}
            onChange={(e) => setText(e.target.value)}
            maxLength={20000}
            rows={4}
            autoFocus
            className="resize-none scrollbar-thin"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSaveClick} disabled={!safeText.trim()}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
