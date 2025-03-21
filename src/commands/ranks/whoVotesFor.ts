import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { describe } from "node:test";
import { actions } from "../../util/database";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";
import { getUsernameSync } from "../../util/cachedUsernames";

const command: HypnoCommand<{ rank: Rank; user?: User }> = {
  name: "whovotedfor",
  aliases: ["whovoted", "wvf"],
  description: "See who voted for someone on a rank",
  type: "ranks",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "rank",
        name: "rank",
      },
      {
        type: "user",
        name: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user || message.author;
    let votes = await actions.ranks.votes.getAllForOn(
      args.rank.rank_name,
      user.id
    );

    paginate({
      replyTo: message,
      embed: createEmbed().setTitle(
        `Who voted ${args.rank.rank_name} for ${user.username}?`
      ),
      type: "description",
      data: votes.map((x) => getUsernameSync(x)),
    });
  },
};

export default command;
