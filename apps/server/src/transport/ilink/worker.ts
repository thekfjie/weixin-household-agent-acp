import crypto from "node:crypto";
import { AppConfig, UserRole } from "../../config/types.js";
import { parseBuiltInCommand } from "../../commands/index.js";
import { filterFamilyOutput } from "../../policy/index.js";
import { resolveRole } from "../../router/index.js";
import { ensureActiveSession, formatBeijingTime } from "../../sessions/index.js";
import {
  AppDatabase,
  SessionRecord,
  WechatAccountRecord,
} from "../../storage/index.js";
import { sendTextMessage } from "./media.js";
import { ILinkApiClient } from "./api-client.js";
import { normalizeInboundWechatMessages } from "./inbound.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMessageId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function buildCommandReply(params: {
  command: string;
  session: SessionRecord;
  database: AppDatabase;
  role: UserRole;
}): string {
  switch (params.command) {
    case "/time":
      return `现在是北京时间 ${formatBeijingTime(new Date())}。`;
    case "/summary":
      return params.session.summaryText.trim()
        ? `当前摘要：${params.session.summaryText}`
        : "当前还没有保存摘要。";
    case "/recent": {
      const recent = params.database
        .listSessionMessages(params.session.id, 6)
        .reverse()
        .map((message) => {
          const speaker = message.direction === "inbound" ? "用户" : "助手";
          const text = message.textContent?.trim() || "[非文本消息]";
          return `${speaker}：${text}`;
        });
      return recent.length > 0
        ? `最近消息：\n${recent.join("\n")}`
        : "当前会话里还没有最近消息。";
    }
    case "/new":
    case "/reset":
      params.database.saveSession({
        id: params.session.id,
        wechatAccountId: params.session.wechatAccountId,
        contactId: params.session.contactId,
        role: params.role,
        status: "active",
        summaryText: "",
        memoryJson: "{}",
        contextToken: params.session.contextToken,
        lastActiveAt: new Date().toISOString(),
      });
      return "当前对话上下文已经重置，我们可以重新开始。";
    default:
      return "暂不支持这个内建命令。";
  }
}

function buildFallbackReply(params: {
  text: string;
  role: UserRole;
}): string {
  if (params.role === "admin") {
    return [
      "消息已经收到。",
      "当前微信登录、账号管理和长轮询链路已接通，Codex 自动执行链路正在继续接入。",
      `你刚才发的是：${params.text}`,
    ].join("\n");
  }

  return [
    "我收到啦。",
    "现在微信侧登录和消息链路已经连上，助手主回复能力正在继续接入中。",
    `你刚才发的是：${params.text}`,
  ].join("\n");
}

export interface WechatWorkerOptions {
  config: AppConfig;
  database: AppDatabase;
}

export class WechatWorker {
  private running = false;

  private loopPromise: Promise<void> | undefined;

  constructor(private readonly options: WechatWorkerOptions) {}

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.loopPromise = this.runLoop();
  }

  async stop(): Promise<void> {
    this.running = false;
    await this.loopPromise;
  }

  private async runLoop(): Promise<void> {
    while (this.running) {
      const accounts = this.options.database
        .listAccounts()
        .filter((account) => account.status === "active");

      if (accounts.length === 0) {
        await sleep(2_000);
        continue;
      }

      for (const account of accounts) {
        if (!this.running) {
          return;
        }

        try {
          await this.pollAccount(account);
        } catch (error) {
          console.error(`[worker] failed to poll ${account.id}`, error);
          await sleep(1_000);
        }
      }
    }
  }

  private async pollAccount(account: WechatAccountRecord): Promise<void> {
    const client = new ILinkApiClient({
      baseUrl: account.baseUrl ?? this.options.config.wechat.apiBaseUrl,
      cdnBaseUrl: this.options.config.wechat.cdnBaseUrl,
      channelVersion: this.options.config.wechat.channelVersion,
      ...(this.options.config.wechat.routeTag
        ? { routeTag: this.options.config.wechat.routeTag }
        : {}),
      token: account.authToken,
    });

    const cursor = this.options.database.getPollingCursor(account.id) ?? "";
    const response = await client.getUpdates(cursor);

    if (response.get_updates_buf) {
      this.options.database.savePollingCursor(
        account.id,
        response.get_updates_buf,
      );
    }

    const inboundMessages = normalizeInboundWechatMessages({
      wechatAccountId: account.id,
      messages: response.msgs ?? [],
    });

    for (const inbound of inboundMessages) {
      await this.handleInboundMessage(account, client, inbound);
    }
  }

  private async handleInboundMessage(
    account: WechatAccountRecord,
    client: ILinkApiClient,
    inbound: ReturnType<typeof normalizeInboundWechatMessages>[number],
  ): Promise<void> {
    const route = resolveRole({ configuredRole: account.role });
    const session = ensureActiveSession({
      database: this.options.database,
      wechatAccountId: inbound.wechatAccountId,
      contactId: inbound.contactId,
      role: route.role,
    });

    const activeSession = this.options.database.saveSession({
      id: session.id,
      wechatAccountId: session.wechatAccountId,
      contactId: session.contactId,
      role: route.role,
      status: session.status,
      summaryText: session.summaryText,
      memoryJson: session.memoryJson,
      contextToken: inbound.contextToken,
      lastActiveAt: inbound.receivedAt,
    });

    this.options.database.appendMessage({
      id: buildMessageId("inbound"),
      sessionId: activeSession.id,
      direction: "inbound",
      messageType: "text",
      textContent: inbound.text,
      createdAt: inbound.receivedAt,
      sourceMessageId: inbound.sourceMessageId,
    });

    const parsedCommand = parseBuiltInCommand(inbound.text);
    const rawReply = parsedCommand
      ? buildCommandReply({
          command: parsedCommand.name,
          session: activeSession,
          database: this.options.database,
          role: route.role,
        })
      : buildFallbackReply({
          text: inbound.text,
          role: route.role,
        });

    const replyText =
      route.role === "family"
        ? filterFamilyOutput(rawReply, this.options.config.familyPolicy)
        : rawReply;

    if (!replyText.trim()) {
      return;
    }

    await sendTextMessage({
      client,
      toUserId: inbound.contactId,
      contextToken: inbound.contextToken,
      text: replyText,
    });

    this.options.database.appendMessage({
      id: buildMessageId("outbound"),
      sessionId: activeSession.id,
      direction: "outbound",
      messageType: "text",
      textContent: replyText,
      createdAt: new Date().toISOString(),
      sourceMessageId: inbound.sourceMessageId,
    });
  }
}
