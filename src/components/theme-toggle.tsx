"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface Props {
  /** Visual variant for the button. */
  variant?: "ghost" | "outline";
  className?: string;
}

/**
 * Light/Dark theme toggle button. Renders nothing on the very first paint
 * (before next-themes has hydrated) to avoid a flash of the wrong icon.
 */
export function ThemeToggle({ variant = "ghost", className }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Defer rendering until mounted so we don't show the wrong icon during SSR.
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size="icon"
        className={className}
        aria-label="Переключить тему"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant={variant}
      size="icon"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
