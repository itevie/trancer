import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed, paginate } from "../../util/other";

const command: HypnoCommand = {
  name: "allquotes",
  description: "Get all of your quotes from all servers",
  aliases: ["aqs", "allmyquotes"],
  type: "quotes",

  handler: async (message) => {
    const list = (
      await database.all<Quote[]>(
        `SELECT * FROM quotes WHERE author_id = (?);`,
        message.author.id
      )
    )
      .filter((x) => !["1274172930380664963"].includes(x.server_id))
      .map((x) => {
        return {
          name: `Quote #${x.id}`,
          value: `*${x.content || "No Content"}*`,
        };
      });

    return paginate(
      message,
      createEmbed().setTitle(`Quotes from ${message.author.username}`),
      list
    );
  },
};

export default command;
