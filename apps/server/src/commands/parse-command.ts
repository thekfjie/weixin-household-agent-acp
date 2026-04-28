import { BuiltInCommand, ParsedCommand } from "./types.js";

const COMMANDS: readonly BuiltInCommand[] = [
  "/new",
  "/reset",
  "/summary",
  "/time",
  "/recent",
];

export function parseBuiltInCommand(text: string): ParsedCommand | undefined {
  const head = text.trim().split(/\s+/, 1)[0] as BuiltInCommand | undefined;
  if (!head || !COMMANDS.includes(head)) {
    return undefined;
  }

  return {
    name: head,
    raw: text.trim(),
  };
}
