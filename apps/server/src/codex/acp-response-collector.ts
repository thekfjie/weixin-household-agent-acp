import type { SessionNotification } from "@agentclientprotocol/sdk";
import type { CodexProgressEvent } from "./backend-types.js";

interface AcpResponseCollectorOptions {
  onProgress?: (event: CodexProgressEvent) => void;
}

export class AcpResponseCollector {
  private readonly textChunks: string[] = [];

  private sawThinking = false;

  private sawResponding = false;

  constructor(private readonly options: AcpResponseCollectorOptions = {}) {}

  handleUpdate(notification: SessionNotification): void {
    const update = notification.update;
    switch (update.sessionUpdate) {
      case "agent_thought_chunk":
        if (!this.sawThinking) {
          this.sawThinking = true;
          this.options.onProgress?.({ phase: "thinking" });
        }
        return;
      case "agent_message_chunk":
        if (!this.sawResponding) {
          this.sawResponding = true;
          this.options.onProgress?.({ phase: "responding" });
        }
        if (update.content.type === "text") {
          this.textChunks.push(update.content.text);
        }
        return;
      default:
        return;
    }
  }

  toText(): string {
    return this.textChunks.join("").trim();
  }
}
