import { client, commands, handlers } from "..";
import config from "../config";
import { HypnoCommandDetails } from "../types/util";
import { addCommandUsage, addMessageForCurrentTime } from "../util/analytics";
import { checkBadges } from "../util/badges";
import { actions } from "../util/database";
import { compareTwoStrings, createEmbed, englishifyList } from "../util/other";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  TextChannel,
} from "discord.js";
import megaAliases from "../megaAliases";
import { checkCommandRatelimit } from "../util/messageStuff/ratelimit";
import { checkCommandArguments } from "../util/messageStuff/arguments";

/**
 * Replaces the content in the message with safe data
 */
function fixMessage(message: Message<true>): void {
  // Remove @everyone
  if (!message?.member?.permissions?.has("MentionEveryone"))
    message.content = message.content.replace(/@everyone/gi, "<at>everyone");

  // Replace special characters
  message.content = message.content.replace(/[’]/g, "'");
  message.content = message.content.replace(/[“”]/g, '"');
}

function createAutoComplete(dataset: string[], given: string): string[] {
  return Array.from(
    new Set(
      dataset
        .map((x) => [x, compareTwoStrings(x, given)] as [string, number])
        .filter((x) => x[1] > 0.6)
        .map((x) => x[0]),
    ),
  );
}

client.on("messageCreate", async function handleMessage(message) {
  // Base guards
  if (!message.inGuild()) return;
  if (config.ignore.channels.includes(message.channel.id)) return;

  fixMessage(message);

  // Run bot-only handlers
  for (const handler of Object.values(handlers).filter((x) => x.botsOnly))
    handler.handler(message);

  // Other guards
  if (message.author.bot || !message?.author?.id || !message?.guild?.id) return;

  // Load server settings
  const settings = await actions.serverSettings.getFor(message.guild.id);

  // Check if it's just a ping, if so send details
  if (message.content.trim() == `<@${client.user.id}>`)
    return message.reply(
      `Hey! My prefix is: \`${settings.prefix}\`\nUse \`${settings.prefix}commands\` to view my commands!\nAnd use \`${settings.prefix}about\` to learn about me! :cyclone:`,
    );

  // Preload data
  const economy = await actions.eco.getFor(message.author.id);
  const userData = await actions.userData.getFor(
    message.author.id,
    message.guild.id,
  );

  if (!config.ignore.handlers.includes(message.channel.id)) {
    // Run handlers
    for (const handler of Object.values(handlers).filter((x) => !x.botsOnly)) {
      if (handler.noCommands && message.content.startsWith(settings.prefix))
        continue;
      else handler.handler(message);
    }
  }

  // Check badges for the user
  if (message.guild.id === config.botServer.id) {
    await checkBadges(message, { ...userData, ...economy });
  }

  // Analytics
  if (
    !message.content.startsWith(settings.prefix) &&
    !message.content.startsWith(settings.prefix + " ") //&&message.guild.id === config.botServer.id
  ) {
    await addMessageForCurrentTime(message.channel as TextChannel);
    actions.wordUsage.addMessage(message);
    return;
  }

  if (!message.content.startsWith(settings.prefix)) return;

  // ----- Beyond is actual command handler -----

  // Extract command
  let content = message.content.substring(settings.prefix.length).trim();

  if (megaAliases[content.split(" ")[0].toLowerCase()]) {
    const key = content.split(" ")[0];
    content = content.replace(key, megaAliases[key.toLowerCase()]);
  }

  const originalArguments = content.split(" ").slice(1);

  const { wickStyle, args } = parseCommand(content);

  // Check if the command exists
  if (args.length === 0) return;
  const commandName = args.shift()?.toLowerCase() ?? "";
  let command = commands[commandName.toLowerCase()];
  if (!command) {
    if (commandName.length > 4) {
      let suggestions = createAutoComplete(
        Object.values(commands).map((x) => x.name),
        commandName,
      );
      if (suggestions.length > 0) {
        if (suggestions.length === 1) {
          const msg = await message.reply({
            content: `Did you mean \`${suggestions[0]}\`?`,
            components: [
              // @ts-ignore
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel("Yes")
                  .setStyle(ButtonStyle.Success)
                  .setCustomId("yes"),
              ),
            ],
          });

          const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 1000 * 60 * 10,
          });

          collector.on("collect", (i) => {
            let newContent = `${settings.prefix}${suggestions[0]} ${originalArguments.join(" ")}`;
            message.content = newContent;
            handleMessage(message);
            collector.stop();
          });

          collector.on("end", async () => {
            await msg.edit({ components: [] });
          });
        } else {
          return message.reply(
            `Did you mean ${englishifyList(
              suggestions.map((x) => `\`${x}\``),
              true,
            )}?`,
          );
        }
      }
    }
    return;
  }

  // Check blacklisted
  if (
    await actions.blacklist.getFor("category", message.guild.id, command.type)
  )
    return message.reply(
      `Sorry! But the category of this command (${command.type}) is disabled!`,
    );

  // Check guards
  if (
    command.type === "ai" &&
    !(
      (client.user.id === config.devBot.id && config.modules.ai.devEnabled) ||
      (client.user.id !== config.devBot.id && config.modules.ai.enabled)
    )
  )
    return await message.reply("AI is disabled!");

  if (command.guards) {
    // Check bot owner
    if (
      command.guards.includes("bot-owner") &&
      message.author.id !== config.owner
    )
      return await message.reply(`Only the bot owner can run this command!`);

    // Check bot server
    if (
      command.guards.includes("bot-server") &&
      message.guild.id !== config.botServer.id
    )
      return await message.reply(
        "This command can only be ran in the bot's server!",
      );

    // Check admin only
    if (
      command.guards.includes("admin") &&
      !message.member.permissions.has("Administrator")
    )
      return await message.reply(
        "You must have the administrator permission to run this command!",
      );
  }

  // Check for specific permissions
  if (command.permissions)
    for (const permission of command.permissions)
      if (!message.member.permissions.has(permission))
        return await message.reply(
          `You do not have the ${permission} permission!`,
        );

  const details: HypnoCommandDetails<any> = {
    serverSettings: settings,
    userData: userData,
    economy,
    command: commandName.toLowerCase(),
    args: {},
    oldArgs: originalArguments,
    originalContent: originalArguments.join(" "),
  };

  // Check prehandler
  if (command.preHandler) {
    if (!(await command.preHandler(message, details))) return;
  }

  let parts = [checkCommandRatelimit, checkCommandArguments];
  for (const part of parts) {
    if (
      !(await part({
        command,
        details,
        message,
        args,
        wickStyle,
        settings,
        economy,
      }))
    ) {
      return;
    }
  }

  // Add analytics
  await addCommandUsage(command.name);

  // Done!
  try {
    await command.handler(message, details);

    if (wickStyle["delete"] === "true") {
      try {
        await message.delete();
      } catch {}
    }
  } catch (err) {
    console.log(err);
    if (message.author.id === config.owner) {
      await message.reply({
        embeds: [
          createEmbed()
            .setTitle(`Oops! I died :(`)
            .setDescription(err.message)
            .addFields([
              {
                name: `Stacktrace`,
                value:
                  "```" +
                  (err.stack ? err.stack.slice(0, 1000) : "*No Stack*") +
                  "```",
              },
              {
                name: "Command Details",
                value: `**Command**: \`${message.content}\`\n**Parsed**: \`${JSON.stringify({ args, wickStyle })}\``,
              },
            ]),
        ],
      });
    } else {
      await message.reply(
        `:warning: Oops! I ran into an error whilst trying to run that command :(\n> \`${err.message}\``,
      );
    }
    err.command = {
      content: message.content,
      args: { args, wickStyle },
    };
    throw err;
  }
});

