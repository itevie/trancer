import { HypnoCommand } from "../../types/util";
import { getMemberCounts } from "../../util/analytics";
import { units } from "../../util/ms";
import { generateMultilineDataGraph, graphArgs } from "../../util/charts";

const command: HypnoCommand = {
  name: "membercountovertime",
  aliases: ["mover", "mcover", "memberover"],
  description: "Get the server's member count overtime",
  ratelimit: units.second * 30,

  args: {
    requiredArguments: 0,
    args: [...graphArgs],
  },

  type: "analytics",

  handler: async (message, { args }) => {
    const attachment = await generateMultilineDataGraph({
      data: (await getMemberCounts(message.guild.id)).map((x) => [
        "Member Count",
        new Date(x.time),
        x.amount,
      ]),
      ...args,
    });

    return message.reply({
      files: [attachment],
    });
  },
};

export default command;
