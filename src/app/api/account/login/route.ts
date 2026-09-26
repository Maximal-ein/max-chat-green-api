// POST /api/account/login
// Body: { idInstance, apiTokenInstance, apiUrl? }
// Validates credentials via getStateInstance, upserts Account in DB, returns AccountRow.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStateInstance, GreenApiError } from "@/lib/green-api";
import { json, readJsonBody, toAccountRow, toApiAccount } from "@/server-lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LoginBody {
  idInstance?: string;
  apiTokenInstance?: string;
  apiUrl?: string;
}

export async function POST(req: NextRequest) {
  const body = await readJsonBody<LoginBody>(req);
  if (!body) return json({ error: "Invalid JSON body" }, 400);

  const idInstance = (body.idInstance || "").trim();
  const apiTokenInstance = (body.apiTokenInstance || "").trim();
  const apiUrl = (body.apiUrl || "").trim() || null;

  if (!idInstance || !apiTokenInstance) {
    return json(
      { error: "idInstance and apiTokenInstance are required" },
      400,
    );
  }

  // Verify credentials against GREEN-API.
  const account = toApiAccount({ idInstance, apiTokenInstance, apiUrl });
  let state: string | undefined;
  try {
    const result = await getStateInstance(account);
    state =
      typeof result?.stateInstance === "string" ? result.stateInstance : undefined;
  } catch (err) {
    if (err instanceof GreenApiError) {
      // 401/403 → invalid credentials; surface as 401 to the client.
      if (err.status === 401 || err.status === 403 || err.status === 400) {
        return json(
          { error: `GREEN-API: ${err.message || "Неверные учётные данные"}` },
          401,
        );
      }
      // network/5xx → 502
      return json(
        { error: `GREEN-API недоступен: ${err.message}` },
        502,
      );
    }
    return json(
      { error: "Не удалось связаться с GREEN-API. Проверьте сеть и apiUrl." },
      502,
    );
  }

  // Persist account (upsert by idInstance).
  const row = await db.account.upsert({
    where: { idInstance },
    update: {
      apiTokenInstance,
      apiUrl,
      stateInstance: state ?? null,
    },
    create: {
      idInstance,
      apiTokenInstance,
      apiUrl,
      stateInstance: state ?? null,
    },
  });

  return json({ account: toAccountRow({ ...row, apiUrl: row.apiUrl ?? null }) });
}
