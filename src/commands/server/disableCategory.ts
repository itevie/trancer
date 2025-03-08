import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { categoryEmojis } from "../help/_util";

const command: HypnoCommand<{ key: string; state: boolean }> = {
  name: "disablecategory",
  type: "admin",
  description: "Disables a category in your server",
  guards: ["admin"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "key",
        type: "string",
        oneOf: Object.keys(categoryEmojis),
        description: "The category to toggle",
      },
      {
        name: "state",
        type: "boolean",
        description: "Whether to enable or disable the category",
      },
    ],
  },

  handler: async (message, { args }) => {
    if (args.key === "server")
      return message.reply(`You cannot disable this category.`);
    await actions.blacklist.setFor(
      "category",
      message.guild.id,
      args.key,
      args.state
    );
    return message.reply(`Updated!`);
  },
};

export default command;
