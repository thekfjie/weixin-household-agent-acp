import crypto from "node:crypto";
import { UserRole } from "../config/types.js";
import { AppDatabase, SessionRecord } from "../storage/index.js";

function nowIso(): string {
  return new Date().toISOString();
}

export function buildSessionId(
  wechatAccountId: string,
  contactId: string,
): string {
  return crypto
    .createHash("sha1")
    .update(`${wechatAccountId}:${contactId}`, "utf8")
    .digest("hex");
}

export interface SessionRotationDecision {
  shouldRotate: boolean;
  reason: string;
}

export function shouldRotateSession(params: {
  lastActiveAt: string;
  now?: Date;
  maxIdleHours?: number;
}): SessionRotationDecision {
  const maxIdleHours = params.maxIdleHours ?? 12;
  const now = params.now ?? new Date();
  const lastActiveAt = new Date(params.lastActiveAt);
  const idleMs = now.getTime() - lastActiveAt.getTime();
  const idleHours = idleMs / (60 * 60 * 1000);

  if (Number.isNaN(lastActiveAt.getTime())) {
    return {
      shouldRotate: true,
      reason: "invalid last_active_at timestamp",
    };
  }

  if (idleHours >= maxIdleHours) {
    return {
      shouldRotate: true,
      reason: `idle for ${idleHours.toFixed(1)} hours`,
    };
  }

  return {
    shouldRotate: false,
    reason: "session is still warm",
  };
}

export function ensureActiveSession(params: {
  database: AppDatabase;
  wechatAccountId: string;
  contactId: string;
  role: UserRole;
}): SessionRecord {
  const existing = params.database.getSessionByPeer(
    params.wechatAccountId,
    params.contactId,
  );

  if (existing) {
    return params.database.saveSession({
      id: existing.id,
      wechatAccountId: existing.wechatAccountId,
      contactId: existing.contactId,
      role: existing.role,
      status: existing.status,
      summaryText: existing.summaryText,
      memoryJson: existing.memoryJson,
      lastActiveAt: nowIso(),
    });
  }

  const sessionId = buildSessionId(
    params.wechatAccountId,
    params.contactId,
  );

  return params.database.saveSession({
    id: sessionId,
    wechatAccountId: params.wechatAccountId,
    contactId: params.contactId,
    role: params.role,
    lastActiveAt: nowIso(),
  });
}
