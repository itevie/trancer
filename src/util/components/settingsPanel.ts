import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  MessageEditOptions,
  MessageReplyOptions,
  PermissionResolvable,
} from "discord.js";
import { createEmbed } from "../other";

type OptionTypes = "string" | "role" | "channel" | "uservarstring" | "boolean";

interface SettingsPageOptions<D extends any> {
  message: Message;
  options: PageOption[];
  dbData: D;
  title: string;
  onChange: (dbName: string, value: any) => Promise<D>;
}

interface BasePageOption {
  type: OptionTypes;
  human: string;
  dbName: string;
  description: string;
}

interface PageStringOption extends BasePageOption {
  type: "string" | "uservarstring";
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  nullable?: boolean;
}

interface PageBooleanOption extends BasePageOption {
  type: "boolean";
}

interface PageRoleOption extends BasePageOption {
  type: "role";
  nullable?: boolean;
}

interface PageChannelOption extends BasePageOption {
  type: "channel";
  botHasPermissions?: PermissionResolvable;
  nullable?: boolean;
}

type PageOption =
  | PageStringOption
  | PageBooleanOption
  | PageRoleOption
  | PageChannelOption;

export async function createSettingsPage<D extends any>(
  _options: SettingsPageOptions<D>
) {
  async function generateMessage(): Promise<
    MessageReplyOptions & MessageEditOptions
  > {
    let parts: [string, string, string][] = [];
    let components: ActionRowBuilder[] = [];
    let currentRow: ActionRowBuilder = new ActionRowBuilder();

    for await (const option of _options.options) {
      parts.push([
        option.human,
        await getHumanData(
          _options.dbData[option.dbName],
          option.type,
          _options.message
        ),
        option.description,
      ]);

      if (currentRow.components.length === 5) {
        components.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`modify;${option.dbName}`)
          .setLabel(option.human)
          .setStyle(
            option.type === "boolean"
              ? _options.dbData[option.dbName]
                ? ButtonStyle.Success
                : ButtonStyle.Danger
              : ButtonStyle.Primary
          )
      );
    }

    if (currentRow.components.length !== 0) components.push(currentRow);

    let embed = createEmbed()
      .setTitle(_options.title)
      .setDescription(
        parts.map((x) => `**${x[0]}**: ${x[1]}\n-# ${x[2]}`).join("\n\n")
      )
      .addFields([
        {
          name: "Note",
          value:
            "Click a button to change the setting.\nThis embed will update as you change them.\nType .cancel if you want to cancel inputting a value.",
        },
      ]);

    return {
      embeds: [embed],
      // @ts-ignore
      components,
    };
  }

  let message = await _options.message.reply(await generateMessage());

  let collector = message.createMessageComponentCollector({
    filter: (i) => i.user.id === _options.message.author.id,
  });

  collector.on("collect", async (i) => {
    let optionName = i.customId.split(";")[1];
    let option = _options.options.find((x) => x.dbName === optionName);

    let cancelString = ".cancel";

    let newValue: any = undefined;

    switch (option.type) {
      case "boolean":
        await i.deferUpdate();
        newValue = _options.dbData[option.dbName] ? false : true;
        break;
      case "string":
      case "uservarstring":
        let stext = "Send the value as your next message";
        if (option.type === "uservarstring")
          stext += `\n\nVariables:\n{mention} - Mentions the target user\n{username} - The taget user's username`;
        if (option.minLength) stext += `\nMinimum length: ${option.minLength}`;
        if (option.maxLength) stext += `\nMaximum length: ${option.maxLength}`;

        await i.reply({
          content: stext,
          ephemeral: true,
        });

        let sresponse = (
          await message.channel.awaitMessages({
            max: 1,
            filter: (x) => x.author.id === _options.message.author.id,
          })
        ).at(0);

        if (sresponse.content.toLowerCase() === cancelString)
          return await sresponse.react("👍");

        if (option.minLength && sresponse.content.length < option.minLength)
          return message.reply(
            `The value must be at least **${option.minLength}** in length.`
          );
        if (option.maxLength && sresponse.content.length > option.maxLength)
          return message.reply(
            `The value must be at most **${option.maxLength}** in length.`
          );
        if (option.regex && !sresponse.content.match(option.regex))
          return message.reply(
            `Invalid format provided! It must match: ${option.regex.toString()}`
          );

        newValue = sresponse.content;
        break;
      case "channel":
        await i.reply({
          content: "Send the channel as your next message.",
          ephemeral: true,
        });

        let cresponse = (
          await message.channel.awaitMessages({
            max: 1,
            filter: (x) => x.author.id === _options.message.author.id,
          })
        ).at(0);

        if (cresponse.content.toLowerCase() === cancelString)
          return await cresponse.react("👍");

        if (!cresponse.content.match(/<?#[0-9]+?>?/))
          return await cresponse.reply({
            content: "Invalid channel format provided!",
          });

        try {
          let channel = await _options.message.guild.channels.fetch(
            cresponse.content.replace(/[<>#]/g, "")
          );

          newValue = channel.id;
        } catch (e) {
          return await cresponse.reply({
            content: `Failed to fetch the channel: ${e.toString()}`,
          });
        }
        break;
      case "role":
        await i.reply({
          content: "Send the role as your next message.",
          ephemeral: true,
        });

        let rresponse = (
          await message.channel.awaitMessages({
            max: 1,
            filter: (x) => x.author.id === _options.message.author.id,
          })
        ).at(0);

        if (rresponse.content.toLowerCase() === cancelString)
          return await rresponse.react("👍");

        if (!rresponse.content.match(/<?@?&?[0-9]+?>?/))
          return await rresponse.reply({
            content: "Invalid role format provided!",
          });

        try {
          let role = await _options.message.guild.roles.fetch(
            rresponse.content.replace(/[<>@&]/g, "")
          );

          newValue = role.id;
        } catch (e) {
          return await rresponse.reply({
            content: `Failed to fetch the role: ${e.toString()}`,
          });
        }
        break;
      default:
        return await i.reply({
          // @ts-ignore
          content: `Sorry, but I don't know how to handle **${option.type}**.`,
          ephemeral: true,
        });
    }

    if (newValue === undefined)
      return await i.reply({
        content: `No value was provided, cancelling.`,
        ephemeral: true,
      });

    _options.dbData = await _options.onChange(option.dbName, newValue);
    await message.edit(await generateMessage());
  });
}

export async function getHumanData(
  val: any,
  _type: OptionTypes,
  _message: Message
) {
  switch (_type) {
    case "boolean":
      return val ? "yes" : "no";
    case "role":
      try {
        return `<@&${(await _message.guild.roles.fetch(val)).id}>`;
      } catch {
        return "Failed to fetch";
      }
    case "channel":
      try {
        return `<#${(await _message.guild.channels.fetch(val)).id}>`;
      } catch {
        return "Failed to fetch";
      }
    default:
      return val;
  }
}
