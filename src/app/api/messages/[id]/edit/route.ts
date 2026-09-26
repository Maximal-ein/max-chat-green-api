// PATCH /api/messages/[id]/edit?accountId=X
// Body: { text: string }
// Edits the text of an existing outgoing message (local-only feature).

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, readJsonBody } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EditBody {
  text?: string;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const body = await readJsonBody<EditBody>(req);
  const text = (body?.text ?? "").trim();
  if (!text) return json({ error: "text is required" }, 400);
  if (text.length > 20000) return json({ error: "text too long" }, 400);

  const msg = await db.message.findUnique({
    where: { id },
    select: { chat: { select: { accountId: true } }, direction: true },
  });
  if (!msg || msg.chat.accountId !== accountId) {
    return json({ error: "Message not found" }, 404);
  }
  // Only outgoing messages can be edited.
  if (msg.direction !== "outgoing") {
    return json({ error: "Can only edit outgoing messages" }, 403);
  }

  const updated = await db.message.update({
    where: { id },
    data: { text },
    select: { id: true, text: true },
  });

  return json({ ok: true, message: { id: updated.id, text: updated.text } });
}
