// GET /api/messages?chatId=X&accountId=Y
// Lists messages for a chat (ordered by timestamp asc).

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/server-lib/helpers";
import type { MessageRow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toMessageRow(m: {
  id: string;
  chatId: string;
  externalId: string | null;
  direction: string;
  text: string;
  status: string;
  timestamp: number;
  replyToId: string | null;
  createdAt: Date;
}): MessageRow {
  return {
    id: m.id,
    chatId: m.chatId,
    externalId: m.externalId,
    direction: m.direction as MessageRow["direction"],
    text: m.text,
    status: m.status as MessageRow["status"],
    timestamp: m.timestamp,
    replyToId: m.replyToId,
    createdAt: m.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get("chatId");
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!chatId || !accountId) {
    return json({ error: "chatId and accountId are required" }, 400);
  }

  // Make sure the chat belongs to the account.
  const chat = await db.chat.findUnique({
    where: { id: chatId },
    select: { accountId: true },
  });
  if (!chat || chat.accountId !== accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  const messages = await db.message.findMany({
    where: { chatId },
    orderBy: { timestamp: "asc" },
    take: 500,
  });

  return json({ messages: messages.map(toMessageRow) });
}
