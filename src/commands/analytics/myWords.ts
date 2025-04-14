import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "words",
  aliases: ["mywords", "wordsof"],
  description: "See what words a user usess",
  type: "analytics",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "user",
        name: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    console.log(args);
    let words = Object.entries(
      await actions.wordUsage.toObject(
        await actions.wordUsage.getFor(args.user.id, message.guild.id),
      ),
    ).sort((a, b) => b[1] - a[1]);

    return paginate({
      message,
      embed: createEmbed().setTitle(`Words used for ${args.user.username}`),
      type: "description",
      data: words.map((x) => `**${x[0]}**: ${x[1]} times`),
    });
  },
};

export default command;
