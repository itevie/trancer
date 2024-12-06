import { PermissionsBitField } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";
import { checkAutoban } from "../../events/guildMemberAdd";

const command: HypnoCommand<{ command?: string; value?: string }> = {
  name: "autoban",
  aliases: ["ab"],
  description: "Configure autoban settings for your server",
  guards: ["admin"],
  type: "admin",

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "string",
        oneOf: ["add", "remove", "enable", "disable", "list", "test"],
        name: "command",
      },
      {
        type: "any",
        name: "value",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    if (!args.command) {
      return message.reply({
        embeds: [
          createEmbed()
            .setTitle("Autoban Help")
            .setDescription(
              "This feature autobans members if their **username** or **display name** matches a keyword when they join." +
                (!message.guild.members.me.permissions.has(
                  PermissionsBitField.Flags.BanMembers
                )
                  ? "**\n\n:red_circle: Note: I do not have permissions to ban members.**"
                  : "")
            )
            .addFields([
              {
                name: "Commands",
                value: [
                  `\`${serverSettings.prefix}autoban enable\` - Enables the autoban`,
                  `\`${serverSettings.prefix}autoban disable\` - Disables the autoban`,
                  `\`${serverSettings.prefix}autoban list\` - List the keywords that are blocked`,
                  `\`${serverSettings.prefix}autoban add phrase\` - Adds "phrase" to the ban list`,
                  `\`${serverSettings.prefix}autoban remove phrase\` - Removes "phrase" from the ban list`,
                  `\`${serverSettings.prefix}autoban test username\` - Check if autoban detects a username`,
                ].join("\n"),
              },
              {
                name: "How",
                value: `When a user joins, it removes all whitespace from a their username & display name, and checks if any of the registered phrases match it, then bans them if so.`,
              },
            ]),
        ],
      });
    }

    let abk = serverSettings.auto_ban_keywords
      .split(";")
      .filter((x) => x.length !== 0);

    function createString(values: string[]): string {
      return `${
        values.length === 0
          ? "**There are no phrases banned**"
          : values.map((x) => `**${x}**`).join(",")
      }\n\nAutoban is: **${
        serverSettings.auto_ban_enabled
          ? `enabled :green_circle:`
          : "disabled :red_circle:"
      }**`;
    }

    switch (args.command) {
      case "list":
        return message.reply(`The current list is:\n\n${createString(abk)}`);
      case "add":
        if (!args.value)
          return message.reply("Please provide a phrase to add to autoban.");
        if (args.value.includes(";"))
          return message.reply("The phrase may not contain a semicolon.");
        let value = args.value.toLowerCase();
        if (abk.includes(value))
          return message.reply("That phrase has already been blocked.");
        abk.push(value);
        await database.run(
          `UPDATE server_settings SET auto_ban_keywords = ? WHERE server_id = ?;`,
          abk.join(";"),
          message.guild.id
        );
        return message.reply(`Phrase added!\n\n${createString(abk)}`);
      case "remove":
        if (!args.value)
          return message.reply("Please provide a phrase to add to autoban.");
        if (args.value.includes(";"))
          return message.reply("The phrase may not contain a semicolon.");
        let value2 = args.value.toLowerCase();
        if (!abk.includes(value2))
          return message.reply("That phrase has not been blocked.");
        abk.splice(abk.indexOf(value2), 1);
        await database.run(
          `UPDATE server_settings SET auto_ban_keywords = ? WHERE server_id = ?;`,
          abk.join(";"),
          message.guild.id
        );
        return message.reply(`Phrase removed!\n\n${createString(abk)}`);
      case "enable":
        if (serverSettings.auto_ban_enabled)
          return message.reply(`Autoban is already enabled.`);
        await database.run(
          `UPDATE server_settings SET auto_ban_enabled = true WHERE server_id = ?;`,
          message.guild.id
        );
        return message.reply(`Autoban has been enabled :green_circle:`);
      case "disable":
        if (!serverSettings.auto_ban_enabled)
          return message.reply(`Autoban is already disabled.`);
        await database.run(
          `UPDATE server_settings SET auto_ban_enabled = false WHERE server_id = ?;`,
          message.guild.id
        );
        return message.reply(`Autoban has been disabled :red_circle:`);
      case "test":
        if (!args.value)
          return message.reply("Please provide a username to test.");
        let result = checkAutoban(args.value, abk);
        return message.reply(
          `${
            result
              ? `:green_circle: **${args.value}** was detected by autoban`
              : `:red_circle: **${args.value}** was not detected by autoban`
          }`
        );
    }
  },
};

export default command;
