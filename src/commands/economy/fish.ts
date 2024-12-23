import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { getEconomyFor, setLastFish } from "../../util/actions/economy";
import { createEmbed, randomFromRange } from "../../util/other";
import { msToHowLong } from "../../util/ms";
import { awardRandomThings } from "../../util/economy";

const command: HypnoCommand = {
  name: "fish",
  description: `Fish for fishes in the open sea and earn ${config.economy.currency}!`,
  type: "economy",

  ratelimit: config.economy.fish.limit,

  handler: async (message) => {
    const rewardString = await awardRandomThings(message.author.id, {
      currency: {
        min: config.economy.fish.min,
        max: config.economy.fish.max,
      },
      items: {
        pool: { [config.items.cardPull]: 0.2 },
        count: {
          min: 0,
          max: 2,
        },
      },
    });

    let fish: string[] = [];
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      let keys = Array.from(message.guild.members.cache.keys());
      let name = message.guild.members.cache.get(
        keys[Math.floor(Math.random() * keys.length)]
      ).user.username;
      if (!fish.includes(name)) fish.push(`**${name}**`);
    }

    // Reply
    return message.reply({
      content:
        message.author.id === "879234591968333824"
          ? `Blub blub blub, you're a fish flower :3c *boop!*\n:3\nWho's a fishie?`
          : "",
      embeds: [
        createEmbed()
          .setTitle(`You went fishing! 🎣`)
          .setDescription(
            `You caught ${fish.join(", ")} and got ${rewardString}!`
          ),
      ],
    });
  },
};

export default command;
