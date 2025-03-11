import { HypnoCommand } from "../../types/util";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { createEmbed } from "../../util/other";
import { createRating } from "./rate";

const command: HypnoCommand<{ rating: string }> = {
  name: "ratingleaderboard",
  aliases: ["ratinglb"],
  description: "Get a list of a rating for everyone in the server",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "rating",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    createPaginatedLeaderboardFromData({
      replyTo: message,
      embed: createEmbed().setTitle(`Ratings for ${args.rating}`),
      data: message.guild.members.cache.map((x) => [
        x.user.id,
        createRating(x.user.username, args.rating),
      ]),
      entryName: "%",
    });
  },
};

export default command;
