export type BuiltInCommand = "/new" | "/reset" | "/summary" | "/time" | "/recent";

export interface ParsedCommand {
  name: BuiltInCommand;
  raw: string;
}
