import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { database } from "../../util/database";
import { createEmbed, getUser } from "../../util/other";

const command: HypnoCommand<{ search?: string }> = {
  name: "serverquotes",
  description: "Get all the quotes in the server",
  type: "quotes",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "search",
        aliases: ["s", "q", "query"],
        type: "string",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const quotes = (
      await database.all<Quote[]>(
        `SELECT * FROM quotes WHERE server_id = (?);`,
        message.guild.id,
      )
    ).filter(
      (x) =>
        !args.search ||
        x.content.toLowerCase().includes(args.search.toLowerCase()),
    );

    let list = [];
    for await (const quote of quotes) {
      list.push({
        name: `Quote #${quote.id} by ${
          (await getUser(quote.author_id))?.username ?? "Cannot fetch username"
        }`,
        value: `*${quote.content || "No Content"}*`,
      });
    }

    return paginate({
      message: message,
      embed: createEmbed().setTitle(`Quotes from ${message.guild.name}`),
      type: "field",
      data: list,
    });
  },
};

export default command;
