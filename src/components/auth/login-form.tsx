"use client";

import { useState } from "react";
import { Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function LoginForm() {
  const { login } = useAuth();
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      toast.error("Заполните idInstance и apiTokenInstance");
      return;
    }
    setLoading(true);
    try {
      const result = await login({
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
        apiUrl: apiUrl.trim() || undefined,
      });
      toast.success(
        `Подключено. State: ${result.stateInstance ?? "unknown"}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка входа";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="outline" />
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              MAX Chat
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Чат-клиент для мессенджера MAX через GREEN-API
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="idInstance">idInstance</Label>
            <Input
              id="idInstance"
              inputMode="numeric"
              placeholder="например 1101111111"
              autoComplete="off"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiTokenInstance">apiTokenInstance</Label>
            <Input
              id="apiTokenInstance"
              type="password"
              placeholder="токен из кабинета GREEN-API"
              autoComplete="off"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl" className="flex items-center gap-1.5">
              apiUrl <span className="text-xs text-muted-foreground">(необязательно)</span>
            </Label>
            <Input
              id="apiUrl"
              type="url"
              placeholder="https://api.green-api.com"
              autoComplete="off"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Подключение…
              </>
            ) : (
              "Войти"
            )}
          </Button>

          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Учётные данные хранятся только в вашем браузере и используются для
              прямых запросов к GREEN-API. Получить их можно бесплатно в{" "}
              <a
                href="https://console.green-api.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                кабинете GREEN-API
              </a>
              .
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Тестовое задание · React + Next.js · GREEN-API для MAX
        </p>
      </div>
    </div>
  );
}
