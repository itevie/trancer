import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ user?: User }> = {
  name: "avatar",
  description: "Get a user's avatar",
  aliases: ["pfp"],
  type: "help",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: (message, { args }) => {
    let user = args.user ? args.user : message.author;
    return message.reply(`${user.displayAvatarURL({ size: 2048 })}`);
  },
};

export default command;
