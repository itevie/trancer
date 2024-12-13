import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getRandomImposition } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "imposition",
  aliases: ["i", "impo"],
  description: "Send a some nice, fuzzy imposition",
  type: "hypnosis",
  usage: [["$cmd <user>", "Gives another user the imposition! :)"]],

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "user",
        name: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    return message.reply(
      await getRandomImposition(args.user ? args.user.id : message.author.id)
    );
  },
};

export default command;
