export type BuiltInCommand =
  | "/new"
  | "/reset"
  | "/summary"
  | "/time"
  | "/recent"
  | "/help"
  | "/whoami"
  | "/file"
  | "/sendfile";

export interface ParsedCommand {
  name: BuiltInCommand;
  raw: string;
  args: string[];
}
