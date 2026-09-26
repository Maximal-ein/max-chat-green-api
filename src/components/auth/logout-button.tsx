"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";

export function LogoutButton() {
  const { logout, account } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          title={`Выйти (idInstance ${account?.idInstance ?? ""})`}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Выйти</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Выйти из аккаунта?</DialogTitle>
          <DialogDescription>
            Будут удалены локальные учётные данные. Чаты и сообщения в базе данных
            останутся, но вы больше не сможете их открывать без повторного входа.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Выходим…" : "Выйти"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
