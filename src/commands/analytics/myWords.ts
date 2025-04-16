import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";
import { units } from "../../util/ms";

let cache: Map<string, { time: Date; data: [string, number][] }> = new Map();

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
    let words: [string, number][];

    if (
      !cache.get(args.user.id) ||
      Date.now() - cache.get(args.user.id).time.getTime() > units.hour
    ) {
      words = Object.entries(
        await actions.wordUsage.toObject(
          await actions.wordUsage.getFor(args.user.id, message.guild.id),
        ),
      ).sort((a, b) => b[1] - a[1]);
      cache.set(args.user.id, { time: new Date(), data: words });
    } else {
      words = cache.get(args.user.id).data;
    }

    return paginate({
      message,
      embed: createEmbed()
        .setTitle(`Words used for ${args.user.username}`)
        .setFooter({
          text: "Cached up to 1 hour",
        }),
      type: "description",
      data: words.map((x) => `**${x[0]}**: ${x[1]} times`),
    });
  },
};

export default command;
