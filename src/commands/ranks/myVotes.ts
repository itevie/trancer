import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import { createEmbed } from "../../util/other";
import { paginate } from "../../util/components/pagination";
import { getUsernameSync } from "../../util/cachedUsernames";

const command: HypnoCommand<{ user?: User }> = {
  name: "votes",
  description: "View the things you have voted for on all the ranks",
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
    let votes = await actions.ranks.votes.getAllBy(user.id);

    paginate({
      message: message,
      embed: createEmbed().setTitle(`All your votes!`),
      type: "description",
      data: votes.map((x) => `**${x.rank_name}**: ${getUsernameSync(x.votee)}`),
    });
  },
};

export default command;
