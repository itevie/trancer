import { Message, User } from "discord.js";
import database from "../database/database.ts";
import type { Argument, HypnoCommand } from "../types/util.d.ts";

export const argumentConverters: {
  [key: string]: (
    content: string,
    arg: Argument,
    context: Message,
  ) => Promise<string | { value: unknown }> | string | { value: unknown };
} = {
  // ----- Simple Types -----
  number: (c) =>
    isNaN(parseInt(c)) ? "Invalid number provided" : { value: parseInt(c) },

  wholepositivenumber: (c) =>
    (
        !isNaN(parseInt(c)) &&
        parseInt(c) > 0 &&
        parseInt(c) % 1 !== 0
      )
      ? "Expected a whole, positive number"
      : { value: parseInt(c) },
  // ----- Database Types -----
  card: async (c) => {
    let card: Card | undefined;
    if (c.match(/[0-9]+/)) {
      card = await database.cards.getById(parseInt(c));
    } else card = await database.cards.getByName(c);
    if (!card) return "Invalid card ID or name provided";
    return { value: card };
  },
  // ----- Discord Types -----
  user: async (c, _, m) => {
    if (c.toLowerCase() === "me") {
      return { value: m.author };
    }

    if (!c.match(/<?@?[0-9]+>?/)) {
      return `Invalid user format provided, please provide a mention or ID!`;
    }

    let user: User;
    try {
      user = await m.client.users.fetch(c.replace(/[<>@]/g, ""));
    } catch (err) {
      console.log(err);
      return `Failed to fetch the user: ${c}`;
    }

    return { value: user };
  },
};

export function generateCommandCodeBlock(
  command: HypnoCommand,
  serverSettings: ServerSettings,
): string {
  let codeblock = "```" + `${serverSettings.prefix}${command.name}`;

  if (command.args) {
    for (const i in command.args.args) {
      const isRequired = command.args.requiredArguments > +i;
      codeblock += ` ${isRequired ? "<" : "["}${command.args.args[i].name}${
        isRequired ? ">" : "]"
      }`;
    }
  }

  codeblock += "```";

  return codeblock;
}
