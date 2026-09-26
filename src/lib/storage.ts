// LocalStorage helpers for persisting the active session credentials.
// We do NOT store messages here — those live in Prisma (SQLite).

import type { AccountRow } from "./types";

const SESSION_KEY = "maxchat.session.v1";

export interface SessionData {
  account: AccountRow;
}

/** Read the persisted session from localStorage. Returns null if absent/invalid. */
export function readSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionData;
    if (!parsed?.account?.idInstance || !parsed?.account?.apiTokenInstance) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Persist the active session to localStorage. */
export function writeSession(session: SessionData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore quota / serialization errors
  }
}

/** Clear the persisted session (logout). */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

/** Build the GREEN-API base URL for a given account. */
export function resolveApiUrl(account: {
  idInstance: string;
  apiUrl?: string | null;
}): string {
  const url = (account.apiUrl || "").trim();
  if (url) return url.replace(/\/+$/, "");
  return "https://api.green-api.com";
}
