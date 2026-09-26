"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface Props {
  children: React.ReactNode;
  /** Default theme when nothing is persisted. */
  defaultTheme?: string;
}

/**
 * Wraps the app in next-themes so any `.dark` / `:root` CSS variables defined
 * in globals.css are applied automatically. Theme is persisted in localStorage
 * under the key "maxchat.theme".
 */
export function ThemeProvider({ children, defaultTheme = "light" }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange
      storageKey="maxchat.theme"
    >
      {children}
    </NextThemesProvider>
  );
}
