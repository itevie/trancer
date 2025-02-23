import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageCreateOptions,
} from "discord.js";
import { client } from "../..";
import { createEmbed } from "../other";
import { database } from "../database";

const _actions = {
  createReport: async (
    report: Omit<TrancerReport, "id" | "created_at">
  ): Promise<TrancerReport> => {
    return await database.get<TrancerReport>(
      `INSERT INTO reports (user, author, server, reason, attachments, created_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
      report.user,
      report.author,
      report.server,
      report.reason,
      report.attachments,
      new Date().toISOString()
    );
  },

  getById: async (id: number): Promise<TrancerReport | undefined> => {
    return await database.get<TrancerReport>(
      "SELECT * FROM reports WHERE id = ?",
      id
    );
  },

  getReportChannels: async (): Promise<ServerSettings[]> => {
    return await database.all<ServerSettings[]>(
      `SELECT * FROM server_settings WHERE report_channel IS NOT NULL`
    );
  },

  send: async (report: TrancerReport) => {
    const servers = await _actions.getReportChannels();
    const embed = await _actions.generateEmbed(report);
    for await (const server of servers) {
      try {
        const channel = await client.channels.fetch(server.report_channel);
        if (channel.isTextBased()) {
          await channel.send({
            ...embed,
            components: [
              // @ts-ignore
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`reporting-${report.id}-ban`)
                  .setLabel(`Ban`)
                  .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                  .setCustomId(`reporting-${report.id}-kick`)
                  .setLabel(`Kick`)
                  .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                  .setCustomId(`reporting-${report.id}-incorrect`)
                  .setLabel(`Report Incorrect`)
                  .setStyle(ButtonStyle.Danger)
              ),
            ],
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  },

  generateEmbed: async (
    report: TrancerReport,
    small: boolean = false
  ): Promise<MessageCreateOptions> => {
    const user = await client.users.fetch(report.user);
    const author = await client.users.fetch(report.author);
    const server = await client.guilds.fetch(report.server);
    const reason = report.reason;
    const attachments = report.attachments.split("\n").filter((x) => x.trim());

    const embed = createEmbed()
      .setTitle(`New report for ${user.username} (${user.id})`)
      .setDescription(`**Reason:** ${reason}`)
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setFooter({
        text: `Report ID: ${report.id}`,
        iconURL: server.iconURL(),
      });

    if (!small) {
      embed.addFields([
        {
          name: "Details",
          value: [
            ["Author", `<@${author.id}>`],
            ["Author ID", author.id],
            ["Server", `${server.name}`],
            ["Server ID", `${server.id}`],
            ["Reportee", `<@${user.id}>`],
            ["Reportee ID", author.id],
            ["Attachments", `${attachments.length} (see above links)`],
          ]
            .map((x) => `**${x[0]}**: ${x[1]}`)
            .join("\n"),
        },
      ]);
    }

    if (attachments.length === 1) embed.setImage(attachments[0]);

    return {
      content: attachments.join(" "),
      embeds: [embed],
    };
  },
} as const;

export default _actions;
