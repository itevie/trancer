import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Message,
  MessageEditOptions,
  PermissionFlagsBits,
  User,
} from "discord.js";
import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { actions } from "../../util/database";

const command: HypnoCommand<{ user: User }> = {
  name: "reportwizard",
  aliases: ["reportwiz"],
  description: "More interactive version of reportuser",
  permissions: [PermissionFlagsBits.KickMembers],
  type: "reporting",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    if (!serverSettings.report_trusted)
      return message.reply(
        `Your server has not been trusted for reports yet. Please DM the bot owner (<@${config.owner}>)`
      );

    let reason: string = ``;
    let attachments: string[] = [];

    function genReport(): TrancerReport {
      return {
        id: -1,
        author: message.author.id,
        server: message.guild.id,
        user: args.user.id,
        reason: reason || "*No Reason - please provide*",
        attachments: attachments.join("\n"),
        created_at: new Date().toISOString(),
      };
    }

    let msg = await message.reply({
      ...(await actions.reports.generateEmbed(genReport())),
      components: [
        // @ts-ignore
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setCustomId("set-reason")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Set Reason"),

          new ButtonBuilder()
            .setCustomId("add-attachment")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Add Attachment"),
          new ButtonBuilder()
            .setCustomId("cancel")
            .setStyle(ButtonStyle.Danger)
            .setLabel("Cancel"),
          new ButtonBuilder()
            .setCustomId("send")
            .setStyle(ButtonStyle.Success)
            .setLabel("Send")
        ),
      ],
    });

    let collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
    });

    collector.on("collect", async (i) => {
      switch (i.customId) {
        case "set-reason":
          await i.reply({
            content: `Please send the reason as your next message`,
            ephemeral: true,
          });

          break;
        case "add-attachment":
          await i.reply({
            content: `Please send the attachment in your next message (not as a URL - use the discord + button, you can send multiple at once)`,
            ephemeral: true,
          });
          break;
        case "cancel":
          collector.stop();
          await msg.edit({
            components: [],
            embeds: [],
            content: "Cancelled",
          });
          return;
        case "send":
          if (!reason)
            return await i.reply({
              content: "Please provide a reason",
              ephemeral: true,
            });
          if (attachments.length === 0)
            return await i.reply({
              content: `Please provide at least one attachment`,
              ephemeral: true,
            });

          collector.stop();
          const report = await actions.reports.createReport(genReport());
          await actions.reports.send(report);
          await i.reply({
            content: `Thank you for your report! It has been sent to all servers`,
            ephemeral: true,
          });
          await msg.edit({
            components: [],
          });
          return;
      }

      const m: Message<boolean> = (
        await i.channel.awaitMessages({
          filter: (x) => x.author.id === message.author.id,
          max: 1,
        })
      ).at(0);

      switch (i.customId) {
        case "set-reason":
          if (m.content.length < 20)
            return await m.reply({
              content:
                "Reason must be at least 20 characters - press the button and try again",
            });
          reason = m.content;
          break;
        case "add-attachment":
          if (m.attachments.size === 0) return await m.reply(`❌`);
          attachments = [
            ...attachments,
            ...Array.from(m.attachments.entries()).map((x) => x[1].url),
          ];
          break;
      }

      await m.react("👍");

      await msg.edit({
        ...((await actions.reports.generateEmbed(
          genReport()
        )) as MessageEditOptions),
      });
    });
  },
};

export default command;
