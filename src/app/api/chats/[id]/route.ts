// DELETE /api/chats/[id]?accountId=X
// Removes a chat and all of its messages from the DB.

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

  // Only delete the chat if it belongs to the given account.
  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || chat.accountId !== accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  await db.chat.delete({ where: { id } });
  return json({ ok: true });
}
