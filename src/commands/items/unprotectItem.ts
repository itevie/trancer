import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { itemText } from "../../util/language";

const command: HypnoCommand<{ item: Item }> = {
  name: "unprotectitem",
  aliases: ["unlockitem", "unpitem"],
  description: "Unprotects an item from ever being sold",
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
    await actions.items.aquired.setLock(message.author.id, args.item.id, false);
    return await message.reply(
      `${itemText(args.item)} has been protected! You are now able to sell it.`
    );
  },
};

export default command;
