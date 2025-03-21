import { User } from "discord.js";
import { client } from "../..";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import { getUsernameSync } from "../../util/cachedUsernames";

const command: HypnoCommand<{ user: User; rank: Rank }> = {
  name: "vote",
  description: "Vote for a user on a rank",
  type: "ranks",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "rank",
        type: "rank",
      },
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Check if self
    if (args.user.id === message.author.id)
      return message.reply(`You cannot vote for yourself, silly :cyclone:`);

    const old = await actions.ranks.votes.add(
      args.rank.rank_name,
      args.user.id,
      message.author.id
    );

    return message.reply(
      `Your vote on **${args.rank.rank_name}** has been cast against **${
        args.user.username
      }**${old ? ` (used to be **${getUsernameSync(old)}**)` : ""}`
    );
  },
};

export default command;
