import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getAquiredItemsFor, removeItemFor } from "../../util/actions/items";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ item: Item; amount?: number }> = {
  name: "sellitem",
  description: "Sell an item",
  type: "economy",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "item",
        type: "item",
      },
      {
        name: "amount",
        type: "wholepositivenumber",
      },
    ],
  },

  handler: async (message, { args }) => {
    const amount = args.amount ?? 1;
    const item = (await getAquiredItemsFor(message.author.id)).find(
      (x) => x.item_id === args.item.id
    );

    // Check if user has any / wanted amount
    if (!item || item.amount < amount)
      return message.reply(
        `:warning: You do not have **${amount} ${args.item.name}**!`
      );

    // Calculate price
    // 1 - weight * price * amount?
    const price = (1 - args.item.weight) * args.item.price * amount;

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Confirm sell for ${price} ${config.economy.currency}`)
        .setDescription(
          `Are you sure you want to sell **${amount} ${args.item.name}** for **${price} ${config.economy.currency}**?`
        ),
      callback: async () => {
        return {
          content: `Sold **${amount} ${args.item.name}** for **${price} ${config.economy.currency}!**`,
        };
      },
      autoYes: price < 500,
    });
  },
};

export default command;
