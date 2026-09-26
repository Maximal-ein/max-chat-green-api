"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { avatarGradient, initialsOf } from "./chat-list-item";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { KeyboardHelp } from "@/components/keyboard-help";

export function SidebarFooter() {
  const account = useChatStore((s) => s.account);
  const online = useChatStore((s) => s.online);
  const label = `Instance ${account?.idInstance ?? ""}`;
  return (
    <div className="border-t border-sidebar-border p-2 flex items-center gap-1">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-white text-xs font-semibold shrink-0",
          avatarGradient(label),
        )}
      >
        {initialsOf("", account?.idInstance ?? "")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">
          {account?.idInstance ?? "—"}
        </div>
        <div className="text-[10px] text-sidebar-accent-foreground/70 flex items-center gap-1">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              online ? "bg-primary animate-pulse" : "bg-muted-foreground/60",
            )}
          />
          {online ? "в сети" : "не в сети"}
          {account?.stateInstance ? ` · ${account.stateInstance}` : ""}
        </div>
      </div>
      <SoundToggle className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" />
      <KeyboardHelp />
      <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground h-8 w-8" />
      <LogoutButton />
    </div>
  );
}
