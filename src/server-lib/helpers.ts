// Server-only helpers shared across API route handlers.
// Reads account credentials from the request, validates shape, returns a typed object.

import { db } from "@/lib/db";
import type { ApiAccount } from "@/lib/green-api";
import type { AccountRow } from "@/lib/types";

/** Convert a Prisma Account row to a plain AccountRow (no Date objects). */
export function toAccountRow(a: {
  id: string;
  idInstance: string;
  apiTokenInstance: string;
  label: string | null;
  stateInstance: string | null;
  apiUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AccountRow {
  return {
    id: a.id,
    idInstance: a.idInstance,
    apiTokenInstance: a.apiTokenInstance,
    label: a.label,
    stateInstance: a.stateInstance,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

/** Convert Prisma Account to ApiAccount for GREEN-API client. */
export function toApiAccount(a: {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string | null;
}): ApiAccount {
  return {
    idInstance: a.idInstance,
    apiTokenInstance: a.apiTokenInstance,
    apiUrl: a.apiUrl ?? null,
  };
}

/** Read & validate a JSON body. Returns null + sets 400 response on error. */
export async function readJsonBody<T = unknown>(
  req: Request,
): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Standard JSON response helper. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Load an account from DB by id. Returns null if not found. */
export async function getAccountById(
  accountId: string,
): Promise<{
  id: string;
  idInstance: string;
  apiTokenInstance: string;
  apiUrl: string | null;
  stateInstance: string | null;
  label: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null> {
  const account = await db.account.findUnique({ where: { id: accountId } });
  if (!account) return null;
  return account;
}

/** Format a unix-seconds timestamp as a short local time string (HH:MM). */
export function formatTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
