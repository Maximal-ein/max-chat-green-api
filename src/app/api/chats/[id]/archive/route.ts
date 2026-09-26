// PATCH /api/chats/[id]/archive?accountId=X
// Body: { archived: boolean }
// Toggles the archived flag on a chat (archived chats are hidden from sidebar).

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, readJsonBody } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ArchiveBody {
  archived?: boolean;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const body = await readJsonBody<ArchiveBody>(req);
  const archived = Boolean(body?.archived);

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || chat.accountId !== accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  const updated = await db.chat.update({
    where: { id },
    data: { archived },
    select: { id: true, archived: true },
  });

  return json({ ok: true, chat: { id: updated.id, archived: updated.archived } });
}
