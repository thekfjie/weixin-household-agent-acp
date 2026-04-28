export type UserRole = "admin" | "family";

export type CodexMode = "suggest" | "auto-edit" | "full-auto";

export interface CodexRuntimeConfig {
  command: string;
  mode: CodexMode;
  workspace: string;
}

export interface FamilyPolicyConfig {
  stripReasoning: boolean;
  stripCommands: boolean;
  stripPaths: boolean;
  allowFileSend: boolean;
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
}
