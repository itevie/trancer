import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageCreateOptions,
  MessageEditOptions,
} from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const settingsToSql = {
  prefix: "prefix",
  subrole: "sub_role_id",
  tistrole: "tist_role_id",
  switchrole: "switch_role_id",
  bumps: "remind_bumps",
  invitelogger: "invite_logger_channel_id",
  bumpchannel: "bump_channel",
  levelnotify: "level_notifications",
} as const;

const settings = {
  prefix: "string",
  subrole: "role",
  tistrole: "role",
  switchrole: "role",
  bumps: "boolean",
  levelnotify: "boolean",
  invitelogger: "channel",
  bumpchannel: "channel",
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
    let currentSettings = await database.get<ServerSettings>(
      `SELECT * FROM server_settings WHERE server_id = (?)`,
      message.guild.id
    );
    const generateMessagePayload = async (): Promise<
      MessageCreateOptions | MessageEditOptions
    > => {
      const rows: ActionRowBuilder[] = [];
      let actionRow = new ActionRowBuilder();
      let current = "";
      for (const setting in settings) {
        if (actionRow.components.length >= 5) {
          rows.push(actionRow);
          actionRow = new ActionRowBuilder();
        }

        const val = currentSettings[settingsToSql[setting]];

        if (settings[setting] === "boolean") {
          current += `**${setting}**: ${val ? "true" : "false"}\n`;
          actionRow.addComponents(
            new ButtonBuilder()
              .setLabel(setting)
              .setCustomId(setting)
              .setStyle(
                currentSettings[settingsToSql[setting]]
                  ? ButtonStyle.Success
                  : ButtonStyle.Danger
              )
          );
        } else if (
          settings[setting] === "string" ||
          settings[setting] === "role"
        ) {
          current += `**${setting}**: ${val}\n`;
          actionRow.addComponents(
            new ButtonBuilder()
              .setLabel(setting)
              .setCustomId(setting)
              .setStyle(ButtonStyle.Primary)
          );
        } else if (settings[setting] === "channel") {
          current += `**${setting}**: <#${val}>\n`;
          actionRow.addComponents(
            new ButtonBuilder()
              .setLabel(setting)
              .setCustomId(setting)
              .setStyle(ButtonStyle.Primary)
          );
        }
      }

      if (actionRow.components.length !== 0) rows.push(actionRow);

      return {
        embeds: [
          createEmbed()
            .setTitle("Click on a button to change the setting")
            .setDescription(`Current settings:\n\n${current}`),
        ],
        // @ts-ignore
        components: rows,
      };
    };

    const msg = await message.reply(
      (await generateMessagePayload()) as MessageCreateOptions
    );

    let collector = msg.createMessageComponentCollector({
      filter: (x) => x.user.id === message.author.id,
      time: 1000 * 60 * 5,
    });

    collector.on("collect", async (i) => {
      const sql = settingsToSql[i.customId];
      switch (settings[i.customId]) {
        case "boolean":
          await database.run(
            `UPDATE server_settings SET ${sql} = ? WHERE server_id = ?;`,
            currentSettings[sql] ? false : true,
            i.guild.id
          );
          currentSettings[sql] = currentSettings[sql] ? false : true;
          await msg.edit(
            (await generateMessagePayload()) as MessageEditOptions
          );
          await i.deferUpdate();
          break;
        case "string":
        case "role":
        case "channel":
          await i.reply({
            content: `Send what you want "${i.customId}" to be in the next message. (type "null" if you want to remove the value)`,
            ephemeral: true,
          });
          const result = (
            await message.channel.awaitMessages({
              filter: (x) => x.author.id === message.author.id,
              max: 1,
            })
          ).at(0);

          let content = result.content;

          if (content !== "null") {
            switch (settings[i.customId]) {
              case "string":
                if (result.content.length >= 5)
                  return result.reply(
                    `Value must be less than 5, please press the button again to try again.`
                  );
                break;
              case "role":
                try {
                  content = content.replace(/[<@&>]/g, "");
                  await message.guild.roles.fetch(content);
                } catch {
                  return result.reply(
                    `Invalid role provided, please press the button again to try again.`
                  );
                }
              case "channel":
                try {
                  content = content.replace(/[<#>]/g, "");
                  await message.guild.channels.fetch(content);
                } catch {
                  return result.reply(
                    `Invalid channel provided, please press the button again to try again.`
                  );
                }
            }
          }

          if (content === "null") {
            try {
              await database.run(
                `UPDATE server_settings SET ${sql} = NULL WHERE server_id = ?;`,
                i.guild.id
              );
            } catch (e) {
              console.log(e);
              return result.reply(`"${i.customId}" cannot be null.`);
            }
            currentSettings[sql] = null;
          } else {
            await database.run(
              `UPDATE server_settings SET ${sql} = ? WHERE server_id = ?;`,
              content,
              i.guild.id
            );
            currentSettings[sql] = content;
          }
          await msg.edit(
            (await generateMessagePayload()) as MessageEditOptions
          );
          break;
      }
    });
  },
};

export default command;
