import { spawn } from "node:child_process";
import fs from "node:fs";
import { CodexInvocation, CodexRunResult } from "./types.js";

const MAX_OUTPUT_BYTES = 512 * 1024;

function trimOutput(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function extractTextFromJsonLines(stdout: string): string | undefined {
  const texts: string[] = [];

  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) {
      continue;
    }

    try {
      const payload = JSON.parse(trimmed) as Record<string, unknown>;
      const type = String(payload.type ?? "");

      if (
        ["message", "final_answer", "agent_message", "output_text"].includes(type) &&
        typeof payload.text === "string"
      ) {
        texts.push(payload.text);
      }

      if (type === "turn_complete" && typeof payload.output === "string") {
        texts.push(payload.output);
      }
    } catch {
      // Human output is also valid; ignore non-JSON lines here.
    }
  }

  const joined = texts.join("\n").trim();
  return joined || undefined;
}

function normalizeCodexStdout(stdout: string): string {
  const jsonText = extractTextFromJsonLines(stdout);
  if (jsonText) {
    return jsonText;
  }

  return trimOutput(stdout);
}

export async function runCodexInvocation(
  invocation: CodexInvocation,
): Promise<CodexRunResult> {
  if (!fs.existsSync(invocation.workspace)) {
    fs.mkdirSync(invocation.workspace, { recursive: true });
  }

  const args = [...invocation.args, invocation.prompt];

  return new Promise((resolve, reject) => {
    const child = spawn(invocation.command, args, {
      cwd: invocation.workspace,
      env: process.env,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }, 2_000).unref();
    }, invocation.timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (Buffer.byteLength(stdout, "utf8") > MAX_OUTPUT_BYTES) {
        stdout = stdout.slice(-MAX_OUTPUT_BYTES);
      }
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (Buffer.byteLength(stderr, "utf8") > MAX_OUTPUT_BYTES) {
        stderr = stderr.slice(-MAX_OUTPUT_BYTES);
      }
    });

    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.once("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        text: normalizeCodexStdout(stdout),
        stderr: trimOutput(stderr),
        exitCode,
        timedOut,
      });
    });
  });
}
