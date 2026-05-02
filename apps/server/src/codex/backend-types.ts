import { UserRole } from "../config/types.js";
import { CodexRunResult } from "./types.js";

export interface CodexProgressEvent {
  phase: "thinking" | "responding";
}

export interface CodexBackendRequest {
  conversationId: string;
  prompt: string;
  bootstrapPrompt?: string;
  role: UserRole;
  onProgress?: (event: CodexProgressEvent) => void;
}

export interface CodexBackend {
  run(request: CodexBackendRequest): Promise<CodexRunResult>;
  clearSession(conversationId: string): void;
  dispose(): void;
}
