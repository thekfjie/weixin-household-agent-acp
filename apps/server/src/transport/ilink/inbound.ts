import crypto from "node:crypto";
import {
  ILinkMessage,
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
      .filter((item) => item.type === ILinkMessageItemType.TEXT)
      .map((item) => item.text_item?.text?.trim() ?? "")
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
