import { HypnoCommand } from "../../types/util";
import {
  accumlateSortLeaderboardData,
  createPaginatedLeaderboardFromData,
} from "../../util/createLeaderboard";
import { actions, database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ rank: Rank }> = {
  name: "rank",
  aliases: ["r"],
  description: "Get the top 10 users on a specific rank",
  type: "ranks",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "rank",
        type: "rank",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    const votes = await actions.ranks.votes.getForRank(args.rank.rank_name);

    await createPaginatedLeaderboardFromData({
      data: accumlateSortLeaderboardData(votes.map((x) => x.votee)),
      description: args.rank.description ? `*${args.rank.description}*` : null,
      embed: createEmbed()
        .setTitle(`Rank ${args.rank.rank_name}`)
        .setFooter({
          text: `Use ${serverSettings.prefix}vote ${args.rank.rank_name} <user> to vote!`,
        }),
      entryName: "votes",
      replyTo: message,
    });
  },
};

export default command;
