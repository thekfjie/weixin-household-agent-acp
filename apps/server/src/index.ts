import fs from "node:fs";
import path from "node:path";
import { buildCodexCommand, previewCodexArgv } from "./codex/index.js";
import { loadConfig } from "./config/index.js";
import { filterFamilyOutput } from "./policy/index.js";
import { resolveRole } from "./router/index.js";
import {
  buildPromptContext,
  ensureActiveSession,
  shouldRotateSession,
} from "./sessions/index.js";
import { AppDatabase, SQLITE_SCHEMA } from "./storage/index.js";
import { ILinkApiClient } from "./transport/index.js";

function ensureDirectory(target: string): void {
  fs.mkdirSync(target, { recursive: true });
}

function writeSchemaSnapshot(dataDir: string): string {
  const outputPath = path.join(dataDir, "schema.sql");
  fs.writeFileSync(outputPath, SQLITE_SCHEMA, "utf8");
  return outputPath;
}

function bootstrap(): void {
  const config = loadConfig();
  ensureDirectory(config.server.dataDir);

  const database = new AppDatabase(
    path.join(config.server.dataDir, "weixin-household-agent-acp.sqlite"),
  );
  database.initialize();

  const schemaPath = writeSchemaSnapshot(config.server.dataDir);
  const apiClient = new ILinkApiClient({
    baseUrl: config.wechat.apiBaseUrl,
    cdnBaseUrl: config.wechat.cdnBaseUrl,
    channelVersion: config.wechat.channelVersion,
    ...(config.wechat.routeTag ? { routeTag: config.wechat.routeTag } : {}),
  });
  const route = resolveRole({ configuredRole: "family" });
  const session = ensureActiveSession({
    database,
    wechatAccountId: "demo-account@im.bot",
    contactId: "demo-contact",
    role: route.role,
  });
  const rotationDecision = shouldRotateSession({
    lastActiveAt: session.lastActiveAt,
  });
  const promptContext = buildPromptContext({
    role: route.role,
    now: new Date(),
    summary: {
      summary:
        "\u7528\u6237\u6700\u8fd1\u4e3b\u8981\u5728\u6d4b\u8bd5\u5bb6\u5ead\u5fae\u4fe1 AI \u52a9\u624b\u7684\u6574\u4f53\u80fd\u529b\u3002",
      facts: [
        "\u6240\u6709\u65f6\u95f4\u7edf\u4e00\u6309\u5317\u4eac\u65f6\u95f4\u89e3\u91ca",
        "\u666e\u901a\u5bb6\u5ead\u6210\u5458\u4e0d\u9700\u8981\u81ea\u5df1\u5207\u4f1a\u8bdd",
      ],
      openLoops: [
        "\u5b9e\u73b0\u591a\u8d26\u53f7\u3001\u6587\u4ef6\u53d1\u9001\u3001\u81ea\u52a8\u6458\u8981",
      ],
      lastActiveAt: "2026-04-28 20:15 CST",
    },
  });

  const promptPreview = [
    promptContext.currentTimeText,
    promptContext.assistantInstruction,
    promptContext.summaryBlock,
    "\u7528\u6237\u6d88\u606f\uff1a\u5e2e\u6211\u6574\u7406\u4e00\u4e2a\u62a5\u9500\u6a21\u677f\uff0c\u6700\u597d\u80fd\u751f\u6210\u6587\u4ef6\u3002",
  ]
    .filter(Boolean)
    .join("\n\n");

  const codexPreview = previewCodexArgv(
    buildCodexCommand(config.codex.family, promptPreview),
  );

  const filteredText = filterFamilyOutput(
    "\u5206\u6790\uff1a\u5148\u68c0\u67e5\u76ee\u5f55\u3002\nsudo systemctl status foo\n\u8fd9\u662f\u7ed9\u7528\u6237\u7684\u6b63\u5e38\u7b54\u590d\u3002",
    config.familyPolicy,
  );

  console.log("[bootstrap] service initialized");
  console.log(`[bootstrap] port: ${config.server.port}`);
  console.log(`[bootstrap] timezone: ${config.server.timezone}`);
  console.log(`[bootstrap] data dir: ${config.server.dataDir}`);
  console.log(`[bootstrap] db file: ${database.getFilePath()}`);
  console.log(`[bootstrap] schema snapshot: ${schemaPath}`);
  console.log(`[bootstrap] ilink api base: ${apiClient.baseUrl}`);
  console.log(`[bootstrap] ilink cdn base: ${apiClient.cdnBaseUrl}`);
  console.log(`[bootstrap] family route reason: ${route.reason}`);
  console.log(`[bootstrap] session id: ${session.id}`);
  console.log(`[bootstrap] session rotation check: ${rotationDecision.reason}`);
  console.log(`[bootstrap] codex preview: ${codexPreview.argv.join(" ")} @ ${codexPreview.workspace}`);
  console.log("[bootstrap] filtered output sample:");
  console.log(filteredText);
}

bootstrap();
