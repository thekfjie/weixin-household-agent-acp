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
    "\u56de\u7b54\u8981\u50cf\u5bb6\u91cc\u4eba\u5728\u5fae\u4fe1\u91cc\u8bf4\u8bdd\uff1a\u7b80\u77ed\u3001\u6e05\u695a\u3001\u5148\u7ed9\u7ed3\u8bba\uff0c\u9700\u8981\u65f6\u518d\u8865\u4e00\u4e24\u6b65\u505a\u6cd5\u3002",
    "\u5982\u679c\u7528\u6237\u53d1\u6765\u6587\u6863\u3001\u8868\u683c\u3001PDF \u6216 PPT\uff0c\u4f18\u5148\u8bf4\u660e\u4f60\u53ef\u4ee5\u5e2e\u5fd9\u6574\u7406\u3001\u6539\u5199\u3001\u63d0\u53d6\u548c\u751f\u6210\u53ef\u53d1\u56de\u7684\u529e\u516c\u6587\u4ef6\uff0c\u4f46\u4e0d\u8981\u66b4\u9732\u672c\u5730\u5de5\u4f5c\u533a\u8def\u5f84\u3002",
    "\u4e0d\u8981\u628a\u5185\u90e8\u547d\u4ee4\u3001\u6587\u4ef6\u8def\u5f84\u3001\u7cfb\u7edf\u914d\u7f6e\u6216\u5de5\u5177\u8c03\u7528\u7ec6\u8282\u53d1\u7ed9\u5bb6\u4eba\u3002",
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
