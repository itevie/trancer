import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "triggerideas",
  aliases: ["triggerlist", "triggeridealist"],    
  type: "hypnosis",
  description: "Get a list of all trigger ideas",

  handler: async (message) => {
    return paginate({
      message,
      embed: createEmbed().setTitle("All Trigger Ideas"),
      type: "description",
      data: (await actions.triggerIdeas.getAll()).map(
        (x) => `**${x.name}** (${x.id})\n-# ${x.description}`,
      ),
    });
  },
};

export default command;
