import path from "node:path";
import { AppConfig, CodexMode } from "./types.js";

const VALID_CODEX_MODES: readonly CodexMode[] = [
  "suggest",
  "auto-edit",
  "full-auto",
];

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  return raw === "1" || raw.toLowerCase() === "true";
}

function readPort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} is not a valid port: ${raw}`);
  }

  return parsed;
}

function readMode(name: string, fallback: CodexMode): CodexMode {
  const raw = (process.env[name] ?? fallback) as CodexMode;
  if (!VALID_CODEX_MODES.includes(raw)) {
    throw new Error(`Environment variable ${name} is not a valid Codex mode: ${raw}`);
  }

  return raw;
}

function resolveDefaultCodexCommand(): string {
  return process.platform === "win32" ? "codex.cmd" : "codex";
}

function resolveDefaultCodexWorkspace(name: "admin" | "family"): string {
  return name === "admin"
    ? "./runtime/codex-admin"
    : "./runtime/codex-family";
}

export function loadConfig(): AppConfig {
  const dataDir = path.resolve(readEnv("DATA_DIR", "./data"));
  const routeTag = process.env.WECHAT_ROUTE_TAG?.trim() || undefined;

  return {
    server: {
      port: readPort("PORT", 18080),
      timezone: readEnv("TIMEZONE", "Asia/Shanghai"),
      dataDir,
    },
    wechat: {
      apiBaseUrl: readEnv("WECHAT_API_BASE_URL", "https://ilinkai.weixin.qq.com"),
      cdnBaseUrl: readEnv(
        "WECHAT_CDN_BASE_URL",
        "https://novac2c.cdn.weixin.qq.com/c2c",
      ),
      channelVersion: readEnv(
        "WECHAT_CHANNEL_VERSION",
        "weixin-household-agent-acp-0.1.0",
      ),
      ...(routeTag ? { routeTag } : {}),
    },
    codex: {
      admin: {
        command: readEnv("CODEX_ADMIN_COMMAND", resolveDefaultCodexCommand()),
        mode: readMode("CODEX_ADMIN_MODE", "full-auto"),
        workspace: path.resolve(
          readEnv(
            "CODEX_ADMIN_WORKSPACE",
            resolveDefaultCodexWorkspace("admin"),
          ),
        ),
      },
      family: {
        command: readEnv("CODEX_FAMILY_COMMAND", resolveDefaultCodexCommand()),
        mode: readMode("CODEX_FAMILY_MODE", "suggest"),
        workspace: path.resolve(
          readEnv(
            "CODEX_FAMILY_WORKSPACE",
            resolveDefaultCodexWorkspace("family"),
          ),
        ),
      },
    },
    familyPolicy: {
      stripReasoning: readBoolean("FAMILY_STRIP_REASONING", true),
      stripCommands: readBoolean("FAMILY_STRIP_COMMANDS", true),
      stripPaths: readBoolean("FAMILY_STRIP_PATHS", true),
      allowFileSend: readBoolean("ALLOW_FILE_SEND", true),
    },
  };
}
