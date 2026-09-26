// PATCH /api/chats/[id]/mute?accountId=X
// Body: { muted: boolean }
// Toggles the muted flag on a chat (muted chats don't play sound on new msg).

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, readJsonBody } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MuteBody {
  muted?: boolean;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const body = await readJsonBody<MuteBody>(req);
  const muted = Boolean(body?.muted);

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || chat.accountId !== accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  const updated = await db.chat.update({
    where: { id },
    data: { muted },
    select: { id: true, muted: true },
  });

  return json({ ok: true, chat: { id: updated.id, muted: updated.muted } });
}
