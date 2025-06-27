import HugeAlias from "../../models/HugeAlias";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ command: string }> = {
  name: "deletealias",
  aliases: ["deletehugealias", "delalias"],
  description: "Remove one of your huge aliases",
  type: "booster",

  guards: ["twilight-booster"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "command",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    const alias = await HugeAlias.fetch(message.author.id, args.command);
    if (!alias)
      return {
        content: "You do not have an alias with that name!",
      };
    else {
      await alias.delete();
      return {
        content: "Success! Deleted that alias",
      };
    }
  },
};

export default command;
