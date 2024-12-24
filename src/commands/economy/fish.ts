import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { createEmbed } from "../../util/other";
import { awardRandomThings } from "../../util/economy";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "fish",
  description: `Fish for fishes in the open sea and earn ${config.economy.currency}!`,
  type: "economy",

  ratelimit: async (message) => {
    let item = await actions.items.aquired.getFor(
      message.author.id,
      config.items.fishingRod
    );

    return item && item.amount !== 0
      ? config.economy.fish.limit / 2
      : config.economy.fish.limit;
  },

  handler: async (message) => {
    if (
      (
        await actions.items.aquired.getFor(
          message.author.id,
          config.items.fishingRod
        )
      ).amount > 0 &&
      Math.random() > 0.9
    ) {
      await actions.items.aquired.removeFor(
        message.author.id,
        config.items.fishingRod
      );
      await message.reply(`Your fishing rod broke! :fishing_pole_and_fish:`);
    }

    const rewardString = await awardRandomThings(message.author.id, {
      items: {
        pool: Object.fromEntries(
          (await actions.items.getByTag("fish")).map((x) => [x.id, x.weight])
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
