// PATCH /api/chats/[id]/rename?accountId=X
// Body: { name: string | null }
// Updates the custom display name of a chat. Pass null to clear (revert to phone).

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, readJsonBody } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RenameBody {
  name?: string | null;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const body = await readJsonBody<RenameBody>(req);
  const rawName = (body?.name ?? "").trim();
  // Allow null to clear the name, otherwise store the trimmed value.
  const name = rawName.length > 0 ? rawName.slice(0, 100) : null;

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || chat.accountId !== accountId) {
    return json({ error: "Chat not found" }, 404);
  }

  const updated = await db.chat.update({
    where: { id },
    data: { name },
    select: { id: true, name: true },
  });

  return json({ ok: true, chat: { id: updated.id, name: updated.name } });
}
