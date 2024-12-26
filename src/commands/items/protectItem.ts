import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ item: Item }> = {
  name: "protectitem",
  aliases: ["lockitem", "pitem"],
  description: "Protects an item from ever being sold",
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

  handler: async (message, { args, serverSettings }) => {
    await actions.items.aquired.setLock(message.author.id, args.item.id, true);
    return await message.reply(
      `**${args.item.name}** has been protected! You can now longer sell it.\nUse \`${serverSettings.prefix}unprotectitem ${args.item.name}\` to undo this.`
    );
  },
};

export default command;
