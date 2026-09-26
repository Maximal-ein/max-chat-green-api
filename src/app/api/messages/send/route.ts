// POST /api/messages/send
// Body: { accountId, chatId, text }
// Calls GREEN-API sendMessage, persists Message in DB, returns MessageRow.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sendMessage } from "@/lib/green-api";
import {
  getAccountById,
  json,
  readJsonBody,
  toApiAccount,
} from "@/server-lib/helpers";
import type { MessageRow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SendBody {
  accountId?: string;
  chatId?: string; // our DB chat id
  text?: string;
  replyToId?: string | null;
}

export async function POST(req: NextRequest) {
  const body = await readJsonBody<SendBody>(req);
  if (!body?.accountId || !body?.chatId || !body.text) {
    return json({ error: "accountId, chatId and text are required" }, 400);
  }

  const account = await getAccountById(body.accountId);
  if (!account) return json({ error: "Account not found" }, 404);

  const chat = await db.chat.findUnique({ where: { id: body.chatId } });
  if (!chat || chat.accountId !== body.accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  const text = body.text.trim();
  if (!text) return json({ error: "Message text cannot be empty" }, 400);

  const now = Math.floor(Date.now() / 1000);

  // Persist a "pending" message first so the UI updates instantly.
  const pending = await db.message.create({
    data: {
      chatId: chat.id,
      direction: "outgoing",
      text,
      status: "pending",
      timestamp: now,
      replyToId: body.replyToId ?? null,
    },
  });

  let externalId: string | null = null;
  let finalStatus: MessageRow["status"] = "sent";
  let apiError: string | null = null;

  try {
    const result = await sendMessage(toApiAccount(account), chat.chatId, text);
    externalId = typeof result?.idMessage === "string" ? result.idMessage : null;
    if (!externalId) {
      finalStatus = "failed";
      apiError = "GREEN-API did not return idMessage";
    }
  } catch {
    finalStatus = "failed";
    apiError = "Failed to reach GREEN-API";
  }

  const updated = await db.message.update({
    where: { id: pending.id },
    data: { externalId, status: finalStatus },
  }).catch(async (err: unknown) => {
    // P2002: externalId already exists (e.g. mock server restarted and
    // returned a duplicate idMessage). Make externalId null to avoid the
    // unique constraint violation.
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return db.message.update({
        where: { id: pending.id },
        data: { externalId: null, status: finalStatus },
      });
    }
    throw err;
  });

  // Touch chat updatedAt so it bubbles up the sidebar.
  await db.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  const row: MessageRow = {
    id: updated.id,
    chatId: updated.chatId,
    externalId: updated.externalId,
    direction: "outgoing",
    text: updated.text,
    status: updated.status as MessageRow["status"],
    timestamp: updated.timestamp,
    replyToId: updated.replyToId,
    createdAt: updated.createdAt.toISOString(),
  };

  if (apiError) return json({ message: row, error: apiError }, 200);
  return json({ message: row });
}
