"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSoundSettings } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * Toggles the "play sound on new incoming message" preference.
 * Persisted via zustand-persist in localStorage.
 */
export function SoundToggle({ className }: Props) {
  const enabled = useSoundSettings((s) => s.enabled);
  const toggle = useSoundSettings((s) => s.toggle);
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={toggle}
      aria-label={enabled ? "Выключить звук" : "Включить звук"}
      title={enabled ? "Звук включён" : "Звук выключен"}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}
