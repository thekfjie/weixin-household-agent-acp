export type UserRole = "admin" | "family";

export type CodexMode = "suggest" | "auto-edit" | "full-auto";
export type CodexEnvMode = "inherit" | "minimal";
export type CodexBackendKind = "cli" | "acp";
export type CodexAcpAuthMode = "auto" | "env" | "none";

export interface CodexRuntimeConfig {
  backend: CodexBackendKind;
  command: string;
  args: string[];
  acpCommand: string;
  acpArgs: string[];
  acpAuthMode: CodexAcpAuthMode;
  mode: CodexMode;
  timeoutMs: number;
  workspace: string;
  envMode: CodexEnvMode;
  envPassthrough: string[];
}

export interface FamilyPolicyConfig {
  stripReasoning: boolean;
  stripCommands: boolean;
  stripPaths: boolean;
  allowFileSend: boolean;
}

export interface FileSendConfig {
  allowedDirs: string[];
  maxBytes: number;
}

export interface ServerConfig {
  port: number;
  timezone: string;
  dataDir: string;
}

export interface WechatConfig {
  apiBaseUrl: string;
  cdnBaseUrl: string;
  channelVersion: string;
  routeTag?: string;
}

export interface AppConfig {
  server: ServerConfig;
  wechat: WechatConfig;
  codex: {
    admin: CodexRuntimeConfig;
    family: CodexRuntimeConfig;
  };
  familyPolicy: FamilyPolicyConfig;
  fileSend: FileSendConfig;
}
