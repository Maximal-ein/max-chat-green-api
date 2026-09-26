// /api/chats
// GET  /api/chats?accountId=X            — list chats for the account (ordered by lastMessageAt desc)
// POST /api/chats { accountId, phoneNumber, name? } — calls checkAccount, upserts Chat, returns ChatRow

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { checkAccount, GreenApiError } from "@/lib/green-api";
import {
  getAccountById,
  json,
  readJsonBody,
  toApiAccount,
} from "@/server-lib/helpers";
import type { ChatRow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatWithMessages {
  id: string;
  chatId: string;
  phoneNumber: string;
  name: string | null;
  lastOpenedAt: Date;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  updatedAt: Date;
  messages: { text: string; timestamp: number; direction: string }[];
}

function toChatRow(c: ChatWithMessages): ChatRow {
  const last = c.messages.length ? c.messages[c.messages.length - 1] : null;
  const lastOpenedSec = Math.floor(c.lastOpenedAt.getTime() / 1000);
  const unreadCount = c.messages.filter(
    (m) => m.direction === "incoming" && m.timestamp > lastOpenedSec,
  ).length;
  return {
    id: c.id,
    chatId: c.chatId,
    phoneNumber: c.phoneNumber,
    name: c.name,
    lastMessageText: last?.text ?? null,
    lastMessageAt: last?.timestamp ?? null,
    unreadCount,
    pinned: c.pinned,
    muted: c.muted,
    archived: c.archived,
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return json({ error: "accountId is required" }, 400);

  const includeArchived = req.nextUrl.searchParams.get("includeArchived") === "true";
  const where: { accountId: string; archived?: boolean } = { accountId };
  if (!includeArchived) where.archived = false;

  const chats = (await db.chat.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { timestamp: "asc" },
        select: { text: true, timestamp: true, direction: true },
      },
    },
    take: 200,
  })) as unknown as ChatWithMessages[];

  return json({ chats: chats.map(toChatRow) });
}

interface CreateBody {
  accountId?: string;
  phoneNumber?: string | number;
  name?: string;
}

export async function POST(req: NextRequest) {
  const body = await readJsonBody<CreateBody>(req);
  if (!body?.accountId) return json({ error: "accountId is required" }, 400);

  const phoneRaw = String(body.phoneNumber ?? "").replace(/\D/g, "");
  if (!phoneRaw) return json({ error: "phoneNumber is required" }, 400);

  const account = await getAccountById(body.accountId);
  if (!account) return json({ error: "Account not found" }, 404);

  // Check if a chat for this phone number already exists for this account.
  const existing = (await db.chat.findFirst({
    where: { accountId: account.id, phoneNumber: phoneRaw },
    include: {
      messages: {
        orderBy: { timestamp: "asc" },
        select: { text: true, timestamp: true, direction: true },
      },
    },
  })) as unknown as ChatWithMessages | null;
  if (existing) {
    return json({ chat: toChatRow(existing) });
  }

  // Resolve MAX chatId via checkAccount.
  let chatId = "";
  try {
    const result = await checkAccount(toApiAccount(account), phoneRaw);
    chatId = result?.chatId ?? "";
  } catch (err) {
    const msg =
      err instanceof GreenApiError
        ? `GREEN-API: ${err.message}`
        : "Не удалось проверить получателя через GREEN-API";
    return json({ error: msg }, 502);
  }

  if (!chatId) {
    return json(
      {
        error:
          "У получателя нет аккаунта MAX. Попросите его установить MAX и зарегистрироваться.",
      },
      422,
    );
  }

  const chat = await db.chat.create({
    data: {
      accountId: account.id,
      chatId,
      phoneNumber: phoneRaw,
      name: body.name?.trim() || null,
    },
  });

  return json({
    chat: toChatRow({ ...chat, messages: [] }),
  });
}
