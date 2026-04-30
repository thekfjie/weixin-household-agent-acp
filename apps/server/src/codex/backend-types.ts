import { UserRole } from "../config/types.js";
import { CodexRunResult } from "./types.js";

export interface CodexBackendRequest {
  conversationId: string;
  prompt: string;
  role: UserRole;
}

export interface CodexBackend {
  run(request: CodexBackendRequest): Promise<CodexRunResult>;
  clearSession(conversationId: string): void;
  dispose(): void;
}
