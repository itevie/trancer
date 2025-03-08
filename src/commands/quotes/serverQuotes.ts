import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { database } from "../../util/database";
import { createEmbed, getUser } from "../../util/other";

const command: HypnoCommand = {
  name: "serverquotes",
  description: "Get all the quotes in the server",
  type: "quotes",

  handler: async (message) => {
    const quotes = await database.all<Quote[]>(
      `SELECT * FROM quotes WHERE server_id = (?);`,
      message.guild.id
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
      replyTo: message,
      embed: createEmbed().setTitle(`Quotes from ${message.guild.name}`),
      type: "field",
      data: list,
    });
  },
};

export default command;
