import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "count",
  description: "Get help on your counting",
  type: "counting",

  handler: async (message, { serverSettings }) => {
    return message.reply({
      embeds: [
        createEmbed()
          .setTitle("Counting")
          .setDescription(
            `\`${serverSettings.prefix}setupcount\` - setup counting in the current channel, or change the channel for the counting` +
              `\n\`${serverSettings.prefix}deletecount\` - remove counting from your server` +
              `\n\`${serverSettings.prefix}currentcount\` - get the highest & current number for your count `
          ),
      ],
    });
  },
};

export default command;
