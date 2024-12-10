import { HypnoCommand } from "../../types/util";
import { rankExists } from "../../util/actions/ranks";
import {
  accumlateSortLeaderboardData,
  createPaginatedLeaderboardFromData,
} from "../../util/createLeaderboard";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ name: string }> = {
  name: "rank",
  aliases: ["r"],
  description: "Get the top 10 users on a specific rank",
  type: "ranks",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "name",
        type: "string",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    // Validate
    const name = args.name.toLowerCase();

    if (!(await rankExists(name)))
      return message.reply(
        `That rank does not exist, but you can create it using \`${serverSettings.prefix}createrank ${name}\``
      );
    const lb = await database.get<Rank>(
      `SELECT * FROM ranks WHERE rank_name = (?)`,
      name
    );

    // Fetch results
    const dbResults = (await database.all(
      `SELECT * FROM votes WHERE rank_name = (?);`,
      name
    )) as Vote[];

    await createPaginatedLeaderboardFromData({
      data: accumlateSortLeaderboardData(dbResults.map((x) => x.votee)),
      description: `*${lb.description}*`,
      embed: createEmbed()
        .setTitle(`Rank ${name}`)
        .setFooter({
          text: `Use ${serverSettings.prefix}vote ${name} <user> to vote!`,
        }),
      entryName: "votes",
      replyTo: message,
    });
  },
};

export default command;
