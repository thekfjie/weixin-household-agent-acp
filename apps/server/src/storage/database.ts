import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { UserRole } from "../config/types.js";
import { SQLITE_SCHEMA } from "./schema.js";
import {
  MessageRecord,
  SessionRecord,
  WechatAccountRecord,
} from "./types.js";

function ensureParentDir(target: string): void {
  fs.mkdirSync(path.dirname(target), { recursive: true });
}

function createNow(): string {
  return new Date().toISOString();
}

function toAccountRecord(row: Record<string, unknown>): WechatAccountRecord {
  return {
    id: String(row.id),
    ...(row.display_name ? { displayName: String(row.display_name) } : {}),
    role: String(row.role) as UserRole,
    authToken: String(row.auth_token),
    uin: String(row.uin),
    status: String(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toSessionRecord(row: Record<string, unknown>): SessionRecord {
  return {
    id: String(row.id),
    wechatAccountId: String(row.wechat_account_id),
    contactId: String(row.contact_id),
    role: String(row.role) as UserRole,
    status: String(row.status),
    summaryText: String(row.summary_text),
    memoryJson: String(row.memory_json),
    lastActiveAt: String(row.last_active_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class AppDatabase {
  private readonly db: DatabaseSync;

  constructor(private readonly filePath: string) {
    ensureParentDir(filePath);
    this.db = new DatabaseSync(filePath);
  }

  initialize(): void {
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.db.exec(SQLITE_SCHEMA);
  }

  close(): void {
    this.db.close();
  }

  getFilePath(): string {
    return this.filePath;
  }

  listAccounts(): WechatAccountRecord[] {
    const statement = this.db.prepare(
      "SELECT * FROM wechat_accounts ORDER BY created_at ASC",
    );
    const rows = statement.all() as Record<string, unknown>[];
    return rows.map(toAccountRecord);
  }

  getAccountById(accountId: string): WechatAccountRecord | undefined {
    const statement = this.db.prepare(
      "SELECT * FROM wechat_accounts WHERE id = ?",
    );
    const row = statement.get(accountId) as Record<string, unknown> | undefined;
    return row ? toAccountRecord(row) : undefined;
  }

  saveAccount(input: {
    id: string;
    displayName?: string;
    role: UserRole;
    authToken: string;
    uin: string;
    status?: string;
  }): WechatAccountRecord {
    const now = createNow();
    const existing = this.getAccountById(input.id);

    this.db
      .prepare(
        `
        INSERT INTO wechat_accounts (
          id, display_name, role, auth_token, uin, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          display_name = excluded.display_name,
          role = excluded.role,
          auth_token = excluded.auth_token,
          uin = excluded.uin,
          status = excluded.status,
          updated_at = excluded.updated_at
        `,
      )
      .run(
        input.id,
        input.displayName ?? null,
        input.role,
        input.authToken,
        input.uin,
        input.status ?? "active",
        existing?.createdAt ?? now,
        now,
      );

    const saved = this.getAccountById(input.id);
    if (!saved) {
      throw new Error(`Failed to save account ${input.id}`);
    }

    return saved;
  }

  getPollingCursor(accountId: string): string | undefined {
    const statement = this.db.prepare(
      "SELECT cursor FROM polling_state WHERE wechat_account_id = ?",
    );
    const row = statement.get(accountId) as { cursor?: string } | undefined;
    return row?.cursor;
  }

  savePollingCursor(accountId: string, cursor: string): void {
    this.db
      .prepare(
        `
        INSERT INTO polling_state (wechat_account_id, cursor, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(wechat_account_id) DO UPDATE SET
          cursor = excluded.cursor,
          updated_at = excluded.updated_at
        `,
      )
      .run(accountId, cursor, createNow());
  }

  getSessionByPeer(
    wechatAccountId: string,
    contactId: string,
  ): SessionRecord | undefined {
    const statement = this.db.prepare(
      `
      SELECT * FROM sessions
      WHERE wechat_account_id = ? AND contact_id = ? AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1
      `,
    );
    const row = statement.get(
      wechatAccountId,
      contactId,
    ) as Record<string, unknown> | undefined;
    return row ? toSessionRecord(row) : undefined;
  }

  saveSession(input: {
    id: string;
    wechatAccountId: string;
    contactId: string;
    role: UserRole;
    status?: string;
    summaryText?: string;
    memoryJson?: string;
    lastActiveAt?: string;
  }): SessionRecord {
    const now = createNow();
    const existing = this.db
      .prepare("SELECT created_at FROM sessions WHERE id = ?")
      .get(input.id) as { created_at?: string } | undefined;

    this.db
      .prepare(
        `
        INSERT INTO sessions (
          id, wechat_account_id, contact_id, role, status, summary_text,
          memory_json, last_active_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          role = excluded.role,
          status = excluded.status,
          summary_text = excluded.summary_text,
          memory_json = excluded.memory_json,
          last_active_at = excluded.last_active_at,
          updated_at = excluded.updated_at
        `,
      )
      .run(
        input.id,
        input.wechatAccountId,
        input.contactId,
        input.role,
        input.status ?? "active",
        input.summaryText ?? "",
        input.memoryJson ?? "{}",
        input.lastActiveAt ?? now,
        existing?.created_at ?? now,
        now,
      );

    const saved = this.db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(input.id) as Record<string, unknown> | undefined;
    if (!saved) {
      throw new Error(`Failed to save session ${input.id}`);
    }

    return toSessionRecord(saved);
  }

  appendMessage(input: MessageRecord): void {
    this.db
      .prepare(
        `
        INSERT INTO messages (
          id, session_id, direction, message_type, text_content,
          file_path, created_at, source_message_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        input.id,
        input.sessionId,
        input.direction,
        input.messageType,
        input.textContent ?? null,
        input.filePath ?? null,
        input.createdAt,
        input.sourceMessageId ?? null,
      );
  }
}
