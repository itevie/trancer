import { AttachmentBuilder } from "discord.js";

import { HypnoCommand } from "../../types/util";

import { getMemberCounts } from "../../util/analytics";
import { generateSimpleLineChart } from "../../util/graphs";
import { units } from "../../util/ms";

const command: HypnoCommand = {
  name: "membercountovertime",

  aliases: ["mover", "mcover", "memberover"],

  description: "Get the server's member count overtime",
  ratelimit: units.minute * 10,

  type: "analytics",

  handler: async (message) => {
    // Generate

    let image = await generateSimpleLineChart(
      await getMemberCounts(message.guild.id),
      "time",
      "amount",
      "Member Count Overtime",
    );

    const attachment = new AttachmentBuilder(image).setFile(image);

    // Done

    return message.reply({
      files: [attachment],
    });
  },
};

export default command;
