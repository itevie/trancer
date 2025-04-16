import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { units } from "../../util/ms";
import { createEmbed } from "../../util/other";

export let serverWordCache: Map<
  string,
  { time: Date; data: [string, number][] }
> = new Map();

const command: HypnoCommand = {
  name: "serverwords",
  description: "Get the server's most used words (cached to one hour)",
  type: "analytics",

  handler: async (message) => {
    let words: [string, number][];

    if (
      !serverWordCache.get(message.guild.id) ||
      Date.now() - serverWordCache.get(message.guild.id).time.getTime() >
        units.hour
    ) {
      words = Object.entries(
        await actions.wordUsage.toObject(
          await actions.wordUsage.getForServer(message.guild.id),
        ),
      ).sort((a, b) => b[1] - a[1]);
      serverWordCache.set(message.guild.id, { time: new Date(), data: words });
    } else {
      words = serverWordCache.get(message.guild.id).data;
    }

    return paginate({
      message,
      embed: createEmbed().setTitle(`Words used for ${message.guild.name}`),
      type: "description",
      data: words.map((x) => `**${x[0]}**: ${x[1]} times`),
    });
  },
};

export default command;
