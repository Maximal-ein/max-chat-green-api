// use-sound: tiny Zustand store for the user's "play sound on new message"
// preference. Persisted to localStorage so the choice survives reloads.

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
}

export const useSoundSettings = create<SoundState>()(
  persist(
    (set) => ({
      enabled: true,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (v) => set({ enabled: v }),
    }),
    {
      name: "maxchat.sound",
      // Only persist the `enabled` flag.
      partialize: (s) => ({ enabled: s.enabled }),
    },
  ),
);
