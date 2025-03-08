import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{ rank: string }> = {
  name: "unvote",
  description: "Unvote on a rank",
  type: "ranks",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "rank",
        type: "string",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    const rank = args.rank.toLowerCase();

    // Check if the rank exists
    if (!(await actions.ranks.exists(rank)))
      return message.reply(
        `That rank does not exist! But can be created using \`${serverSettings.prefix}createrank ${rank}\``
      );

    await database.run(
      `DELETE FROM votes WHERE rank_name = ? AND voter = ?`,
      rank,
      message.author.id
    );

    return message.reply(`Your vote on **${rank}** has been removed`);
  },
};

export default command;
