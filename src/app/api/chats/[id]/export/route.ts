// GET /api/chats/[id]/export?accountId=X&format=txt|json
// Exports a chat's messages as a downloadable file.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatPhone(phone: string): string {
  if (/^7\d{10}$/.test(phone)) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`;
  }
  return phone ? `+${phone}` : "";
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function fmtDateTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const accountId = req.nextUrl.searchParams.get("accountId");
  const format = (req.nextUrl.searchParams.get("format") || "txt").toLowerCase();

  if (!accountId) {
    return new Response(JSON.stringify({ error: "accountId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || chat.accountId !== accountId) {
    return new Response(JSON.stringify({ error: "Chat not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = await db.message.findMany({
    where: { chatId: id },
    orderBy: { timestamp: "asc" },
  });

  const title = chat.name || formatPhone(chat.phoneNumber);
  // ASCII-only filename for the Content-Disposition header (non-ASCII chars
  // would raise a ByteString error). Cyrillic chars are stripped.
  const asciiName = title.replace(/[^\x20-\x7E]/g, "").replace(/[^\w\-+ ]/g, "_").trim() || "chat";
  // RFC 5987 encoded version for browsers that support UTF-8 filenames.
  const utf8Name = encodeURIComponent(title).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  const disposition = (ext: string) =>
    `attachment; filename="${asciiName}.${ext}"; filename*=UTF-8''${utf8Name}.${ext}`;

  if (format === "json") {
    const body = JSON.stringify(
      {
        chat: {
          id: chat.id,
          name: chat.name,
          phoneNumber: chat.phoneNumber,
          chatId: chat.chatId,
        },
        messages: messages.map((m) => ({
          id: m.id,
          direction: m.direction,
          text: m.text,
          status: m.status,
          timestamp: m.timestamp,
          datetime: fmtDateTime(m.timestamp),
          replyToId: m.replyToId,
        })),
      },
      null,
      2,
    );
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": disposition("json"),
      },
    });
  }

  // txt format
  const lines: string[] = [
    `Чат: ${title}`,
    `Телефон: ${formatPhone(chat.phoneNumber)}`,
    `MAX chatId: ${chat.chatId}`,
    `Сообщений: ${messages.length}`,
    "",
    "",
  ];
  for (const m of messages) {
    const who = m.direction === "outgoing" ? "Вы" : title;
    lines.push(`[${fmtDateTime(m.timestamp)}] ${who}:`);
    lines.push(m.text);
    lines.push("");
  }
  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": disposition("txt"),
    },
  });
}
