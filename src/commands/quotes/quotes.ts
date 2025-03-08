import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";
import { paginate } from "../../util/components/pagination";

const command: HypnoCommand<{ user?: User; all?: boolean; search?: string }> = {
  name: "quotes",
  description: "Get amount of quotes / IDs from a user",
  aliases: ["qs", "getquotes", "getquotefor", "myquotes"],
  type: "quotes",
  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
      },
      {
        name: "all",
        aliases: ["a"],
        type: "boolean",
        wickStyle: true,
      },
      {
        name: "search",
        aliases: ["s", "q", "query"],
        type: "string",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const user = args.user ? args.user : message.author;

    if (args.all && user.id !== message.author.id)
      return message.reply(`You cannot add \`?all\``);

    const list = (
      args.all
        ? await database.all<Quote[]>(
            "SELECT * FROM quotes WHERE author_id = (?)",
            message.author.id
          )
        : await database.all<Quote[]>(
            `SELECT * FROM quotes WHERE author_id = (?) AND server_id = ?;`,
            user.id,
            message.guild.id
          )
    )
      .filter((x) =>
        args.all ? true : !["1274172930380664963"].includes(x.server_id)
      )
      .filter(
        (x) =>
          !args.search ||
          x.content.toLowerCase().includes(args.search.toLowerCase())
      )
      .map((x) => {
        return {
          name: `Quote #${x.id}`,
          value: `*${x.content || "No Content"}*`,
        };
      });

    return paginate({
      replyTo: message,
      embed: createEmbed().setTitle(`Quotes from ${user.username}`),
      type: "field",
      data: list,
    });
  },
};

export default command;
