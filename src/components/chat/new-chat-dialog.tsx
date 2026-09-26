"use client";

import { useState } from "react";
import { Loader2, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChats } from "@/hooks/use-chats";
import { toast } from "sonner";

export function NewChatDialog() {
  const { createChat } = useChats();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "");
    if (!clean) {
      toast.error("Введите номер телефона");
      return;
    }
    if (clean.length < 10) {
      toast.error("Некорректный номер телефона");
      return;
    }
    setLoading(true);
    try {
      const chat = await createChat(clean, name.trim() || undefined);
      toast.success(`Чат создан: ${chat.name || chat.phoneNumber}`);
      setPhone("");
      setName("");
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось создать чат";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="w-full"
          aria-label="Новый чат"
        >
          <Plus className="h-4 w-4" />
          <span>Новый чат</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый чат</DialogTitle>
          <DialogDescription>
            Введите номер получателя в международном формате. Для MAX: 11–12 цифр
            (например, 79991234567 — Россия).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефона</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                inputMode="tel"
                placeholder="79991234567"
                className="pl-9"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">
              Имя <span className="text-xs text-muted-foreground">(необязательно)</span>
            </Label>
            <Input
              id="name"
              placeholder="как назвать контакт"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Проверка…
                </>
              ) : (
                "Создать чат"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
