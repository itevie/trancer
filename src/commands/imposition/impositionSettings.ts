import { HypnoCommand } from "../../types/util";
import {
  getImposition,
  impositionSetEnabled,
  setImpositionChance,
  setImpositionEvery,
  setupImposition,
} from "../../util/actions/imposition";
import { getServerSettings } from "../../util/actions/settings";
import { database } from "../../util/database";

const command: HypnoCommand = {
  name: "impositionsettings",
  aliases: ["is", "impsettings", "imposettings", "imposet"],
  description: "Modify random imposition settings in the current channel",
  type: "imposition",
  usage: [
    ["$cmd enable", "Enables random imposition in the current channel"],
    ["$cmd disable", "Disables random imposition in the current channel"],
    [
      "$cmd chance <number 0-100>",
      "Sets the chance a random imposition will be sent",
    ],
    ["$cmd every <minutes>", "How many minutes between each random imposition"],
    [
      "$cmd details",
      "Get details on how the randomness will work in this channel (admin exception)",
    ],
    ["$cmd where", "See which channels in this server have imposition enabled"],
  ],
  guards: ["admin"],

  except: (_, args) => args[0] === "details",
  handler: async (message, { oldArgs: args }) => {
    // Check if arg
    if (!args[0])
      return message.reply(
        `Please provide a subcommand, see \`${
          (await getServerSettings(message.guild.id)).prefix
        }cmd is\``
      );

    // Fetch imposition settings
    await setupImposition(message.channel.id);
    const imposition = await getImposition(message.channel.id);

    // Do it
    switch (args[0]) {
      case "enable":
        await impositionSetEnabled(message.channel.id, true);
        return await message.reply(
          `Enabled imposition for this channel! Have fun :cyclone:`
        );
      case "disable":
        await impositionSetEnabled(message.channel.id, false);
        return await message.reply(`Disabled imposition for this channel!`);
      case "chance":
        if (!args[1])
          return message.reply(
            `Expected a second argument with the chance. Examples: 60, 46\nCurrent is: ${imposition.chance}%`
          );

        const chanceValue = parseInt(args[1]);
        if (Number.isNaN(chanceValue) || chanceValue > 100 || chanceValue < 0)
          return message.reply(`Invalid number provided!`);

        await setImpositionChance(message.channel.id, chanceValue);
        return await message.reply(
          `There will now be a **${chanceValue}%** chance a random imposition will be sent every **${imposition.every}** minutes`
        );
      case "every":
        if (!args[1])
          return message.reply(
            `Expected a second argument with the minutes. Examples: 10, 5\nCurrent is: ${imposition.every}`
          );

        const everyValue = parseInt(args[1]);
        if (Number.isNaN(message))
          return message.reply(`Invalid number provided!`);

        await setImpositionEvery(message.channel.id, everyValue);
        return await message.reply(
          `There will now be a **${imposition.chance}%** chance a random imposition will be sent every **${everyValue}** minutes`
        );
      case "details":
        if (!imposition.is_enabled)
          return await message.reply(`Imposition is disabled in this channel!`);
        return await message.reply(
          `Every **${imposition.every} minutes**, I will attempt to send an action, only **${imposition.chance}%** of the time will it succeed`
        );
      case "where":
        const channels = (await message.guild.channels.fetch()).map(
          (x) => x.id
        );
        const whereResult = (
          await database.all(
            `SELECT * FROM channel_imposition WHERE channel_id IN (${channels
              .map((x) => `'${x}'`)
              .join(", ")}) AND is_enabled = true;`
          )
        ).map((x) => x.channel_id);
        return message.reply(
          `In this server, imposition is in the following channels: ${whereResult
            .map((x) => `<#${x}>`)
            .join(", ")}`
        );
    }
  },
};

export default command;
