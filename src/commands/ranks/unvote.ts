import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{ rank: Rank }> = {
  name: "unvote",
  description: "Unvote on a rank",
  type: "ranks",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "rank",
        type: "rank",
      },
    ],
  },

  handler: async (message, { args }) => {
    await actions.ranks.votes.remove(args.rank.rank_name, message.author.id);

    return message.reply(
      `Your vote on **${args.rank.rank_name}** has been removed`
    );
  },
};

export default command;
