// PATCH /api/chats/[id]/read?accountId=X
// Marks all messages in the chat as "read" (locally) — used to clear the
// unread badge after the user opens the chat. Returns the new unread count.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || chat.accountId !== accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  // Update lastOpenedAt to "now" so future unread counts are 0 until a new
  // incoming message arrives.
  await db.chat.update({
    where: { id },
    data: { lastOpenedAt: new Date() },
  });

  return json({ ok: true, unreadCount: 0 });
}
