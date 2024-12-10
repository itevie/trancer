import { HypnoCommand } from "../../types/util";
import { createSettingsPage } from "../../util/components/settingsPanel";
import { getServerSettings } from "../../util/actions/settings";
import { database } from "../../util/database";

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
} as const;

const command: HypnoCommand<{
  setting: keyof typeof settingsToSql;
  value: any;
}> = {
  name: "serversettings",
  aliases: ["sset"],
  description: "Modify a server setting",
  type: "admin",
  guards: ["admin"],

  handler: async (message) => {
    return createSettingsPage({
      title: "Server Settings",
      message,
      dbData: await getServerSettings(message.guild.id),
      options: [
        {
          dbName: "prefix",
          human: "Prefix",
          type: "string",
          maxLength: 3,
        },
        {
          dbName: "remind_bumps",
          human: "Remind Bumps",
          type: "boolean",
        },
        {
          dbName: "bump_channel",
          human: "Bump Channel",
          type: "channel",
          botHasPermissions: ["SendMessages"],
        },
        {
          dbName: "level_notifications",
          human: "Level Notifications",
          type: "boolean",
        },
        {
          dbName: "invite_logger_channel_id",
          human: "Invite Logger Channel",
          type: "channel",
          botHasPermissions: ["SendMessages"],
        },
        {
          dbName: "verification_role_id",
          human: "Verification Role",
          type: "role",
        },
        {
          dbName: "verified_channel_id",
          human: "Verification Channel",
          type: "channel",
        },
        {
          dbName: "verified_string",
          human: "Verified Message",
          type: "uservarstring",
        },

        {
          dbName: "sub_role_id",
          human: "Sub Role",
          type: "role",
        },
        {
          dbName: "tist_role_id",
          human: "Tist Role",
          type: "role",
        },
        {
          dbName: "switch_role_id",
          human: "Switch Role",
          type: "role",
        },
      ],
      onChange: async (key, value) => {
        return await database.get<ServerSettings>(
          `UPDATE server_settings SET ${key} = ? WHERE server_id = ? RETURNING *;`,
          value,
          message.guild.id
        );
      },
    });
  },
};

export default command;
