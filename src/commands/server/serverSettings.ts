import { PermissionsBitField, TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { checkBoolean, createEmbed } from "../../util/other";

const settingsToSql = {
  prefix: "prefix",
  subrole: "sub_role_id",
  tistrole: "tist_role_id",
  switchrole: "switch_role_id",
  bumps: "remind_bumps",
  invitelogger: "invite_logger_channel_id",
  bumpchannel: "bump_channel",
};

const settings = {
  prefix: "string",
  subrole: "role",
  tistrole: "role",
  switchrole: "role",
  bumps: "boolean",
  invitelogger: "id",
  bumpchannel: "id",
};

const command: HypnoCommand<{
  setting: keyof typeof settingsToSql;
  value: any;
}> = {
  name: "serversettings",
  aliases: ["sset"],
  description: "Modify a server setting",
  type: "admin",
  guards: ["admin"],

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "setting",
        type: "string",
        oneOf: [
          "prefix",
          "subrole",
          "tistrole",
          "switchrole",
          "bumps",
          "invitelogger",
          "bumpchannel",
        ],
      },
      {
        name: "value",
        type: "any",
      },
    ],
  },

  handler: async (message, { args }) => {
    const currentSettings = await database.get(
      `SELECT * FROM server_settings WHERE server_id = (?)`,
      message.guild.id
    );

    if (!args.setting && !args.value) {
      let current = "";
      for (const i in currentSettings) {
        let key = null;
        for (const x in settingsToSql)
          if (settingsToSql[x] === i) {
            key = x;
            break;
          }
        if (!key) continue;
        current += `**${key}**: ${currentSettings[i]}\n`;
      }

      // Send
      return message.reply({
        embeds: [
          createEmbed()
            .setTitle("Please provide an option to change")
            .setDescription(`Current settings:\n\n${current}`)
            .addFields([
              {
                name: "Options",
                value: Object.keys(settings)
                  .map((x) => `\`${x}\``)
                  .join(", "),
              },
            ]),
        ],
      });
    }

    if (!args.value)
      return message.reply(`Please provide an **${settings[args.setting]}**!`);

    // Check if it is the custom ID type
    if (
      settings[args.setting] === "role" &&
      !args.value.match(/^((<&)?[0-9]+>?)$/)
    )
      return message.reply(
        `Invalid ID, please provide an ID, or a mention of the ID`
      );
    if (
      settings[args.setting] === "boolean" &&
      checkBoolean(args.value) === null
    )
      return message.reply(`Please provided yes or no!`);

    // Get content
    const value =
      settings[args.setting] === "id" || settings[args.setting] === "role"
        ? args.value.replace(/[<>#&@]/g, "")
        : settings[args.setting] === "boolean"
        ? checkBoolean(args.value)
        : args.value;

    if (args.setting === "invitelogger" || args.setting === "bumpchannel") {
      let channel: TextChannel;
      try {
        channel = (await message.guild.channels.fetch(value)) as TextChannel;
      } catch (err) {
        return message.reply(`Failed to fetch the channel :(`);
      }

      if (
        !message.guild.members.me
          .permissionsIn(channel.id)
          .has(PermissionsBitField.Flags.SendMessages)
      ) {
        return message.reply(
          `I don't have permissions to send messages in that channel!`
        );
      }
    }

    // Do it
    await database.run(
      `UPDATE server_settings SET ${
        settingsToSql[args.setting]
      } = (?) WHERE server_id = (?)`,
      value,
      message.guild.id
    );
    return message.reply(
      `Property **${args.setting}** updated to **${value}**!`
    );
  },
};

export default command;
