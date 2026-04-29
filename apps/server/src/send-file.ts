import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "./config/index.js";
import { AppDatabase, SessionRecord } from "./storage/index.js";
import { ILinkApiClient } from "./transport/index.js";
import {
  sendUploadedFileMessage,
  uploadLocalMedia,
} from "./transport/ilink/media.js";

interface CliOptions {
  filePath?: string;
  sessionId?: string;
  accountId?: string;
  contactId?: string;
  caption?: string;
  latest: boolean;
  list: boolean;
  limit: number;
}

class CliUsageError extends Error {
  override name = "CliUsageError";
}

function usage(): string {
  return [
    "用法：node dist/apps/server/send-file.js [选项]",
    "",
    "选项：",
    "  --list                 列出最近可发送文件的会话",
    "  --latest               发送给最近活跃会话",
    "  --session ID           发送给指定 session",
    "  --account ID           和 --contact 一起指定目标",
    "  --contact ID           和 --account 一起指定目标",
    "  --file PATH            要发送的本地文件",
    "  --caption TEXT         先发送一段文字说明，再发送文件",
    "  --limit N              --list 显示数量，默认 20",
    "  -h, --help             显示帮助",
  ].join("\n");
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    latest: false,
    list: false,
    limit: 20,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = (): string => {
      const value = argv[++index];
      if (!value) {
        throw new CliUsageError(`${arg} 缺少参数值`);
      }

      return value;
    };

    switch (arg) {
      case "-h":
      case "--help":
        console.log(usage());
        process.exit(0);
        break;
      case "--list":
        options.list = true;
        break;
      case "--latest":
        options.latest = true;
        break;
      case "--file":
        options.filePath = readValue();
        break;
      case "--session":
        options.sessionId = readValue();
        break;
      case "--account":
        options.accountId = readValue();
        break;
      case "--contact":
        options.contactId = readValue();
        break;
      case "--caption":
        options.caption = readValue();
        break;
      case "--limit": {
        const raw = readValue();
        const parsed = Number.parseInt(raw ?? "", 10);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          throw new CliUsageError(`--limit 不是有效正整数：${raw}`);
        }
        options.limit = parsed;
        break;
      }
      default:
        throw new CliUsageError(`未知参数：${arg}`);
    }
  }

  return options;
}

function inferMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  const known: Record<string, string> = {
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".zip": "application/zip",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
  };

  return known[extension] ?? "application/octet-stream";
}

function createClientId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function printSessions(sessions: SessionRecord[]): void {
  if (sessions.length === 0) {
    console.log("当前没有可用会话。请先让目标微信给机器人发一条消息。");
    return;
  }

  for (const session of sessions) {
    console.log(
      [
        `session=${session.id}`,
        `account=${session.wechatAccountId}`,
        `contact=${session.contactId}`,
        `role=${session.role}`,
        `last=${session.lastActiveAt}`,
        `context=${session.contextToken ? "yes" : "no"}`,
      ].join("  "),
    );
  }
}

function resolveTargetSession(
  database: AppDatabase,
  options: CliOptions,
): SessionRecord {
  if (options.sessionId) {
    const session = database.getSessionById(options.sessionId);
    if (!session) {
      throw new Error(`session 不存在：${options.sessionId}`);
    }

    return session;
  }

  if (options.accountId && options.contactId) {
    const session = database.getSessionByPeer(options.accountId, options.contactId);
    if (!session) {
      throw new Error(
        `找不到 account/contact 对应的活跃会话：${options.accountId} ${options.contactId}`,
      );
    }

    return session;
  }

  if (options.latest) {
    const [session] = database.listRecentSessions(1);
    if (!session) {
      throw new Error("当前没有活跃会话。请先让目标微信给机器人发一条消息。");
    }

    return session;
  }

  throw new CliUsageError(
    "请用 --latest、--session，或 --account + --contact 指定目标。",
  );
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const dbPath = path.join(
    config.server.dataDir,
    "weixin-household-agent-acp.sqlite",
  );
  const database = new AppDatabase(dbPath);
  database.initialize();

  try {
    if (options.list) {
      printSessions(database.listRecentSessions(options.limit));
      return;
    }

    if (!options.filePath) {
      throw new CliUsageError("缺少 --file PATH");
    }

    const filePath = path.resolve(options.filePath);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      throw new Error(`不是普通文件：${filePath}`);
    }

    const session = resolveTargetSession(database, options);
    if (!session.contextToken.trim()) {
      throw new Error("目标会话缺少 context_token。请先让目标微信再发一条消息。");
    }

    const account = database.getAccountById(session.wechatAccountId);
    if (!account || account.status !== "active") {
      throw new Error(`账号不可用：${session.wechatAccountId}`);
    }

    const attachmentId = createClientId("attachment");
    database.saveAttachment({
      id: attachmentId,
      sessionId: session.id,
      localPath: filePath,
      mimeType: inferMimeType(filePath),
      fileName: path.basename(filePath),
      sizeBytes: stat.size,
      outboundStatus: "uploading",
    });

    const client = new ILinkApiClient({
      baseUrl: account.baseUrl ?? config.wechat.apiBaseUrl,
      cdnBaseUrl: config.wechat.cdnBaseUrl,
      channelVersion: config.wechat.channelVersion,
      ...(config.wechat.routeTag ? { routeTag: config.wechat.routeTag } : {}),
      token: account.authToken,
    });

    try {
      const uploaded = await uploadLocalMedia({
        client,
        filePath,
        toUserId: session.contactId,
      });
      const clientId = await sendUploadedFileMessage({
        client,
        toUserId: session.contactId,
        contextToken: session.contextToken,
        uploaded,
        ...(options.caption ? { caption: options.caption } : {}),
      });

      database.updateAttachmentStatus(attachmentId, "sent");
      database.appendMessage({
        id: createClientId("outbound-file"),
        sessionId: session.id,
        direction: "outbound",
        messageType: "file",
        filePath,
        createdAt: new Date().toISOString(),
        sourceMessageId: clientId,
      });

      console.log("文件已发送。");
      console.log(`session=${session.id}`);
      console.log(`account=${session.wechatAccountId}`);
      console.log(`contact=${session.contactId}`);
      console.log(`file=${filePath}`);
      console.log(`size=${stat.size}`);
      console.log(`md5=${uploaded.plaintextMd5}`);
    } catch (error) {
      database.updateAttachmentStatus(attachmentId, "failed");
      throw error;
    }
  } finally {
    database.close();
  }
}

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  if (error instanceof CliUsageError) {
    console.error("");
    console.error(usage());
  }
  process.exit(1);
});
