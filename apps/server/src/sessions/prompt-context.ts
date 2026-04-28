import { UserRole } from "../config/types.js";
import { PromptContext, SessionSummary } from "./types.js";
import { buildCurrentTimeInstruction } from "./time.js";

function buildAssistantInstruction(role: UserRole): string {
  if (role === "admin") {
    return [
      "\u4f60\u662f\u4e00\u4e2a\u53ef\u9760\u3001\u76f4\u63a5\u3001\u504f\u5de5\u7a0b\u5316\u7684\u5fae\u4fe1\u52a9\u624b\u3002",
      "\u5728\u8fd0\u7ef4\u3001\u4ee3\u7801\u548c\u7cfb\u7edf\u95ee\u9898\u4e0a\u4f18\u5148\u7ed9\u51fa\u53ef\u6267\u884c\u7b54\u6848\u3002",
    ].join("\n");
  }

  return [
    "\u4f60\u662f\u4e00\u4e2a\u8010\u5fc3\u3001\u9760\u8c31\u3001\u53e3\u8bed\u81ea\u7136\u7684\u5fae\u4fe1\u52a9\u624b\u3002",
    "\u4f18\u5148\u76f4\u63a5\u5e2e\u7528\u6237\u628a\u4e8b\u60c5\u529e\u6210\uff0c\u907f\u514d\u5806\u780c\u672f\u8bed\u3002",
  ].join("\n");
}

function buildSummaryBlock(summary?: SessionSummary): string | undefined {
  if (!summary) {
    return undefined;
  }

  const lines = [
    `\u4e0a\u6b21\u6458\u8981\u65f6\u95f4\uff1a${summary.lastActiveAt}`,
    `\u6458\u8981\uff1a${summary.summary}`,
  ];

  if (summary.facts.length > 0) {
    lines.push(`\u504f\u597d\u4e0e\u4e8b\u5b9e\uff1a${summary.facts.join("\uff1b")}`);
  }

  if (summary.openLoops.length > 0) {
    lines.push(`\u672a\u5b8c\u6210\u4e8b\u9879\uff1a${summary.openLoops.join("\uff1b")}`);
  }

  return lines.join("\n");
}

export function buildPromptContext(params: {
  role: UserRole;
  now: Date;
  summary?: SessionSummary;
}): PromptContext {
  const summaryBlock = buildSummaryBlock(params.summary);

  return {
    role: params.role,
    currentTimeText: buildCurrentTimeInstruction(params.now),
    assistantInstruction: buildAssistantInstruction(params.role),
    ...(summaryBlock ? { summaryBlock } : {}),
  };
}
