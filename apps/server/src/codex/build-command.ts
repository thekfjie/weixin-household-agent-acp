import { CodexRuntimeConfig } from "../config/types.js";
import { CodexInvocation, CodexPlanPreview } from "./types.js";

export function buildCodexCommand(
  config: CodexRuntimeConfig,
  prompt: string,
): CodexInvocation {
  return {
    command: config.command,
    mode: config.mode,
    workspace: config.workspace,
    prompt,
  };
}

export function previewCodexArgv(
  invocation: CodexInvocation,
): CodexPlanPreview {
  return {
    workspace: invocation.workspace,
    argv: [invocation.command, `--${invocation.mode}`],
  };
}
