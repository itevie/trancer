import { Message, PermissionResolvable } from "discord.js";

export type HypnoCommandType =
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
  | "games"
  | "actions"
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

interface HypnoCommandDetails<Args extends { [key: string]: any } = {}> {
  serverSettings: ServerSettings;
  command: string;
  args?: Args;
  oldArgs: string[];
  originalContent: string;
}

interface HypnoCommand<Args extends { [key: string]: any } = {}> {
  name: string;
  aliases?: string[];
  eachAliasIsItsOwnCommand?: boolean;
  description: string;
  usage?: [string, string][];
  examples?: [string, string][];
  type: HypnoCommandType;
  args?: {
    requiredArguments: number;
    args: Argument[];
  };

  except?: (message: Message, args: string[]) => boolean;
  handler: (message: Message<true>, options: HypnoCommandDetails<Args>) => void;

  guards?: Guard[];
  allowExceptions?: boolean;
  permissions?: PermissionResolvable[];
}

interface BaseArgument {
  /**
   * The type of this argument
   */
  type: ArgumentType;

  /**
   * The name of the argument
   */
  name: string;

  /**
   * The description of the command to show in help
   */
  description?: string;

  /**
   * The error to show if it is missing
   */
  onMissing?: string;

  /**
   * Check if it must be a certain something, e.g. "confirm"
   */
  mustBe?: any;

  /**
   * The value must be one of the values in the array
   */
  oneOf?: any[];

  /**
   * Whether or not this must be parsed as ?arg value
   */
  wickStyle?: boolean;

  /**
   * Whether or not this argument can be substituted from
   * something from the message reference.
   *
   * Examples:
   * type string: gets the content of the message reference
   * type user: gets the message reference's author
   */
  infer?: boolean;
}

interface StringArgument extends BaseArgument {
  type: "string";

  /**
   * If the type is a string, this will take all content
   * and put it in this.
   */
  takeContent?: boolean;
}

interface NumberArgument extends BaseArgument {
  type: "number" | "wholepositivenumber";

  min?: number;
  max?: number;
}

type Argument = NumberArgument | StringArgument | BaseArgument;

interface HypnoMessageHandler {
  name: string;
  description: string;
  examples?: string[];
  botsOnly?: boolean;
  noCommands?: boolean;

  handler: (message: Message) => void;
}
