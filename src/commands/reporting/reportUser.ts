import { EmbedBuilder, PermissionFlagsBits, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import config from "../../config";
import ConfirmAction from "../../util/components/Confirm";

const command: HypnoCommand<{ user: User; reason: string }> = {
  name: "reportuser",
  description: "Report a dangerous user to other servers",
  type: "reporting",
  permissions: [PermissionFlagsBits.KickMembers],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
        description: "The user in question",
      },
      {
        name: "reason",
        type: "string",
        takeRest: true,
        description: "Reason & proof",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    if (!serverSettings.report_trusted)
      return message.reply(
        `Your server has not been trusted for reports yet. Please DM the bot owner (<@${config.owner}>)`
      );

    const user = args.user;
    const reason = args.reason;

    // Validate
    if (reason.length < 20)
      return message.reply(`Your report must be at least 20 characters long.`);
    if (message.attachments.size === 0)
      return message.reply(`Please provide at least one attachment as proof.`);

    const r: TrancerReport = {
      id: -1,
      created_at: new Date().toISOString(),
      user: user.id,
      author: message.author.id,
      server: message.guild.id,
      reason: reason,
      attachments: Array.from(message.attachments.entries())
        .map((x) => x[1].url)
        .join("\n"),
    };

    ConfirmAction({
      message,
      embed: (await actions.reports.generateEmbed(r)).embeds[0] as EmbedBuilder,
      async callback() {
        const report = await actions.reports.createReport(r);
        await actions.reports.send(report);
        return {
          content: "Sent! Thank you!",
        };
      },
    });
  },
};

export default command;
