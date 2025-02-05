import { Channel, TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ content: string; channel: Channel }> = {
  name: "send",
  description: "Sends a message in another channel",
  type: "admin",
  guards: ["admin"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "content",
        type: "string",
      },
      {
        name: "channel",
        type: "channel",
      },
    ],
  },

  handler: async (message, { args }) => {
    const channel = args.channel as TextChannel;
    if (!channel.isTextBased())
      return message.reply("Channel is not a text channel");
    if (channel.guild.id !== message.guild.id)
      return message.reply("That channel is not in this server");

    await channel.send(args.content);
  },
};

export default command;
