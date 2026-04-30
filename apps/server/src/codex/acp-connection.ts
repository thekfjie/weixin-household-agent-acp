import { spawn, ChildProcess } from "node:child_process";
import { Readable, Writable } from "node:stream";
import {
  ClientSideConnection,
  ndJsonStream,
  PROTOCOL_VERSION,
  SessionId,
} from "@agentclientprotocol/sdk";
import { CodexRuntimeConfig } from "../config/types.js";
import { buildChildEnv } from "./run-codex.js";
import { AcpResponseCollector } from "./acp-response-collector.js";

function describeToolCall(update: {
  title?: string | null;
  kind?: string | null;
  toolCallId?: string;
}): string {
  return update.title ?? update.kind ?? update.toolCallId ?? "tool";
}

export class AcpConnection {
  private process: ChildProcess | undefined;

  private connection: ClientSideConnection | undefined;

  private ready = false;

  private readonly collectors = new Map<string, AcpResponseCollector>();

  constructor(
    private readonly config: CodexRuntimeConfig,
    private readonly onExit: () => void,
  ) {}

  registerCollector(sessionId: SessionId, collector: AcpResponseCollector): void {
    this.collectors.set(sessionId, collector);
  }

  unregisterCollector(sessionId: SessionId): void {
    this.collectors.delete(sessionId);
  }

  async ensureReady(): Promise<ClientSideConnection> {
    if (this.ready && this.connection) {
      return this.connection;
    }

    const proc = spawn(this.config.acpCommand, this.config.acpArgs, {
      cwd: this.config.workspace,
      env: buildChildEnv(this.config),
      shell: process.platform === "win32",
      stdio: ["pipe", "pipe", "inherit"],
    });
    this.process = proc;

    const subprocessError = new Promise<never>((_resolve, reject) => {
      proc.once("error", (error) => reject(error));
    });

    proc.once("exit", (code) => {
      console.warn(`[codex:acp] subprocess exited: ${code ?? "unknown"}`);
      this.ready = false;
      this.connection = undefined;
      this.process = undefined;
      this.collectors.clear();
      this.onExit();
    });

    if (!proc.stdin || !proc.stdout) {
      throw new Error("ACP subprocess did not expose stdio pipes");
    }

    const writable = Writable.toWeb(proc.stdin) as WritableStream<Uint8Array>;
    const readable = Readable.toWeb(proc.stdout) as ReadableStream<Uint8Array>;
    const stream = ndJsonStream(writable, readable);

    const conn = new ClientSideConnection((_agent) => ({
      sessionUpdate: async (params) => {
        const update = params.update;
        switch (update.sessionUpdate) {
          case "tool_call":
            console.log(
              `[codex:acp] tool_call: ${describeToolCall(update)} (${update.status ?? "started"})`,
            );
            break;
          case "tool_call_update":
            if (update.status) {
              console.log(
                `[codex:acp] tool_call_update: ${describeToolCall(update)} -> ${update.status}`,
              );
            }
            break;
          case "agent_thought_chunk":
            // Do not forward internal thinking to WeChat.
            break;
        }

        this.collectors.get(params.sessionId)?.handleUpdate(params);
      },
      requestPermission: async (params) => {
        console.warn(
          `[codex:acp] permission request denied: ${describeToolCall(params.toolCall)}`,
        );
        return {
          outcome: {
            outcome: "cancelled",
          },
        };
      },
    }), stream);

    await Promise.race([
      conn.initialize({
        protocolVersion: PROTOCOL_VERSION,
        clientInfo: {
          name: "weixin-household-agent-acp",
          version: "0.1.0",
        },
        clientCapabilities: {},
      }),
      subprocessError,
    ]);

    this.connection = conn;
    this.ready = true;
    return conn;
  }

  dispose(): void {
    this.ready = false;
    this.collectors.clear();
    this.connection = undefined;
    if (this.process) {
      this.process.kill();
      this.process = undefined;
    }
  }
}
