import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { awardRandomThings } from "../items/_util";
import { actions } from "../../util/database";
import ecoConfig from "../../ecoConfig";

const command: HypnoCommand = {
  name: "fish",
  aliases: ["f"],
  description: `Fish for fishes in the open sea and earn ${ecoConfig.currency}!`,
  type: "economy",

  ratelimit: async (message) => {
    let item = await actions.items.aquired.getFor(
      message.author.id,
      await actions.items.getId(ecoConfig.items.fishingRod),
    );

    return item && item.amount > 0
      ? ecoConfig.payouts.fish.limit / 2
      : ecoConfig.payouts.fish.limit;
  },

  handler: async (message) => {
    if (
      (
        await actions.items.aquired.getFor(
          message.author.id,
          await actions.items.getId(ecoConfig.items.fishingRod),
        )
      ).amount > 0 &&
      Math.random() > 0.9
    ) {
      await actions.items.aquired.removeFor(
        message.author.id,
        await actions.items.getId(ecoConfig.items.fishingRod),
      );
      await message.reply(`Your fishing rod broke! :fishing_pole_and_fish:`);
    }

    const rewardString = await awardRandomThings(message.author.id, {
      items: {
        pool: Object.fromEntries(
          (await actions.items.getByTag("fish")).map((x) => [x.id, x.weight]),
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
        keys[Math.floor(Math.random() * keys.length)],
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
          .setDescription(`You caught ${fish.join(", ")} and ${rewardString}!`),
      ],
    });
  },
};

export default command;