export function parseCommand(content: string): {
  wickStyle: { [key: string]: string };
  args: string[];
} {
  // Tokenizer
  let parts: string[] = [];
  let inQuote: boolean = false;
  let current: string = "";

  for (const char of content) {
    if (char === '"') {
      if (inQuote) {
        parts.push(current);
        current = "";
        inQuote = false;
        continue;
      }

      inQuote = true;
      continue;
    }

    if (inQuote) {
      current += char;
      continue;
    }

    if (char === " ") {
      if (current === "") continue;
      parts.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  // Check leftover
  if (current) parts.push(current);

  // Get the actual arguments
  let args: string[] = [];
  let wickStyle: { [key: string]: string } = {};
  let wickKey: string | null = null;
  let currentArg: string[] = [];

  for (let part of parts) {
    if (wickKey) {
      if (part.startsWith("?")) {
        wickStyle[wickKey] = currentArg.join(" ") || "true";
        currentArg = [];
        wickKey = part.substring(1);
        continue;
      }

      currentArg.push(part);
      continue;
    }
    if (part.startsWith("?")) {
      wickKey = part.substring(1);
      continue;
    }

    if (part.startsWith("\\?")) part = part.replace(/^\\\?/, "?");

    args.push(part);
  }

  // Check leftover
  if (currentArg.length > 0 || wickKey)
    if (wickKey) wickStyle[wickKey] = currentArg.join(" ") || "true";
    else args.push(currentArg.join(" "));

  return {
    wickStyle,
    args,
  };
}
