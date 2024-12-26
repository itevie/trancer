import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { createEmbed } from "../../util/other";
import { awardRandomThings } from "../../util/items";

const command: HypnoCommand = {
  name: "daily",
  description: `Get your daily reward of ${config.economy.currency}!`,
  type: "economy",

  ratelimit: 1000 * 60 * 60 * 24,

  handler: async (message) => {
    const rewards = await awardRandomThings(message.author.id, {
      currency: {
        min: config.economy.daily.min,
        max: config.economy.daily.max,
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
