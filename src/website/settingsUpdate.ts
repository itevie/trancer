import {
  Guild,
  GuildTextBasedChannel,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { actions, database } from "../util/database";
import { client } from "..";
import statusThemes from "../commands/hypnosis/_util";

const settingsUpdate: {
  [key: string]: {
    type:
      | "channel"
      | "role"
      | "boolean"
      | "status_theme"
      | "string"
      | "varstring";
    botNeeds?: PermissionResolvable[];
    table: string;
    row: string;
    botMustBeAbove?: boolean;
    min?: number;
    max?: number;
    nullable?: boolean;
  };
} = {
  prefix: {
    type: "string",
    table: "server_settings",
    row: "prefix",
    min: 1,
    max: 5,
  },
  invite_log_channel: {
    type: "channel",
    botNeeds: ["SendMessages", "EmbedLinks"],
    table: "server_settings",
    row: "invite_logger_channel_id",
  },
  quotes_channel: {
    type: "channel",
    botNeeds: ["SendMessages", "EmbedLinks"],
    table: "server_settings",
    row: "quotes_channel_id",
  },
  status_theme: {
    type: "status_theme",
    table: "server_settings",
    row: "status_theme",
  },
  tist_role: {
    type: "role",
    table: "server_settings",
    row: "tist_role_id",
  },
  sub_role: {
    type: "role",
    table: "server_settings",
    row: "sub_role_id",
  },
  switch_role: {
    type: "role",
    table: "server_settings",
    row: "switch_role_id",
  },
  bump_channel: {
    type: "channel",
    botNeeds: ["SendMessages", "EmbedLinks"],
    table: "server_settings",
    row: "bump_channel",
  },
  remind_bumps: {
    type: "boolean",
    table: "server_settings",
    row: "remind_bumps",
  },
  level_notifications: {
    type: "boolean",
    table: "server_settings",
    row: "level_notifications",
  },
  unverified_role: {
    type: "role",
    botMustBeAbove: true,
    table: "server_settings",
    row: "unverified_role_id",
  },
  verified_role: {
    type: "role",
    botMustBeAbove: true,
    table: "server_settings",
    row: "verification_role_id",
  },
  verified_message: {
    type: "varstring",
    table: "server_settings",
    row: "verified_string",
    min: 1,
    max: 1000,
  },
  verified_channel: {
    type: "channel",
    botNeeds: ["SendMessages", "EmbedLinks"],
    table: "server_settings",
    row: "verified_channel_id",
  },
  welcome_message: {
    type: "varstring",
    table: "server_settings",
    row: "welcome_message",
    min: 1,
    max: 1000,
  },
  welcome_channel: {
    type: "channel",
    botNeeds: ["SendMessages", "EmbedLinks"],
    table: "server_settings",
    row: "welcome_channel_id",
  },
  leave_message: {
    type: "varstring",
    table: "server_settings",
    row: "leave_message",
    min: 1,
    max: 1000,
  },
  leave_channel: {
    type: "channel",
    botNeeds: ["SendMessages", "EmbedLinks"],
    table: "server_settings",
    row: "leave_channel_id",
  },
  auto_ban_keywords: {
    type: "string",
    table: "server_settings",
    row: "auto_ban_keywords",
    min: 5,
    max: 2000,
  },
  auto_ban_enabled: {
    type: "boolean",
    table: "server_settings",
    row: "auto_ban_enabled",
  },
  report_channel: {
    type: "channel",
    table: "server_settings",
    botNeeds: ["SendMessages", "EmbedLinks"],
    row: "report_channel",
  },
  report_ban_log_channel: {
    type: "channel",
    table: "server_settings",
    botNeeds: ["SendMessages", "EmbedLinks"],
    row: "report_ban_log_channel",
  },
  allow_nsfw_sources: {
    type: "boolean",
    table: "server_settings",
    row: "allow_nsfw_file_directory_sources",
  },
};

export async function getWebsiteSettingsFor(
  serverId: string
): Promise<{ [key: string]: string }> {
  const tables = {
    server_settings: await actions.serverSettings.getFor(serverId),
  };

  const sorted: { [key: string]: string } = {};

  for (const setting in settingsUpdate) {
    let v = tables[settingsUpdate[setting].table][settingsUpdate[setting].row];
    if (settingsUpdate[setting].type === "boolean") v = v ? true : false;
    sorted[setting] = v === undefined ? null : v;
  }

  return sorted;
}

export async function saveWebsiteSettingsFor(
  server: Guild,
  data: { [key: string]: string }
): Promise<string | null> {
  if (typeof data !== "object") return "Expected object!";

  for await (const [key, value] of Object.entries(data)) {
    if (!settingsUpdate[key]) return `${key} is not a valid setting`;
    const setting = settingsUpdate[key];
    let v: any;

    if (
      value === null &&
      (setting.nullable === false || setting.type === "boolean")
    )
      return `${key} cannot be null`;
    if (value === null) v = null;

    if (v !== null) {
      switch (setting.type) {
        case "boolean":
          if (value.toString() === "true") v = true;
          else if (value.toString() === "false") v = false;
          else return `Expected boolean true or false for ${key}`;
          break;
        case "channel": {
          try {
            // Fetch
            const channel = await client.channels.fetch(value);

            // Check if text
            if (!channel.isTextBased())
              return `Expected text-based channel for ${key}`;

            // Check permissions
            for (const perm of setting.botNeeds ?? []) {
              if (
                !server.members.me.permissionsIn(
                  channel as GuildTextBasedChannel
                )
              )
                return `Bot needs permission ${perm} in channel ${channel.id} for key ${key}`;
            }

            // Done
            v = channel.id;
          } catch {
            return "Invalid role!";
          }
          break;
        }
        case "role": {
          try {
            // Fetch
            const role = await server.roles.fetch(value);

            if (
              setting.botMustBeAbove &&
              role.position > server.members.me.roles.highest.position
            )
              return `The bot's role must be higher than ${role.name} for key ${key}!`;

            // Done
            v = role.id;
          } catch {
            return "Invalid role!";
          }
          break;
        }
        case "status_theme":
          if (!Object.keys(statusThemes).includes(value))
            return `Invalid value for ${key}, please give one of ${Object.keys(
              statusThemes
            )}`;
          v = value;
          break;
        case "string":
        case "varstring":
          if (setting.min && value.length < setting.min)
            return `String ${key} too short, must be at least ${setting.min} characters in length`;
          if (setting.max && value.length > setting.max)
            return `String ${key} too long, must be at most ${setting.max} characters in length`;
          v = value;
          break;
      }
    }

    if (v === undefined) return "An unknown error occurred!";
    await database.run(
      `UPDATE ${setting.table} SET ${setting.row} = ? WHERE server_id = ?`,
      v,
      server.id
    );
  }

  return null;
}

export default settingsUpdate;
