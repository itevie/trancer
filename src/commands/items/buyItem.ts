import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { currency, itemText } from "../../util/textProducer";

const command: HypnoCommand<{ item: Item; amount?: number }> = {
  name: "buy",
  type: "economy",
  description: "Buy an item from the shop",

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
    // Fetch details
    let eco = await actions.eco.getFor(message.author.id);

    // Check if item exists
    if (!args.item) return message.reply(`That item does not exist!`);
    if (!args.item.buyable)
      return message.reply(`:warning: That item is not buyable!`);

    let amount = args.amount || 1;
    let price = args.item.price * amount;

    // Check if user has enough money
    if (price > eco.balance)
      return message.reply(`You do not have ${currency(price)}`);

    // Check if max
    if (args.item.max) {
      const ai = await actions.items.aquired.getFor(
        message.author.id,
        args.item.id
      );
      if (ai.amount + amount > args.item.max)
        return message.reply(
          `You can't buy more as this item is maxxed at **${args.item.max}** per person.`
        );
    }

    // Give the user the item
    await actions.eco.removeMoneyFor(message.author.id, price);
    await actions.items.aquired.addFor(message.author.id, args.item.id, amount);

    // Done
    return message.reply(
      `You bought ${itemText(args.item, amount)} for ${currency(price)}`
    );
  },
};

export default command;
