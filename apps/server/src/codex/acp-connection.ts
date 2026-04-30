import { spawn, ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable, Writable } from "node:stream";
import {
  ClientSideConnection,
  ndJsonStream,
  PROTOCOL_VERSION,
  SessionId,
  type AuthMethod,
  type AuthMethodEnvVar,
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

function defaultHome(): string | undefined {
  const home = os.homedir();
  if (home && home !== ".") {
    return home;
  }

  return process.env.HOME ?? process.env.USERPROFILE;
}

function readCodexAuthJson(env: NodeJS.ProcessEnv): Record<string, string> {
  const codexHome =
    env.CODEX_HOME ??
    (env.HOME ? path.join(env.HOME, ".codex") : undefined) ??
    (env.USERPROFILE ? path.join(env.USERPROFILE, ".codex") : undefined);

  if (!codexHome) {
    return {};
  }

  const authPath = path.join(codexHome, "auth.json");
  try {
    const parsed = JSON.parse(fs.readFileSync(authPath, "utf8")) as Record<
      string,
      unknown
    >;
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function buildAcpEnv(config: CodexRuntimeConfig): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...buildChildEnv(config) };
  const home = env.HOME ?? env.USERPROFILE ?? defaultHome();

  if (home) {
    env.HOME ??= home;
    env.USERPROFILE ??= home;
    env.CODEX_HOME ??= path.join(home, ".codex");
  }

  const codexAuth = readCodexAuthJson(env);
  const apiKey =
    env.CODEX_CLI_API_KEY ??
    env.OPENAI_API_KEY ??
    env.CODEX_API_KEY ??
    codexAuth.OPENAI_API_KEY ??
    codexAuth.CODEX_API_KEY;
  env.OPENAI_API_KEY ??= apiKey;
  env.CODEX_API_KEY ??= apiKey;

  return env;
}

function authMethodType(method: AuthMethod): string {
  return "type" in method && method.type ? method.type : "agent";
}

function isEnvAuthMethod(
  method: AuthMethod,
): method is AuthMethodEnvVar & { type: "env_var" } {
  return "type" in method && method.type === "env_var";
}

export function selectAcpAuthMethod(
  methods: AuthMethod[] | undefined,
  env: NodeJS.ProcessEnv,
): AuthMethod | undefined {
  if (!methods?.length) {
    return undefined;
  }

  const readyEnvMethod = methods.find((method) => {
    if (!isEnvAuthMethod(method)) {
      return false;
    }

    return method.vars.every((variable) => {
      if (variable.optional) {
        return true;
      }
      return Boolean(env[variable.name]);
    });
  });
  if (readyEnvMethod) {
    return readyEnvMethod;
  }

  return undefined;
}

function describeAuthMethods(
  methods: AuthMethod[] | undefined,
  env: NodeJS.ProcessEnv,
): string {
  if (!methods?.length) {
    return "none";
  }

  return methods
    .map((method) => {
      const type = authMethodType(method);
      if (!isEnvAuthMethod(method)) {
        return `${method.id}:${type}`;
      }

      const vars = method.vars
        .map((variable) => `${variable.name}=${Boolean(env[variable.name])}`)
        .join(",");
      return `${method.id}:${type}[${vars}]`;
    })
    .join(" ");
}

function requiredAuthEnvVars(methods: AuthMethod[] | undefined): string[] {
  const names = new Set<string>();
  for (const method of methods ?? []) {
    if (!isEnvAuthMethod(method)) {
      continue;
    }

    for (const variable of method.vars) {
      if (!variable.optional) {
        names.add(variable.name);
      }
    }
  }

  return [...names].sort();
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

    const env = buildAcpEnv(this.config);
    const proc = spawn(this.config.acpCommand, this.config.acpArgs, {
      cwd: this.config.workspace,
      env,
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

    const initializeResponse = await Promise.race([
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

    const authMethods = initializeResponse.authMethods ?? [];
    console.log(
      `[codex:acp] auth methods: ${describeAuthMethods(authMethods, env)}`,
    );

    const authMethod = selectAcpAuthMethod(authMethods, env);
    if (authMethod) {
      await Promise.race([
        conn.authenticate({ methodId: authMethod.id }),
        subprocessError,
      ]);
      console.log(
        `[codex:acp] authenticated with ${authMethod.name} (${authMethod.id})`,
      );
    } else if (authMethods.length > 0) {
      const required = requiredAuthEnvVars(authMethods).join(" or ");
      throw new Error(
        `Set ${required || "OPENAI_API_KEY or CODEX_API_KEY"} in the service environment for codex-acp`,
      );
    }

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
