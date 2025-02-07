import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Entitlement,
  TextChannel,
} from "discord.js";
import { client } from "..";
import { calculateLevel } from "../messageHandlers/xp";
import { actions } from "../util/database";
import { generateEmbed } from "../commands/server/startGiveaway";
import { createEmbed } from "../util/other";

client.on("interactionCreate", async (i) => {
  if (i.isButton()) {
    if (i.customId.startsWith("giveaway-")) {
      const parts = i.customId.split("-");
      const userData = await actions.userData.getFor(i.user.id, i.guild.id);
      const giveaway = await actions.giveaways.get(parts[2]);
      const entries = await actions.giveaways.entries.getFor(giveaway.id);

      if (parts[1] === "join") {
        if (entries.some((x) => x.author_id === i.user.id))
          return await i.reply({
            ephemeral: true,
            content: "You have already joined this giveaway!",
          });
        if (
          giveaway.min_level &&
          calculateLevel(userData.xp) < giveaway.min_level
        )
          return await i.reply({
            ephemeral: true,
            content: `Your level is too low! You must be at least **level ${
              giveaway.min_level
            }** and you are **level ${calculateLevel(userData.xp)}**`,
          });

        await actions.giveaways.entries.addFor(giveaway.id, i.user.id);
        await i.reply({
          content: `Entered you in the giveaway for **${giveaway.what}**!`,
          ephemeral: true,
        });

        const channel = (await client.channels.fetch(
          giveaway.channel_id
        )) as TextChannel;
        const message = await channel.messages.fetch(giveaway.message_id);
        await message.edit({
          embeds: [generateEmbed(entries.length + 1, giveaway)],
        });
        return;
      } else if (parts[1] === "finish") {
        if (i.user.id !== giveaway.author_id)
          return await i.reply({
            content: "You are not the author of this giveaway!",
            ephemeral: true,
          });

        const winner = entries[Math.floor(Math.random() * entries.length)];
        await i.reply({
          content: `${
            parts[3] === "reroll" ? "The winner has been re-rolled and " : ""
          }<@${winner.author_id}> has won the giveaway for **${
            giveaway.what
          }**, welldone!`,
          components: [
            // @ts-ignore
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`giveaway-finish-${giveaway.id}-reroll`)
                .setLabel("Re-roll")
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });

        const channel = (await client.channels.fetch(
          giveaway.channel_id
        )) as TextChannel;
        const message = await channel.messages.fetch(giveaway.message_id);
        await message.edit({
          embeds: [
            createEmbed()
              .setTitle("Giveaway Over!")
              .setDescription(
                `<@${winner.author_id}> won the giveaway of **${giveaway.what}**`
              )
              .setFooter({
                text: `Entries: ${entries.length}`,
              }),
          ],
          components: [],
        });

        //await actions.giveaways.delete(giveaway.id);
      }
    }
  }
});
