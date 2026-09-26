// Server-side GREEN-API client. Only imported from API route handlers.
// Keeps apiTokenInstance off the client.

import { resolveApiUrl } from "./storage";

/** Minimal account shape required to call GREEN-API. */
export interface ApiAccount {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string | null;
}

/** Error thrown for any non-2xx response from GREEN-API. */
export class GreenApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "GreenApiError";
    this.status = status;
    this.code = code;
  }
}

function buildUrl(
  account: ApiAccount,
  method: string,
  suffix?: string | number,
): string {
  const base = resolveApiUrl(account);
  const cleanMethod = method.replace(/^\/+/, "");
  const tail = suffix !== undefined ? `/${suffix}` : "";
  return `${base}/waInstance${account.idInstance}/${cleanMethod}/${account.apiTokenInstance}${tail}`;
}

async function callJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message)
        : `GREEN-API HTTP ${res.status}`) || `HTTP ${res.status}`;
    const code =
      body && typeof body === "object" && "code" in body
        ? String((body as { code?: unknown }).code)
        : undefined;
    throw new GreenApiError(message, res.status, code);
  }

  return body as T;
}

/** getStateInstance — verify credentials & instance auth status. */
export function getStateInstance(account: ApiAccount) {
  return callJson<{ stateInstance?: string } & Record<string, unknown>>(
    buildUrl(account, "getStateInstance"),
    { method: "GET" },
  );
}

/** checkAccount — resolve a phone number to a MAX chatId. */
export function checkAccount(account: ApiAccount, phoneNumber: number | string) {
  return callJson<{
    exist?: boolean;
    chatId?: string;
    fromCache?: boolean;
  } & Record<string, unknown>>(buildUrl(account, "checkAccount"), {
    method: "POST",
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  });
}

/** sendMessage — send a text message to a chatId. */
export function sendMessage(
  account: ApiAccount,
  chatId: string,
  message: string,
) {
  return callJson<{ idMessage?: string } & Record<string, unknown>>(
    buildUrl(account, "sendMessage"),
    {
      method: "POST",
      body: JSON.stringify({ chatId, message }),
    },
  );
}

/** receiveNotification — long-poll for next incoming webhook. */
export function receiveNotification(
  account: ApiAccount,
  receiveTimeout = 5,
) {
  const url = `${buildUrl(account, "receiveNotification")}?receiveTimeout=${receiveTimeout}`;
  return callJson<{ receiptId?: number; body?: unknown } | null>(url, {
    method: "GET",
  });
}

/** deleteNotification — ack/remove a processed notification. */
export function deleteNotification(account: ApiAccount, receiptId: number) {
  return callJson<{ result?: boolean; reason?: string } & Record<string, unknown>>(
    buildUrl(account, "deleteNotification", receiptId),
    { method: "DELETE" },
  );
}
