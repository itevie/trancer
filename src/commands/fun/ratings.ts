import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";
import { createRating } from "./rate";

const command: HypnoCommand<{ user?: User }> = {
  name: "ratings",
  type: "fun",
  aliases: ["myratings"],
  description: "Get a list of ratings for a user",

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
    const user = args.user || message.author;
    const ratings = await database.all<PinnedRating[]>(
      "SELECT * FROM pinned_ratings WHERE user_id = ?",
      user.id
    );

    paginate({
      replyTo: message,
      embed: createEmbed().setTitle(
        `All ${args.user === message.author ? "your" : "their"} ratings`
      ),
      type: "description",
      data: ratings.map(
        (x) => `**${x.rating}**: ${createRating(user.username, x.rating)}%`
      ),
    });
  },
};

export default command;
