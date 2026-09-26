"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Shortcut {
  keys: string;
  action: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: "Ctrl + K", action: "Фокус на поле поиска чатов" },
  { keys: "Ctrl + F", action: "Поиск по сообщениям в чате" },
  { keys: "Enter", action: "Отправить сообщение" },
  { keys: "Shift + Enter", action: "Перенос строки" },
  { keys: "Esc", action: "Закрыть диалог / отменить ответ" },
  { keys: "↑ / ↓", action: "Навигация между совпадениями поиска" },
];

/**
 * Floating help button (bottom-left of the chat area) that opens a dialog
 * listing all keyboard shortcuts. Also opens with the "?" key.
 */
export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // "?" without modifier — but only when not typing in an input.
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const inField = tag === "input" || tag === "textarea";
      if (e.key === "?" && !inField) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label="Горячие клавиши"
          title="Горячие клавиши (?)"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Горячие клавиши</DialogTitle>
          <DialogDescription>
            Быстрые клавиши для навигации по приложению.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {SHORTCUTS.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0"
            >
              <span className="text-sm text-muted-foreground">{s.action}</span>
              <kbd className="px-2 py-0.5 rounded border bg-muted text-xs font-mono whitespace-nowrap">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
