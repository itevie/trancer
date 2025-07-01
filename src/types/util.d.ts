import {
  Channel,
  CommandInteraction,
  Guild,
  InteractionResponse,
  Message,
  MessageCreateOptions,
  PermissionResolvable,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  User,
} from "discord.js";

export type MaybePromise<T> = Promise<T> | T;

export type HypnoCommandType =
  | "analytics"
  | "dawnagotchi"
  | "ranks"
  | "economy"
  | "cards"
  | "badges"
  | "booster"
  | "counting"
  | "spirals"
  | "quotes"
  | "help"
  | "minecraft"
  | "hypnosis"
  | "uncategorised"
  | "fun"
  | "admin"
  | "messages"
  | "leaderboards"
  | "games"
  | "actions"
  | "ai"
  | "marriage"
  | "reporting"
  | "qotd"
  | "voice"
  | "confessions"
  | "file-directory";

type Guard = "admin" | "bot-server" | "bot-owner" | "twilight-booster";

type ArgumentType =
  | "attachment"
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
  | "item"
  | "none"
  | "array"
  | "currency"
  | "channel"
  | "rank"
  | "date";

interface HypnoCommandDetails<Args extends { [key: string]: any } = {}> {
  serverSettings: ServerSettings;
  userData: UserData;
  economy: Economy;
  command: string;
  args?: Args;
  oldArgs: string[];
  originalContent: string;
}

interface HypnoCommand<Args extends { [key: string]: any } = {}> {
  /**
   * The name of the command
   */
  name: string;

  /**
   * Any aliases for the command
   */
  aliases?: string[];

  /**
   * Each alias will be treated like it's own command,
   * each alias appearing in the help message.
   */
  eachAliasIsItsOwnCommand?: boolean;

  /**
   * The description of the comamnd
   */
  description: string;

  /**
   * Whether or not this command should be loaded
   * (false by default)
   */
  ignore?: boolean;

  /**
   * Shows a list of example usages for it
   * [command, description]
   */
  usage?: [string, string][];

  /**
   * Not really used anymore
   */
  examples?: [string, string][];

  /**
   * The type of the command, only used for categarizing
   */
  type: HypnoCommandType;

  /**
   * A list of arguments for the command
   */
  args?: {
    requiredArguments: number;
    args: Argument[];
  };

  /**
   * A command to handle guard / permission exceptions
   */
  except?: (message: Message, args?: string[]) => boolean;

  /**
   * Runs before the main handler. Used to check if it should be ran or not.
   * Return true to run the handler, false to skip it.
   */
  preHandler?: (
    message: Message<true>,
    options: HypnoCommandDetails<Args>,
  ) => Promise<boolean>;

  /**
   * The main handler for the command
   */
  handler: (
    message: Message<true>,
    options: HypnoCommandDetails<Args>,
  ) => MaybePromise<MessageCreateOptions | Message | void>;

  /**
   * How often this command can be ran
   */
  ratelimit?:
    | number
    | ((
        message: Message<true>,
        options: HypnoCommandDetails<Args>,
      ) => Promise<number | null>);

  /**
   * A list of string guards to be checked when it's attempted
   * to be ran.
   */
  guards?: Guard[];

  /**
   * Whether or not to call the exception function
   */
  allowExceptions?: boolean;

  /**
   * A list of Discord permissions that the user must have to run the command.
   */
  permissions?: PermissionResolvable[];

  /**
   * Whether or not this command requires a reply
   */
  needsReference?: boolean;
}

interface MessageLike {
  author: User;
  reply: Message["reply"];
  channel: Channel;
  guild: Guild;
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
   * Wick style aliases
   */
  aliases?: string[];

  /**
   * Whether or not this argument can be substituted from
   * something from the message reference.
   *
   * Examples:
   * type string: gets the content of the message reference
   * type user: gets the message reference's author
   */
  infer?: boolean;

  or?: Omit<Argument, "infer" | "aliases" | "wickStyle" | "name">[];
}

interface StringArgument extends BaseArgument {
  type: "string";

  /**
   * If the type is a string, this will take all content
   * and put it in this.
   */
  takeContent?: boolean;

  /**
   * Take the rest of the arguments after this one
   */
  takeRest?: boolean;
}

interface AttachmentArgument extends BaseArgument {
  type: "attachment";

  /**
   * If no value is provided, default to using the pfp
   */
  defaultPfp?: boolean;
}

interface NumberArgument extends BaseArgument {
  type: "number" | "wholepositivenumber";

  min?: number;
  max?: number;
}

interface ArrayArgument extends BaseArgument {
  type: "array";

  inner: Omit<ArgumentType, "array">;
}

interface CurrencyArgument extends BaseArgument {
  type: "currency";
  min?: number;
  max?: number;
  allowNegative?: boolean;
}

interface UserArgument extends BaseArgument {
  type: "user";
  denyBots?: boolean;
  mustHaveEco?: boolean;
}

type Argument =
  | AttachmentArgument
  | NumberArgument
  | StringArgument
  | ArrayArgument
  | CurrencyArgument
  | UserArgument
  | BaseArgument;

interface HypnoMessageHandler {
  name: string;
  description: string;
  examples?: string[];
  botsOnly?: boolean;
  noCommands?: boolean;
  botServerOnly?: boolean;
  disabled?: boolean;

  handler: (
    message: Message,
    settings: { serverSettings: ServerSettings },
  ) => void;
}
