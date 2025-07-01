import { HypnoCommand } from "../../types/util";
import cachedUsernames from "../../util/cachedUsernames";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "whohasdawn",
  aliases: ["whohasdawnagotchi", "whohasdawns"],
  type: "dawnagotchi",
  description: "See who has a Dawn",

  handler: async (message) => {
    const dawns = (await actions.dawnagotchi.getAll()).filter((x) => x.alive);

    return paginate({
      message,
      embed: createEmbed().setTitle("List of alive Dawns"),
      type: "description",
      data: dawns.map(
        (x) =>
          `**${cachedUsernames.getSync(x.owner_id)}**: ${x.created_at.toLocaleDateString()}`,
      ),
    });
  },
};

export default command;
