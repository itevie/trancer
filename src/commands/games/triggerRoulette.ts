import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { HypnoCommand } from "../../types/util";
import {
  createEmbed,
  getRandomImposition,
  randomFromRange,
} from "../../util/other";

const command: HypnoCommand = {
  name: "triggerroulette",
  aliases: ["troulette", "trou"],
  description: "A game of trigger roulette",
  type: "games",

  handler: async (message) => {
    const rolls: { [key: string]: number } = {};

    function generateEmbed(): EmbedBuilder {
      return createEmbed()
        .setTitle("Trigger Roulette")
        .setDescription(
          `Click the green button to roll your dice.\n**${
            message.author.username
          }** click the red button to finish.${
            Object.keys(rolls).length > 0
              ? `\n${Object.entries(rolls)
                  .map((x) => `<@${x[0]}>: ${x[1]}`)
                  .join("\n")}`
              : ""
          }`
        );
    }

    const msg = await message.reply({
      embeds: [generateEmbed()],
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel("Roll")
            .setCustomId("roll"),

          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Execute")
            .setCustomId("execute")
        ),
      ],
    });

    const collector = msg.createMessageComponentCollector({ time: 1000 * 60 });

    collector.on("collect", async (i) => {
      if (i.customId === "execute" && i.user.id !== message.author.id)
        return await i.reply({
          ephemeral: true,
          content: "You didn't author the command! You cannot execute!",
        });
      if (i.customId === "roll") {
        if (rolls[i.user.id])
          return await i.reply({
            ephemeral: true,
            content: "You have already rolled! Please wait!",
          });
        const roll = randomFromRange(0, 20);
        rolls[i.user.id] = roll;
        await i.deferUpdate();
        await msg.edit({ embeds: [generateEmbed()] });
      } else if (i.customId === "execute") {
        const lowest = Object.entries(rolls).sort((a, b) => a[1] - b[1]);
        const impo = await getRandomImposition(lowest[0][0], true);
        await message.channel.send(`**<@${lowest[0][0]}>**: ${impo}`);
        collector.stop();
      }
    });

    collector.on("end", async () => {
      await msg.edit({ components: [] });
    });
  },
};

export default command;
