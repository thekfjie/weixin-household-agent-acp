import crypto from "node:crypto";
import {
  ILinkMessage,
  ILinkMessageItem,
  ILinkMessageItemType,
  ILinkMessageType,
} from "./protocol.js";

export interface NormalizedInboundWechatMessage {
  wechatAccountId: string;
  contactId: string;
  text: string;
  contextToken: string;
  receivedAt: string;
  sourceMessageId: string;
}

function buildFallbackMessageId(input: string): string {
  return crypto.createHash("sha1").update(input, "utf8").digest("hex");
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractXmlTag(xml: string, tagName: string): string {
  const pattern = new RegExp(`<${tagName}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tagName}>`, "i");
  return decodeXmlText(pattern.exec(xml)?.[1]?.trim() ?? "");
}

function summarizeArticleXml(text: string): string | undefined {
  if (!text.includes("<appmsg") && !text.includes("<url>")) {
    return undefined;
  }

  const title = extractXmlTag(text, "title");
  const url = extractXmlTag(text, "url");
  const description = extractXmlTag(text, "des");
  if (!title && !url) {
    return undefined;
  }

  return [
    "[收到公众号/链接卡片]",
    title ? `标题：${title}` : "",
    description ? `描述：${description}` : "",
    url ? `链接：${url}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function summarizeMessageItem(item: ILinkMessageItem): string {
  switch (item.type) {
    case ILinkMessageItemType.TEXT: {
      const text = item.text_item?.text?.trim() ?? "";
      return summarizeArticleXml(text) ?? text;
    }
    case ILinkMessageItemType.IMAGE:
      return "[收到图片]";
    case ILinkMessageItemType.VOICE:
      return "[收到语音]";
    case ILinkMessageItemType.FILE: {
      const fileName = item.file_item?.file_name?.trim() || "未命名文件";
      const size = item.file_item?.len ? `，大小 ${item.file_item.len} 字节` : "";
      return `[收到文件：${fileName}${size}]`;
    }
    case ILinkMessageItemType.VIDEO:
      return "[收到视频]";
    default:
      return item.type ? `[收到暂不支持的消息类型：${item.type}]` : "";
  }
}

export function normalizeInboundWechatMessages(params: {
  wechatAccountId: string;
  messages: ILinkMessage[];
  receivedAt?: Date;
}): NormalizedInboundWechatMessage[] {
  const receivedAt = (params.receivedAt ?? new Date()).toISOString();
  const normalized: NormalizedInboundWechatMessage[] = [];

  for (const message of params.messages) {
    if (message.message_type !== ILinkMessageType.USER) {
      continue;
    }

    const contactId = message.from_user_id?.trim();
    const contextToken = message.context_token?.trim() ?? "";
    if (!contactId || !contextToken) {
      continue;
    }

    const text = (message.item_list ?? [])
      .map(summarizeMessageItem)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      continue;
    }

    normalized.push({
      wechatAccountId: params.wechatAccountId,
      contactId,
      text,
      contextToken,
      receivedAt,
      sourceMessageId:
        message.client_id?.trim() ||
        buildFallbackMessageId(
          `${params.wechatAccountId}:${contactId}:${contextToken}:${text}`,
        ),
    });
  }

  return normalized;
}
