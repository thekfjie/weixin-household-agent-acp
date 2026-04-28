export function formatBeijingTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(/\//g, "-");
}

export function buildCurrentTimeInstruction(now: Date): string {
  return [
    `\u73b0\u5728\u662f\u5317\u4eac\u65f6\u95f4 ${formatBeijingTime(now)}\u3002`,
    "\u7528\u6237\u8bf4\u4eca\u5929\u3001\u660e\u5929\u3001\u6628\u5929\u3001\u4e0a\u5348\u3001\u4e0b\u5348\u3001\u665a\u4e0a\u65f6\uff0c\u90fd\u6309\u8fd9\u4e2a\u65f6\u95f4\u7406\u89e3\u3002",
  ].join("\n");
}
