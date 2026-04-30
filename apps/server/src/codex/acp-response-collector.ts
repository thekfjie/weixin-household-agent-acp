import type { SessionNotification } from "@agentclientprotocol/sdk";

export class AcpResponseCollector {
  private readonly textChunks: string[] = [];

  handleUpdate(notification: SessionNotification): void {
    const update = notification.update;
    if (update.sessionUpdate !== "agent_message_chunk") {
      return;
    }

    const content = update.content;
    if (content.type === "text") {
      this.textChunks.push(content.text);
    }
  }

  toText(): string {
    return this.textChunks.join("").trim();
  }
}
