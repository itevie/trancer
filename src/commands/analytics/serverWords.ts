import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "serverwords",
  description: "Get the server's most used words",
  type: "analytics",

  handler: async (message) => {
    let words = Object.entries(
      await actions.wordUsage.toObject(
        await actions.wordUsage.getForServer(message.guild.id),
      ),
    ).sort((a, b) => b[1] - a[1]);

    return paginate({
      message,
      embed: createEmbed().setTitle(`Words used for ${message.guild.name}`),
      type: "description",
      data: words.map((x) => `**${x[0]}**: ${x[1]} times`),
    });
  },
};

export default command;
