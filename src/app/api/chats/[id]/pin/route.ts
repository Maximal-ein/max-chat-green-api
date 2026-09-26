// PATCH /api/chats/[id]/pin?accountId=X
// Body: { pinned: boolean }
// Toggles the pinned flag on a chat (pinned chats appear at top of sidebar).

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, readJsonBody } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PinBody {
  pinned?: boolean;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const body = await readJsonBody<PinBody>(req);
  const pinned = Boolean(body?.pinned);

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || chat.accountId !== accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  const updated = await db.chat.update({
    where: { id },
    data: { pinned },
    select: { id: true, pinned: true },
  });

  return json({ ok: true, chat: { id: updated.id, pinned: updated.pinned } });
}
