import { Message } from "discord.js";

type HypnoCommandType =
  | "analytics"
  | "dawnagotchi"
  | "ranks"
  | "economy"
  | "cards"
  | "badges"
  | "counting"
  | "spirals"
  | "quotes"
  | "help"
  | "imposition"
  | "uncategorised"
  | "fun"
  | "admin"
  | "messages"
  | "leaderboards"
  | "ai";

type Guard = "admin" | "bot-server" | "bot-owner";

type ArgumentType =
  | "string"
  | "confirm"
  | "any"
  | "number"
  | "wholepositivenumber"
  | "user"
  | "boolean"
  | "card"
  | "deck"
  | "role"
  | "channel";

interface HypnoCommandDetails<
  Args extends { [key: string]: unknown } = { [key: string]: unknown },
> {
  serverSettings: ServerSettings;
  command: string;
  args: Args;
  oldArgs: string[];
}

interface HypnoCommand<
  Args extends { [key: string]: unknown } = { [key: string]: unknown },
> {
  name: string;
  aliases?: string[];
  description: string;
  usage?: [string, string][];
  examples?: [string, string][];
  type?: HypnoCommandType;
  args?: {
    requiredArguments: number;
    args: Argument[];
  };

  except?: (message: Message, args: string[]) => boolean;
  handler: (
    message: Message,
    options: HypnoCommandDetails<Args>,
  ) => Promise<unknown>;

  guards?: Guard[];
  allowExceptions?: boolean;
  permissions?: bigint[];
}

interface Argument {
  type: ArgumentType;
  name: string;
  onMissing?: string;
  description?: string;
  mustBe?: unknown;
  oneOf?: unknown[];
}

interface HypnoMessageHandler {
  name: string;
  description: string;
  examples?: string[];
  botsOnly?: boolean;
  noCommands?: boolean;

  handler: (message: Message) => void;
}
