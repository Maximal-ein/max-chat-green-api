// Mock GREEN-API server for end-to-end testing of the receive/send flow.
// Listens on port 3040. Returns canned responses for the methods our app uses.

import { createServer, IncomingMessage, ServerResponse } from "node:http";

const PORT = 3040;
const HOST = "127.0.0.1";

let pendingNotifications: Array<{ receiptId: number; body: unknown }> = [];
let nextReceiptId = 1;
let messageIdCounter = 1;

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(json);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, {});
    return;
  }
  const url = req.url || "";
  console.log(`[${new Date().toISOString()}] ${req.method} ${url}`);

  // getStateInstance
  if (url.includes("/getStateInstance/")) {
    sendJson(res, 200, { stateInstance: "authorized" });
    return;
  }
  // checkAccount
  if (url.includes("/checkAccount/")) {
    const body = JSON.parse((await readBody(req)) || "{}");
    // Generate a deterministic chatId from the phone number.
    const chatId = String(10000000 + (Number(body.phoneNumber) % 90000000));
    sendJson(res, 200, { exist: true, chatId, fromCache: true });
    return;
  }
  // sendMessage
  if (url.includes("/sendMessage/")) {
    const body = JSON.parse((await readBody(req)) || "{}");
    const idMessage = `MOCK_MSG_${messageIdCounter++}`;
    console.log("  → sendMessage chatId=", body.chatId, "text=", body.message);
    const replyText = `AUTO-REPLY to: "${String(body.message).slice(0, 40)}"`;
    // 1) Send a "typing" notification 800ms after sendMessage.
    setTimeout(() => {
      pendingNotifications.push({
        receiptId: nextReceiptId++,
        body: {
          typeWebhook: "incomingMessageReceived",
          instanceData: { idInstance: 123, wid: "mock@c.us", typeInstance: "max" },
          timestamp: Math.floor(Date.now() / 1000),
          idMessage: `MOCK_TYPING_${nextReceiptId}`,
          senderData: {
            chatId: body.chatId,
            sender: body.chatId,
            senderName: "Auto Reply",
          },
          messageData: {
            typeMessage: "textMessage",
            textMessageData: { textMessage: "" },
          },
          // Custom extension: signals the client to show a typing indicator.
          // Real GREEN-API uses a separate webhook type for typing; we simulate
          // it here so the UI can exercise the typing-bubble feature.
          isTyping: true,
        },
      });
      console.log("  → queued typing notification");
    }, 800);
    // 2) Send the actual auto-reply after 2.2 seconds.
    setTimeout(() => {
      pendingNotifications.push({
        receiptId: nextReceiptId++,
        body: {
          typeWebhook: "incomingMessageReceived",
          instanceData: { idInstance: 123, wid: "mock@c.us", typeInstance: "max" },
          timestamp: Math.floor(Date.now() / 1000),
          idMessage: `MOCK_INCOMING_${nextReceiptId}`,
          senderData: {
            chatId: body.chatId,
            sender: body.chatId,
            senderName: "Auto Reply",
          },
          messageData: {
            typeMessage: "textMessage",
            textMessageData: { textMessage: replyText },
          },
        },
      });
      console.log("  → queued auto-reply notification");
    }, 2200);
    sendJson(res, 200, { idMessage });
    return;
  }
  // receiveNotification (long poll)
  if (url.includes("/receiveNotification/")) {
    // If there's a pending notification, return it immediately.
    if (pendingNotifications.length > 0) {
      const notif = pendingNotifications.shift()!;
      console.log("  → returning notification receiptId=", notif.receiptId);
      sendJson(res, 200, notif);
      return;
    }
    // Otherwise wait up to receiveTimeout seconds for one to arrive.
    const timeoutMatch = url.match(/receiveTimeout=(\d+)/);
    const timeoutSec = timeoutMatch ? Number(timeoutMatch[1]) : 5;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      if (pendingNotifications.length > 0) {
        const notif = pendingNotifications.shift()!;
        clearInterval(interval);
        console.log("  → returning notification receiptId=", notif.receiptId);
        sendJson(res, 200, notif);
      } else if (Date.now() - startedAt > timeoutSec * 1000) {
        clearInterval(interval);
        console.log("  → no notification, returning null");
        sendJson(res, 200, null);
      }
    }, 200);
    return;
  }
  // deleteNotification
  if (url.includes("/deleteNotification/")) {
    const receiptId = Number(url.split("/").pop());
    console.log("  → deleting notification receiptId=", receiptId);
    sendJson(res, 200, { result: true, reason: "" });
    return;
  }
  // unknown route
  sendJson(res, 404, { error: "Not found", url });
});

server.listen(PORT, HOST, () => {
  console.log(`[green-api-mock] listening on http://${HOST}:${PORT}`);
});
