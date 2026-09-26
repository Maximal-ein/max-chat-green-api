// Handlers for individual GREEN-API notification webhooks.
// Extracted from /api/notifications/poll/route.ts to keep that file ≤200 lines.

import { db } from "@/lib/db";
import type {
  GreenApiNotificationBody,
  MessageRow,
} from "@/lib/types";

export function extractText(body: GreenApiNotificationBody): string | null {
  if (body.messageData?.typeMessage !== "textMessage") return null;
  return body.messageData.textMessageData?.textMessage ?? null;
}

export function mapStatus(s: string | undefined): MessageRow["status"] | null {
  switch (s) {
    case "pending":
    case "queued":
      return "pending";
    case "sent":
    case "delivered":
    case "read":
      return s as MessageRow["status"];
    default:
      return null;
  }
}

/** Persist an incoming/outgoing text message to the DB. Returns the new row. */
export async function handleIncomingOrOutgoing(
  body: GreenApiNotificationBody,
  direction: "incoming" | "outgoing",
): Promise<MessageRow | null> {
  const text = extractText(body);
  if (!text || !body.senderData?.chatId) return null;

  const chat = await db.chat.findFirst({
    where: { chatId: body.senderData.chatId },
  });
  if (!chat) return null;

  const externalId = body.idMessage ?? null;
  if (externalId) {
    const existing = await db.message.findUnique({ where: { externalId } });
    if (existing) return null;
  }

  if (direction === "incoming" && body.senderData.senderName && !chat.name) {
    await db.chat.update({
      where: { id: chat.id },
      data: { name: body.senderData.senderName, updatedAt: new Date() },
    });
  }

  const created = await db.message.create({
    data: {
      chatId: chat.id,
      externalId,
      direction,
      text,
      status: "sent",
      timestamp: body.timestamp ?? Math.floor(Date.now() / 1000),
    },
  });

  await db.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  return {
    id: created.id,
    chatId: created.chatId,
    externalId: created.externalId,
    direction: created.direction as MessageRow["direction"],
    text: created.text,
    status: created.status as MessageRow["status"],
    timestamp: created.timestamp,
    replyToId: created.replyToId,
    createdAt: created.createdAt.toISOString(),
  };
}

/** Update an outgoing message's status by externalId. */
export async function handleStatusUpdate(
  body: GreenApiNotificationBody,
): Promise<{
  chatId: string;
  messageId: string;
  status: MessageRow["status"];
} | null> {
  const externalId = body.idMessage ?? null;
  if (!externalId) return null;
  const status = mapStatus(body.status);
  if (!status) return null;

  const msg = await db.message.findUnique({ where: { externalId } });
  if (!msg) return null;

  const updated = await db.message.update({
    where: { id: msg.id },
    data: { status },
  });
  return {
    chatId: updated.chatId,
    messageId: updated.id,
    status: updated.status as MessageRow["status"],
  };
}

/**
 * Resolve a typing notification to the local chat DB id (so the client can
 * toggle its typing indicator). Returns null when the chat isn't tracked.
 */
export async function handleTyping(
  body: GreenApiNotificationBody,
): Promise<{ chatId: string; isTyping: boolean } | null> {
  if (!body.isTyping || !body.senderData?.chatId) return null;
  const chat = await db.chat.findFirst({
    where: { chatId: body.senderData.chatId },
    select: { id: true },
  });
  if (!chat) return null;
  return { chatId: chat.id, isTyping: true };
}
