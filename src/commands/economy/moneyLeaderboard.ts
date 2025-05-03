import { HypnoCommand } from "../../types/util";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { checkBadges } from "../../util/badges";
import { createEmbed } from "../../util/other";
import ecoConfig from "../../ecoConfig";
import { actions } from "../../util/database";

const command: HypnoCommand<{ server?: boolean }> = {
  name: `moneyleaderboard`,
  aliases: ["moneylb", "ecolb", "elb", "baltop"],
  description: `See who has the most ${ecoConfig.currency}`,
  type: "economy",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "server",
        type: "boolean",
        description: "Only show people in the server",
        aliases: ["s"],
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { serverSettings, args }) => {
    let data = await actions.eco.getAll();

    if (args.server) {
      data = data.filter((x) => message.guild.members.cache.has(x.user_id));
    }

    let organised = data.map((x) => [x.user_id, x.balance]) as [
      string,
      number,
    ][];
    let description = `Who has the most ${ecoConfig.currency}?`;

    checkBadges();

    await createPaginatedLeaderboardFromData({
      embed: createEmbed().setFooter({
        text: `Check ${serverSettings.prefix}howtogeteco on how to get more!`,
      }),
      replyTo: message,
      data: organised,
      entryName: ecoConfig.currency,
      description,
    });
  },
};

export default command;
