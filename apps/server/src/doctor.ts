import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { loadConfig } from "./config/index.js";
import { AppDatabase } from "./storage/index.js";

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

function ok(name: string, detail: string): CheckResult {
  return { name, ok: true, detail };
}

function fail(name: string, detail: string): CheckResult {
  return { name, ok: false, detail };
}

function parseNodeMajor(version: string): number {
  return Number.parseInt(version.replace(/^v/, "").split(".", 1)[0] ?? "0", 10);
}

function checkNode(): CheckResult {
  const major = parseNodeMajor(process.version);
  return major >= 22
    ? ok("Node.js", process.version)
    : fail("Node.js", `${process.version}，需要 >= 22`);
}

function checkCommand(command: string, args: string[]): Promise<CheckResult> {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, args, {
        shell: process.platform === "win32",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      resolve(
        fail(command, error instanceof Error ? error.message : String(error)),
      );
      return;
    }

    let output = "";
    let settled = false;
    const finish = (result: CheckResult): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish(fail(command, "执行超时"));
    }, 10_000);

    child.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.once("error", (error) => {
      finish(fail(command, error.message));
    });
    child.once("close", (code) => {
      const firstLine = output.trim().split(/\r?\n/, 1)[0] ?? "";
      if (code === 0) {
        finish(ok(command, firstLine || "ok"));
      } else {
        finish(fail(command, firstLine || `exit ${code}`));
      }
    });
  });
}

function checkHttpHealth(port: number): Promise<CheckResult> {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: "127.0.0.1",
        port,
        path: "/healthz",
        timeout: 5_000,
      },
      (response) => {
        response.resume();
        if (response.statusCode === 200) {
          resolve(ok("HTTP /healthz", `127.0.0.1:${port}`));
        } else {
          resolve(fail("HTTP /healthz", `HTTP ${response.statusCode}`));
        }
      },
    );

    request.on("timeout", () => {
      request.destroy();
      resolve(fail("HTTP /healthz", "请求超时，服务可能未启动"));
    });
    request.on("error", (error) => {
      resolve(fail("HTTP /healthz", error.message));
    });
  });
}

function checkWritableDirectories(
  name: string,
  directories: string[],
): CheckResult {
  const failures: string[] = [];
  for (const directory of directories) {
    try {
      fs.mkdirSync(directory, { recursive: true });
      fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      failures.push(
        `${directory}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return failures.length === 0
    ? ok(name, directories.join(", "))
    : fail(name, failures.join("; "));
}

async function run(): Promise<void> {
  const outputJson = process.argv.includes("--json");
  const runCodex = process.argv.includes("--codex");
  const results: CheckResult[] = [checkNode()];
  const config = loadConfig();

  results.push(
    fs.existsSync(path.resolve(".env"))
      ? ok(".env", path.resolve(".env"))
      : fail(".env", "当前目录没有 .env，systemd 运行时通常需要它"),
  );

  try {
    fs.mkdirSync(config.server.dataDir, { recursive: true });
    results.push(ok("数据目录", config.server.dataDir));
  } catch (error) {
    results.push(
      fail(
        "数据目录",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  results.push(
    checkWritableDirectories("文件发送白名单目录", config.fileSend.allowedDirs),
  );
  results.push(
    config.codex.family.envMode === "minimal"
      ? ok("family 环境隔离", "CODEX_FAMILY_ENV_MODE=minimal")
      : fail(
          "family 环境隔离",
          `CODEX_FAMILY_ENV_MODE=${config.codex.family.envMode}`,
        ),
  );
  results.push(
    ok(
      "Codex backend",
      `admin=${config.codex.admin.backend}, family=${config.codex.family.backend}`,
    ),
  );

  try {
    const database = new AppDatabase(
      path.join(config.server.dataDir, "weixin-household-agent-acp.sqlite"),
    );
    database.initialize();
    const accounts = database.listAccounts();
    const activeAccounts = accounts.filter((account) => account.status === "active");
    database.close();
    results.push(
      activeAccounts.length > 0
        ? ok("微信账号", `active=${activeAccounts.length}, total=${accounts.length}`)
        : fail("微信账号", `没有 active 账号，total=${accounts.length}`),
    );
  } catch (error) {
    results.push(
      fail(
        "SQLite",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  results.push(await checkCommand(config.codex.admin.command, ["--version"]));
  if (config.codex.family.command !== config.codex.admin.command) {
    results.push(await checkCommand(config.codex.family.command, ["--version"]));
  }
  if (config.codex.admin.backend === "acp") {
    results.push(await checkCommand(config.codex.admin.acpCommand, ["--version"]));
  }
  if (
    config.codex.family.backend === "acp" &&
    config.codex.family.acpCommand !== config.codex.admin.acpCommand
  ) {
    results.push(await checkCommand(config.codex.family.acpCommand, ["--version"]));
  }

  if (runCodex) {
    results.push(
      await checkCommand(config.codex.admin.command, [
        ...config.codex.admin.args,
        "请只回复：doctor-ok",
      ]),
    );
  }

  results.push(await checkHttpHealth(config.server.port));

  const failed = results.filter((result) => !result.ok).length;
  if (outputJson) {
    console.log(JSON.stringify({ results }, null, 2));
  } else {
    for (const result of results) {
      console.log(`${result.ok ? "OK" : "FAIL"}  ${result.name}  ${result.detail}`);
    }
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
