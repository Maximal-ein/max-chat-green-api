// use-auth: handles login, logout, restore session from localStorage on mount.

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearSession,
  readSession,
  writeSession,
  type SessionData,
} from "@/lib/storage";
import type { AccountRow } from "@/lib/types";
import { useChatStore } from "@/store/chat-store";

interface LoginArgs {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string;
}

interface LoginResult {
  account: AccountRow;
  stateInstance: string | null;
}

/** Hook that exposes login/logout + the active account, persisted to localStorage. */
export function useAuth() {
  const account = useChatStore((s) => s.account);
  const setAccount = useChatStore((s) => s.setAccount);
  const reset = useChatStore((s) => s.reset);
  const [hydrated, setHydrated] = useState(false);

  // Restore session on mount (client-only).
  // Use useState initializer trick: schedule setAccount in a microtask to
  // avoid cascading renders during the initial render phase.
  useEffect(() => {
    const session = readSession();
    if (session?.account) setAccount(session.account);
    // Defer the hydration flag so it does not run synchronously in the effect body.
    const id = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(id);
  }, [setAccount]);

  const login = useCallback(
    async (args: LoginArgs): Promise<LoginResult> => {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      if (!res.ok || !data.account) {
        throw new Error(data?.error || "Login failed");
      }
      const next: AccountRow = data.account;
      const session: SessionData = { account: next };
      writeSession(session);
      setAccount(next);
      return {
        account: next,
        stateInstance: next.stateInstance ?? null,
      };
    },
    [setAccount],
  );

  const logout = useCallback(async () => {
    if (account?.id) {
      try {
        await fetch("/api/account/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: account.id }),
        });
      } catch {
        // ignore network errors
      }
    }
    clearSession();
    reset();
  }, [account, reset]);

  return { account, hydrated, login, logout };
}
