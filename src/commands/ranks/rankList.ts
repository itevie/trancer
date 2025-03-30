import { HypnoCommand } from "../../types/util";
import { getUsernameSync } from "../../util/cachedUsernames";
import { paginate } from "../../util/components/pagination";
import { actions, database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "ranklist",
  aliases: ["rankl", "rl"],
  type: "ranks",
  description: "Get a list of active ranks",

  handler: async (message, { serverSettings }) => {
    const ranks = await actions.ranks.getAll();
    const votes = await actions.ranks.votes.getAllBy(message.author.id);

    paginate({
      message: message,
      embed: createEmbed()
        .setTitle(`All the ranks`)
        .setFooter({
          text: `Use ${serverSettings.prefix}vote rank @user to vote`,
        }),
      pageLength: 25,
      type: "description",
      data: ranks.map(
        (x) =>
          `**${x.rank_name}**: ${
            votes.some((y) => y.rank_name === x.rank_name)
              ? getUsernameSync(
                  votes.find((y) => y.rank_name === x.rank_name).votee,
                )
              : "*Not voted*"
          }`,
      ),
    });
  },
};

export default command;
