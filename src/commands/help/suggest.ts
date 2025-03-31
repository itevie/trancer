import { TextBasedChannel } from "discord.js";
import config from "../../config";
import { HypnoCommand, HypnoInteractionCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { units } from "../../util/ms";

const command: HypnoCommand<{ content: string }> = {
  name: "suggest",
  type: "help",
  aliases: ["issue"],
  eachAliasIsItsOwnCommand: true,
  description: "Suggest or report an issue for Trancer!",
  ratelimit: units.minute * 5,

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "content",
        type: "string",
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args, command }) => {
    const type = command === "suggest" ? "suggestion" : "issue";
    const content = args.content;

    const embed = createEmbed()
      .setTitle(`New ${type} by ${message.author.username}`)
      .setDescription(content)
      .setFooter({ text: `${message.author.username} | ${message.author.id}` });

    const channel = (await message.client.channels.fetch(
      config.botServer.channels.suggestions,
    )) as TextBasedChannel;

    await channel.send({
      embeds: [embed],
    });

    return message.reply({
      content: `Your ${type} has been sent!`,
      embeds: [embed],
    });
  },
};

export default command;
