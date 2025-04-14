import { PermissionFlagsBits } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createSettingsPage } from "../../util/components/settingsPanel";
import { actions, database } from "../../util/database";

const settingsToSql = {
  prefix: "prefix",
  subrole: "sub_role_id",
  tistrole: "tist_role_id",
  switchrole: "switch_role_id",
  bumps: "remind_bumps",
  invitelogger: "invite_logger_channel_id",
  bumpchannel: "bump_channel",
  levelnotify: "level_notifications",
  verificationrole: "verification_role_id",
  verifiedmessage: "verified_string",
  verifiedchannel: "verified_channel_id",
  quoteschannel: "quotes_channel_id",
  reportchannel: "report_channel",
} as const;

const command: HypnoCommand<{
  setting: keyof typeof settingsToSql;
  value: any;
}> = {
  ignore: true,
  name: "serversettings",
  aliases: ["sset"],
  description: "Modify a server setting",
  type: "admin",
  guards: ["admin"],

  handler: async (message) => {
    return createSettingsPage({
      title: "Server Settings",
      message,
      dbData: await actions.serverSettings.getFor(message.guild.id),
      options: [
        {
          dbName: "prefix",
          human: "Prefix",
          type: "string",
          description: "The prefix for the bot",
          maxLength: 3,
        },
        {
          dbName: "remind_bumps",
          human: "Remind Bumps",
          description: "Whether or not the bot should ping people for /bump",
          type: "boolean",
        },
        {
          dbName: "bump_channel",
          human: "Bump Channel",
          type: "channel",
          description: "The channel where bumps should be done",
          botHasPermissions: ["SendMessages"],
        },
        {
          dbName: "level_notifications",
          human: "Level Notifications",
          description:
            "Whether or not the bot should reply to people that they've levelled up",
          type: "boolean",
        },
        {
          dbName: "invite_logger_channel_id",
          human: "Invite Logger Channel",
          type: "channel",
          description:
            "The place where the bot should send invite details (set to null to disable)",
          botHasPermissions: ["SendMessages"],
        },
        {
          dbName: "quotes_channel_id",
          human: "Quotes Channel",
          type: "channel",
          description:
            "When someone is quoted (.q'd) their quote will be sent here",
          botHasPermissions: ["SendMessages"],
        },
        {
          dbName: "verification_role_id",
          human: "Verification Role",
          description: "The role to be given when someone is verified with .v",
          type: "role",
        },
        {
          dbName: "verified_channel_id",
          human: "Verification Channel",
          description: "The channel where the verified message should be sent",
          type: "channel",
        },
        {
          dbName: "verified_string",
          human: "Verified Message",
          description: "The contents of the verified message",
          type: "uservarstring",
        },
        {
          dbName: "report_channel",
          human: "Report Channel",
          description:
            "Where user reports should be sent (needs send, attach and embed perms)",
          type: "channel",
        },
        {
          dbName: "report_ban_log_channel",
          human: "Report Ban Log Channel",
          description:
            "Where Trancer should send successful kicks/bans (using the report embed)",
          type: "channel",
        },
        {
          dbName: "sub_role_id",
          human: "Sub Role",
          description: "The role of your subjects",
          type: "role",
        },
        {
          dbName: "tist_role_id",
          human: "Tist Role",
          description: "The role of your tists",
          type: "role",
        },
        {
          dbName: "switch_role_id",
          human: "Switch Role",
          description: "The role of your switches",
          type: "role",
        },
      ],
      onChange: async (key, value) => {
        return await database.get<ServerSettings>(
          `UPDATE server_settings SET ${key} = ? WHERE server_id = ? RETURNING *;`,
          value,
          message.guild.id,
        );
      },
    });
  },
};

export default command;
