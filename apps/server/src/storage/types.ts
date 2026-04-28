import { UserRole } from "../config/types.js";

export interface WechatAccountRecord {
  id: string;
  displayName?: string;
  role: UserRole;
  authToken: string;
  uin: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  wechatAccountId: string;
  contactId: string;
  role: UserRole;
  status: string;
  summaryText: string;
  memoryJson: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  sessionId: string;
  direction: "inbound" | "outbound";
  messageType: string;
  textContent?: string;
  filePath?: string;
  createdAt: string;
  sourceMessageId?: string;
}
