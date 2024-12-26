import { User } from "discord.js";
import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { createEmbed } from "../util/other";
import {
  englishifyRewardDetails,
  generateRandomReward,
  giveRewardDeteils,
} from "../util/items";

// So it doesn't send on start
let lastDrop = Date.now() - config.itemDrops.frequency / 2;
let messagesSince = 0;

const handler: HypnoMessageHandler = {
  name: "item-dropper",
  description: "Drops items in a channel every so often",

  handler: async (message) => {
    // Guards
    if (!config.itemDrops.enabled) return;
    if (config.itemDrops.channelExclusions.includes(message.channel.id)) return;
    if (!config.itemDrops.includeChannels.includes(message.channel.id)) return;

    messagesSince++;

    // Check if should send
    if (config.itemDrops.frequency - (Date.now() - lastDrop) < 0) {
      if (messagesSince < 50) return;
      messagesSince = 0;
      lastDrop = Date.now();

      const rewards = await generateRandomReward({
        currency: {
          min: 30,
          max: 150,
        },
        items: {
          pool: "get-db",
          count: {
            min: 0,
            max: 3,
          },
        },
      });
      const rewardString = await englishifyRewardDetails(rewards);

      // Send message
      let msg = await message.channel.send({
        embeds: [
          createEmbed()
            .setTitle(`Quick! An item has appeared!`)
            .setDescription(`Type "catch" to get ${rewardString}!`),
        ],
      });

      let collector = msg.channel.createMessageCollector({
        filter: (x) =>
          x.content.toLowerCase() === "catch" ||
          x.content.toLowerCase() === "atchcay",
        time: 30000,
      });

      let caughtBy: User | null = null;
      collector.on("collect", async (msg) => {
        caughtBy = msg.author;
        collector.stop();
        await giveRewardDeteils(msg.author.id, rewards);
        return msg.reply(
          `Welldone! You got ${rewardString}, it has been added to your inventory!`
        );
      });

      collector.on("end", () => {
        msg.edit({
          embeds: [
            createEmbed()
              .setTitle(`The item has expired!`)
              .setDescription(
                caughtBy
                  ? `**${caughtBy.username}** caught the drop of ${rewardString}!`
                  : `No one caught the drop of ${rewardString} in time :(`
              ),
          ],
        });
      });
    }
  },
};

export default handler;
