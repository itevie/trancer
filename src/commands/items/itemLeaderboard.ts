import { HypnoCommand } from "../../types/util";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ item: Item }> = {
  name: "itemleaderboard",
  aliases: ["itemlb"],
  type: "economy",
  description: "Get a leaderboard of who has an item the most",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "item",
        type: "item",
      },
    ],
  },

  handler: async (message, { args }) => {
    const required = await actions.items.aquired.get(args.item.id);

    await createPaginatedLeaderboardFromData({
      replyTo: message,
      embed: createEmbed().setTitle(`Who has the most ${args.item.name}?`),
      data: required.map((x) => [x.user_id, x.amount]),
      entryName: args.item.emoji,
    });
  },
};

export default command;
