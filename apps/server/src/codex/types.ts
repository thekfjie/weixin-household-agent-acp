import { CodexMode } from "../config/types.js";

export interface CodexInvocation {
  command: string;
  mode: CodexMode;
  workspace: string;
  prompt: string;
}

export interface CodexPlanPreview {
  argv: string[];
  workspace: string;
}
