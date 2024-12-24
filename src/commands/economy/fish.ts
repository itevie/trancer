import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { createEmbed } from "../../util/other";
import { awardRandomThings } from "../../util/economy";
import {
  getAquiredItem,
  getAquiredItemsFor,
  getItems,
  removeItemFor,
} from "../../util/actions/items";

const command: HypnoCommand = {
  name: "fish",
  description: `Fish for fishes in the open sea and earn ${config.economy.currency}!`,
  type: "economy",

  ratelimit: async (message) => {
    return 0;
    let item = (await getAquiredItemsFor(message.author.id)).find(
      (x) => x.item_id === config.items.fishingRod
    );

    return item && item.amount !== 0
      ? config.economy.fish.limit / 2
      : config.economy.fish.limit;
  },

  handler: async (message) => {
    if (
      (await getAquiredItem(config.items.fishingRod, message.author.id))
        .amount > 0 &&
      Math.random() > 0.9
    ) {
      await removeItemFor(message.author.id, config.items.fishingRod);
      await message.reply(`Your fishing rod broke! :fishing_pole_and_fish:`);
    }

    const rewardString = await awardRandomThings(message.author.id, {
      items: {
        pool: Object.fromEntries(
          (await getItems())
            .filter((x) => x.tag === "fish")
            .map((x) => [x.id, x.weight])
        ),
        count: {
          min: 1,
          max: 7,
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
