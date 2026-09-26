// POST /api/notifications/poll
// Body: { accountId, receiveTimeout?: number }
// Calls GREEN-API receiveNotification. If a notification comes back:
//   - incomingMessageReceived / outgoingMessageReceived (textMessage):
//     persist message to DB (if not already present by externalId).
//   - outgoingMessageStatus: update message status by externalId.
//   - Typing notifications (mock-only isTyping flag): resolve chat id.
//   - Auto-deletes the notification via deleteNotification.

import { NextRequest } from "next/server";
import {
  deleteNotification,
  receiveNotification,
} from "@/lib/green-api";
import {
  getAccountById,
  json,
  readJsonBody,
  toApiAccount,
} from "@/server-lib/helpers";
import {
  handleIncomingOrOutgoing,
  handleStatusUpdate,
  handleTyping,
} from "@/server-lib/notifications/handlers";
import type {
  GreenApiNotification,
  GreenApiNotificationBody,
  MessageRow,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PollBody {
  accountId?: string;
  receiveTimeout?: number;
}

export async function POST(req: NextRequest) {
  const body = await readJsonBody<PollBody>(req);
  if (!body?.accountId) {
    return json({ error: "accountId is required" }, 400);
  }

  const account = await getAccountById(body.accountId);
  if (!account) return json({ error: "Account not found" }, 404);

  const timeout = Math.min(60, Math.max(5, body.receiveTimeout ?? 5));

  let notification: GreenApiNotification | null = null;
  try {
    notification = (await receiveNotification(
      toApiAccount(account),
      timeout,
    )) as GreenApiNotification | null;
  } catch {
    return json({ error: "Failed to reach GREEN-API" }, 502);
  }

  if (!notification || !notification.receiptId || !notification.body) {
    return json({ notification: null });
  }

  const webhookBody = notification.body as GreenApiNotificationBody;
  let savedMessage: MessageRow | null = null;
  let statusUpdate: {
    chatId: string;
    messageId: string;
    status: MessageRow["status"];
  } | null = null;
  let typingUpdate: { chatId: string; isTyping: boolean } | null = null;

  if (webhookBody.isTyping) {
    typingUpdate = await handleTyping(webhookBody);
  } else {
    switch (webhookBody.typeWebhook) {
      case "incomingMessageReceived":
        savedMessage = await handleIncomingOrOutgoing(webhookBody, "incoming");
        break;
      case "outgoingMessageReceived":
      case "outgoingAPIMessageReceived":
        savedMessage = await handleIncomingOrOutgoing(webhookBody, "outgoing");
        break;
      case "outgoingMessageStatus":
        statusUpdate = await handleStatusUpdate(webhookBody);
        break;
      default:
        // ignore other webhook types (calls, reactions, status updates, etc.)
        break;
    }
  }

  // Always delete the notification so the queue doesn't grow.
  try {
    await deleteNotification(toApiAccount(account), notification.receiptId);
  } catch {
    // ignore delete failure; we'll get it next poll
  }

  return json({
    notification: webhookBody,
    savedMessage,
    statusUpdate,
    typingUpdate,
    chatId: webhookBody.senderData?.chatId ?? null,
  });
}
