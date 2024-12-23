import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getRandomImposition } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "sendtrigger",
  aliases: ["i", "impo", "t", "trigger"],
  description: "Send someone's trigger",
  type: "hypnosis",

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
