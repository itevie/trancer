import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "purgeranks",
  description: "Purge dead ranks",
  type: "ranks",
  guards: ["bot-owner"],

  handler: async (message) => {
    const ranks = await actions.ranks.getAll();
    const active: string[] = [];
    for await (const rank of ranks) {
      const votes = await actions.ranks.votes.getForRank(rank.rank_name);
      if (votes.length >= 2) active.push(rank.rank_name);
    }

    const toPurge = ranks.filter((x) => !active.includes(x.rank_name));
    if (toPurge.length === 0) return message.reply("Nothing to purge!");

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Are you sure you want to delete ${toPurge.length} ranks?`)
        .setDescription(toPurge.map((x) => `**${x.rank_name}**`).join(", ")),
      async callback() {
        for await (const rank of toPurge)
          await actions.ranks.delete(rank.rank_name);

        return {
          content: `Success! Deleted the following ranks: ${toPurge
            .map((x) => x.rank_name)
            .join(", ")}`,
        };
      },
    });
  },
};

export default command;
