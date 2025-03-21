import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "votesfor",
  description: "See all the votes for a specific user",
  type: "ranks",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user || message.author;
    let votes = await actions.ranks.votes.getAllForUser(user.id);

    paginate({
      replyTo: message,
      embed: createEmbed().setTitle(`Who has voted for ${user.username}?`),
      type: "description",
      data: votes
        .sort((a, b) => b.amount - a.amount)
        .map((x) => `**${x.rank_name}**: ${x.amount} votes`),
    });
  },
};

export default command;
