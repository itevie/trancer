import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { awardRandomThings } from "../items/_util";
import ecoConfig from "../../ecoConfig";

const command: HypnoCommand = {
  name: "daily",
  description: `Get your daily reward of ${ecoConfig.currency}!`,
  type: "economy",

  ratelimit: 1000 * 60 * 60 * 24,

  handler: async (message) => {
    const rewards = await awardRandomThings(message.author.id, {
      currency: {
        min: ecoConfig.payouts.daily.min,
        max: ecoConfig.payouts.daily.max,
      },
      items: {
        pool: "get-db",
        count: {
          min: 0,
          max: 5,
        },
      },
    });

    // Reply
    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`You opened up your daily reward...`)
          .setDescription(`And you got ${rewards}!`),
      ],
    });
  },
};

export default command;
