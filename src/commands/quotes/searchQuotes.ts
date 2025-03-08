import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { database } from "../../util/database";
import { createEmbed, getUser } from "../../util/other";

const command: HypnoCommand<{ query: string }> = {
  name: "searchquotes",
  aliases: ["squote", "quotesearch"],
  description: "Search quotes by words in the current server",
  type: "quotes",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "query",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    const quotes = await database.all<Quote[]>(
      `SELECT * FROM quotes WHERE server_id = ?;`,
      message.guild.id
    );
    const matches: Quote[] = [];
    const query = args.query.toLowerCase();

    for await (const quote of quotes) {
      if (quote.content.toLowerCase().includes(query)) matches.push(quote);
    }

    let list = [];
    for await (const quote of matches) {
      list.push({
        name: `Quote #${quote.id} by ${
          (await getUser(quote.author_id))?.username ?? "Cannot fetch username"
        }`,
        value: `*${quote.content || "No Content"}*`,
      });
    }

    return paginate({
      replyTo: message,
      embed: createEmbed().setTitle(`Quotes matching that query`),
      type: "field",
      data: list,
    });
  },
};

export default command;
