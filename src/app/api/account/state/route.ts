// GET /api/account/state?accountId=...
// Calls getStateInstance, updates stateInstance in DB, returns { stateInstance }.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStateInstance } from "@/lib/green-api";
import {
  getAccountById,
  json,
  toApiAccount,
} from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const account = await getAccountById(accountId);
  if (!account) return json({ error: "Account not found" }, 404);

  try {
    const result = await getStateInstance(toApiAccount(account));
    const state =
      typeof result?.stateInstance === "string" ? result.stateInstance : null;
    await db.account.update({
      where: { id: account.id },
      data: { stateInstance: state },
    });
    return json({ stateInstance: state });
  } catch {
    return json({ error: "Failed to reach GREEN-API" }, 502);
  }
}
