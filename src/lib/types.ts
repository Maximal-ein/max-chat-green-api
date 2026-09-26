// Shared TypeScript types for the MAX chat application.

/** GREEN-API credentials entered by the user in the login screen. */
export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
  /** apiUrl from GREEN-API cabinet; defaults to https://api.green-api.com */
  apiUrl?: string;
}

/** Possible values returned by getStateInstance. */
export type InstanceState =
  | "authorized"
  | "notAuthorized"
  | "starting"
  | "sleepMode"
  | "offline"
  | "queueBlocked"
  | "blocked";

/** Persisted account row (mirrors Prisma Account model minus relations). */
export interface AccountRow {
  id: string;
  idInstance: string;
  apiTokenInstance: string;
  label?: string | null;
  stateInstance?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A chat in the sidebar list. */
export interface ChatRow {
  id: string;
  chatId: string;
  phoneNumber: string;
  name?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: number | null;
  unreadCount: number;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
  updatedAt: string;
}

/** Direction of a message. */
export type MessageDirection = "outgoing" | "incoming";

/** Delivery status for outgoing messages. */
export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

/** A single message in a chat. */
export interface MessageRow {
  id: string;
  chatId: string;
  externalId?: string | null;
  direction: MessageDirection;
  text: string;
  status: MessageStatus;
  timestamp: number;
  /** Optional reference to a message being replied to (local-only feature). */
  replyToId?: string | null;
  createdAt: string;
}

/** Body returned by GREEN-API receiveNotification body.messageData. */
export interface GreenApiMessageData {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  // other message types are ignored per assignment (text only)
}

/** Body returned by GREEN-API receiveNotification body.senderData. */
export interface GreenApiSenderData {
  chatId: string;
  sender: string;
  senderName?: string;
  senderContactName?: string;
}

/** Full notification body shape (subset we care about). */
export interface GreenApiNotificationBody {
  typeWebhook: string;
  instanceData?: { idInstance: number; wid: string; typeInstance?: string };
  timestamp?: number;
  idMessage?: string;
  senderData?: GreenApiSenderData;
  messageData?: GreenApiMessageData;
  // Outgoing message status fields
  status?: string;
  // For outgoingMessageStatus webhooks
  idMessage?: string;
  // status message details
  statusMessage?: string;
  /** Mock-only extension: signals "user is typing" (not part of real GREEN-API). */
  isTyping?: boolean;
}

/** Top-level receiveNotification response. */
export interface GreenApiNotification {
  receiptId: number;
  body: GreenApiNotificationBody;
}
