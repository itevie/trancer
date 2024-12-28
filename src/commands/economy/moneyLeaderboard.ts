import { HypnoCommand } from "../../types/util";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { getAllEconomy } from "../../util/actions/economy";
import { checkBadges } from "../../util/badges";
import { createEmbed } from "../../util/other";
import ecoConfig from "../../ecoConfig";

const command: HypnoCommand = {
  name: `moneyleaderboard`,
  aliases: ["moneylb", "ecolb", "elb", "baltop"],
  description: `See who has the most ${ecoConfig.currency}`,
  type: "economy",

  handler: async (message, { serverSettings }) => {
    let data = await getAllEconomy();
    let organised = data.map((x) => [x.user_id, x.balance]) as [
      string,
      number
    ][];
    let description = `Who has the most ${ecoConfig.currency}?`;

    checkBadges();

    await createPaginatedLeaderboardFromData({
      embed: createEmbed()
        .setTitle(`Economy Leaderboard`)

        .setFooter({
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
