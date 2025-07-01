import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { client, commands } from "..";
import { calculateLevel } from "../messageHandlers/xp";
import { actions } from "../util/database";
import { generateEmbed } from "../commands/server/startGiveaway";
import { createEmbed } from "../util/other";
import config from "../config";

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
          giveaway.channel_id,
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
                .setStyle(ButtonStyle.Secondary),
            ),
          ],
        });

        const channel = (await client.channels.fetch(
          giveaway.channel_id,
        )) as TextChannel;
        const message = await channel.messages.fetch(giveaway.message_id);
        await message.edit({
          embeds: [
            createEmbed()
              .setTitle("Giveaway Over!")
              .setDescription(
                `<@${winner.author_id}> won the giveaway of **${giveaway.what}**`,
              )
              .setFooter({
                text: `Entries: ${entries.length}`,
              }),
          ],
          components: [],
        });

        //await actions.giveaways.delete(giveaway.id);
      }
    } else if (i.customId.startsWith("reporting-")) {
      const serverSettings = await actions.serverSettings.getFor(i.guild.id);
      const member = await i.guild.members.fetch(i.member.user.id);
      const parts = i.customId.match(/reporting-(\d+)-([a-z]+)/);
      if (!parts)
        return await i.reply({ content: "Invalid action", ephemeral: true });

      const report = await actions.reports.getById(parseInt(parts[1]));
      if (!report)
        return await i.reply({
          content: "Failed to fetch the report",
          ephemeral: true,
        });

      const action = parts[2] as "ban" | "kick" | "incorrect";

      if (action === "incorrect") {
        return i.reply({
          content: `Please DM <@${config.owner}> your issue with this report`,
          ephemeral: true,
        });
      }

      const permissionMap = {
        ban: PermissionFlagsBits.BanMembers,
        kick: PermissionFlagsBits.KickMembers,
      };

      const userPermission = permissionMap[action];
      if (!member.permissions.has(userPermission))
        return await i.reply({
          content: `You do not have permission to ${action} members`,
          ephemeral: true,
        });

      if (!i.guild.members.me.permissions.has(userPermission))
        return await i.reply({
          content: `I do not have permission to ${action} members`,
          ephemeral: true,
        });

      try {
        if (action === "ban") {
          await i.guild.members.ban(report.user, {
            reason: `${report.reason} - (report ID #${report.id})`,
          });
        } else {
          const toKick = await i.guild.members.fetch(report.user);
          await toKick.kick(`${report.reason} - (report ID #${report.id})`);
        }
        await i.reply({
          content: `Member ${action === "ban" ? "bann" : action}ed!`,
        });

        if (serverSettings.report_ban_log_channel) {
          const channel = await i.client.channels.fetch(
            serverSettings.report_ban_log_channel,
          );
          if (channel.isTextBased()) {
            await channel.send(
              await actions.reports.generateEmbed(report, true),
            );
          }
        }
      } catch (e) {
        console.error(e);
        await i.reply({
          content: "An error occurred: " + e.toString(),
          ephemeral: true,
        });
      }
    } else if (i.customId.startsWith("delete-confession-")) {
      const id = i.customId.match(/[0-9]+/)[0];
      const confession = await actions.confessions.get(parseInt(id));

      if (confession.user_id !== i.user.id)
        return i.reply({
          ephemeral: true,
          content: `You did not write this confession. If you are a mod, use the \`deleteconfession\` command!`,
        });

      try {
        await actions.confessions.delete(confession.id);

        try {
          const msg = await i.channel.messages.fetch(confession.message_id);
          await msg.delete();
          return i.reply({
            ephemeral: true,
            content: "Confession deleted!",
          });
        } catch (e) {
          return i.reply({
            ephemeral: true,
            content: `Failed to delete the message containing the confession, but it has been deleted from the database`,
          });
        }
      } catch (e) {
        return i.reply({
          ephemeral: true,
          content: "Failed to delete the confession",
        });
      }
    } else if (i.customId.startsWith("command-help-")) {
      const name = i.customId.split("-").slice(2).join("-");
      // @ts-ignore
      commands["command"].handler(
        // @ts-ignore
        {
          // @ts-ignore
          reply: i.reply.bind(i),
          author: i.user,
        },
        {
          args: { command: name },
          serverSettings: await actions.serverSettings.getFor(i.guild.id),
        },
      );
    }
  }
});
