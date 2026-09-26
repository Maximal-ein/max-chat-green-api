// DELETE /api/messages/[id]?accountId=X
// Deletes a single message from the DB (local-only feature; does NOT call
// GREEN-API's deleteMessage endpoint, which would delete it for both sides).

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  // Verify the message belongs to a chat owned by this account.
  const msg = await db.message.findUnique({
    where: { id },
    select: { chat: { select: { accountId: true } } },
  });
  if (!msg || msg.chat.accountId !== accountId) {
    return json({ error: "Message not found" }, 404);
  }

  await db.message.delete({ where: { id } });
  return json({ ok: true });
}
