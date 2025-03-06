import { HypnoCommand } from "../../types/util";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "mostserverquotes",
  description: "See who has the most quote in the current server",
  type: "quotes",

  handler: async (message) => {
    const quotes = await database.all<Quote[]>(
      "SELECT * FROM quotes WHERE server_id = ?",
      message.guild.id
    );

    createPaginatedLeaderboardFromData({
      replyTo: message,
      embed: createEmbed().setTitle(
        `Who has been quoted the most in ${message.guild.name}?`
      ),
      entryName: "quotes",
      data: Object.entries(
        quotes.reduce<{ [key: string]: number }>((p, c) => {
          return { ...p, [c.author_id]: (p[c.author_id] || 0) + 1 };
        }, {})
      ).sort((a, b) => b[1] - a[1]),
    });
  },
};

export default command;
