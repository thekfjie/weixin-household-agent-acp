export type BuiltInCommand =
  | "/new"
  | "/reset"
  | "/last"
  | "/yesterday"
  | "/mode"
  | "/summary"
  | "/time"
  | "/recent"
  | "/help"
  | "/whoami"
  | "/sessions"
  | "/file"
  | "/sendfile"
  | "/files"
  | "/accounts";

export interface ParsedCommand {
  name: BuiltInCommand;
  raw: string;
  args: string[];
}
