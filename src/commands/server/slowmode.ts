import { TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ amount: number }> = {
  name: "slowmode",
  description: "Sets the channel's slowmode",
  type: "admin",
  guards: ["admin"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "amount",
        type: "number",
      },
    ],
  },

  handler: async (message, { args }) => {
    await (message.channel as TextChannel).setRateLimitPerUser(args.amount);
    return message.reply("Okay! :cyclone:");
  },
};

export default command;
