// POST /api/account/logout
// Body: { accountId }
// Deletes the account (and cascades chats & messages) from DB.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, readJsonBody } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LogoutBody {
  accountId?: string;
}

export async function POST(req: NextRequest) {
  const body = await readJsonBody<LogoutBody>(req);
  if (!body?.accountId) {
    return json({ error: "accountId is required" }, 400);
  }

  try {
    await db.account.delete({ where: { id: body.accountId } });
  } catch {
    // ignore not-found
  }

  return json({ ok: true });
}
