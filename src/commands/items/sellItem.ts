import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { calculateItemPrice } from "./_util";
import { createEmbed } from "../../util/other";
import { currency, itemText } from "../../util/textProducer";

const command: HypnoCommand<{ item: Item; amount?: number }> = {
  name: "sellitem",
  aliases: ["sell"],
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
    const aquiredItem = await actions.items.aquired.getFor(
      message.author.id,
      args.item.id
    );

    // Check if user has any / wanted amount
    if (!aquiredItem || aquiredItem.amount < amount)
      return message.reply(
        `:warning: You do not have **${amount} ${args.item.name}**!`
      );

    if (aquiredItem.protected)
      return message.reply(
        `:warning: You have protected that item, so you can't sell it!`
      );

    // Calculate price
    // 1 - weight * price * amount?
    const price = calculateItemPrice(args.item) * amount;

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Confirm sell for ${currency(price)}`)
        .setDescription(
          `Are you sure you want to sell **${amount} ${
            args.item.name
          }** for ${currency(price)}?`
        ),
      callback: async () => {
        await actions.eco.addMoneyFor(message.author.id, price);
        await actions.items.aquired.removeFor(
          message.author.id,
          args.item.id,
          amount
        );
        return {
          content: `Sold ${itemText(args.item, amount)} for ${currency(
            price
          )}!`,
        };
      },
      autoYes: price < 500,
    });
  },
};

export default command;
