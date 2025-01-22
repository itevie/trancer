import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { itemText } from "../../util/textProducer";

const command: HypnoCommand<{ user: User; item: Item; amount?: number }> = {
  name: "give",
  description: "Give someone else an item",
  type: "economy",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
      },
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
    const amount = args.amount || 1;
    const aquired = await actions.items.aquired.getFor(
      message.author.id,
      args.item.id
    );

    if (aquired.amount < amount)
      return message.reply(
        `:warning: You do not have ${itemText(args.item, amount)}!`
      );

    await actions.items.aquired.removeFor(
      message.author.id,
      args.item.id,
      amount
    );
    await actions.items.aquired.addFor(args.user.id, args.item.id, amount);

    return message.reply(
      `Gave **${args.user.username}** ${itemText(args.item, amount)}!`
    );
  },
};

export default command;
