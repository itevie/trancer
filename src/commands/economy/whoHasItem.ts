import { HypnoCommand } from "../../types/util";
import { getUsernameSync } from "../../util/cachedUsernames";
import { paginate } from "../../util/components/pagination";
import { actions, database } from "../../util/database";
import { createEmbed } from "../../util/other";
import { itemText } from "../../util/textProducer";

const command: HypnoCommand<{ item: Item }> = {
  name: "whohasitem",
  aliases: ["itemlb"],
  description: "See who has an item",
  type: "economy",

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
    const items = await actions.items.aquired.resolveFrom(
      await database.all<AquiredItem[]>(
        "SELECT * FROM aquired_items WHERE item_id = ?;",
        args.item.id
      )
    );

    return paginate({
      embed: createEmbed().setTitle(`Who has item ${itemText(args.item)}`),
      type: "description",
      data: items
        .sort((a, b) => b.amount - a.amount)
        .map(
          (x, i) =>
            `**${i + 1}.** ${getUsernameSync(x.user_id)} (**${x.amount}** ${
              x.emoji
            })`
        ),
      replyTo: message,
    });
  },
};

export default command;
