import { client, commands, handlers } from "..";
import config from "../config";
import {
  HypnoCommandDetails,
  NumberArgument,
  StringArgument,
} from "../types/util";
import {
  getCardById,
  getCardByName,
  getDeckById,
  getDeckByName,
} from "../util/actions/cards";
import { getEconomyFor } from "../util/actions/economy";
import { getServerSettings } from "../util/actions/settings";
import { addCommandUsage, addMessageForCurrentTime } from "../util/analytics";
import { generateCommandCodeBlock } from "../util/args";
import { createEmbed } from "../util/other";

client.on("messageCreate", async (message) => {
  // Only listen if in guild
  if (!message.inGuild()) return;

  // Replace special characters
  message.content = message.content.replace(/[’]/g, "'");
  message.content = message.content.replace(/[“”]/g, '"');

  // Run bot-only handlers
  for (const handler of Object.values(handlers).filter((x) => x.botsOnly))
    handler.handler(message);

  // Guards
  if (message.author.bot || !message?.author?.id || !message?.guild?.id) return;

  await getEconomyFor(message.author.id);

  // Fetch data
  const settings = await getServerSettings(message.guild.id);

  // Check if it's just a ping, if so send details
  if (message.content.trim() == `<@${client.user.id}>`)
    return message.reply(
      `Hey! My prefix is: \`${settings.prefix}\`\nUse \`${settings.prefix}commands\` to view my commands!\nAnd use \`${settings.prefix}about\` to learn about me! :cyclone:`
    );

  // Run handlers
  for (const handler of Object.values(handlers).filter((x) => !x.botsOnly)) {
    if (handler.noCommands && message.content.startsWith(settings.prefix))
      continue;
    else handler.handler(message);
  }

  // Analytics
  if (
    !message.content.startsWith(settings.prefix) &&
    !message.content.startsWith(settings.prefix + " ")
  ) {
    await addMessageForCurrentTime();
    return;
  }

  // ----- Beyond is actual command handler -----

  // Extract command
  const content = message.content.substring(settings.prefix.length).trim();
  const originalArguments = content.split(" ").slice(1);

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

  for (const part of parts) {
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

    args.push(part);
  }

  // Check leftover
  if (currentArg.length > 0 || wickKey)
    if (wickKey) wickStyle[wickKey] = currentArg.join(" ") || "true";
    else args.push(currentArg.join(" "));

  // Check if the command exists
  if (args.length === 0) return;
  const commandName = args.shift()?.toLowerCase() ?? "";
  const command = commands[commandName.toLowerCase()];
  if (!command) return;

  // Check guards
  if (command.type === "ai" && !config.modules.ai.enabled)
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
        "This command can only be ran in the bot's server!"
      );

    // Check admin only
    if (
      command.guards.includes("admin") &&
      !message.member.permissions.has("Administrator")
    )
      return await message.reply(
        "You must have the administrator permission to run this command!"
      );
  }

  // Check for specific permissions
  if (command.permissions)
    for (const permission of command.permissions)
      if (!message.member.permissions.has(permission))
        return await message.reply(
          `You do not have the ${permission} permission!`
        );

  const details: HypnoCommandDetails<any> = {
    serverSettings: settings,
    command: commandName.toLowerCase(),
    args: {},
    oldArgs: originalArguments,
    originalContent: originalArguments.join(" "),
  };

  // Check if the command requires argument validation
  if (command.args) {
    for (let i in command.args.args) {
      const arg = command.args.args[i];
      let givenValue = args[i];

      if (arg.wickStyle) {
        if (arg.name in wickStyle) givenValue = wickStyle[arg.name] ?? "";
        for (const i in arg.aliases)
          if (arg.aliases[i] in wickStyle)
            givenValue = wickStyle[arg.aliases[i]] ?? "";
      }

      // Generate codeblock for the errors
      const codeblock = generateCommandCodeBlock(
        commandName,
        command,
        settings,
        arg.name
      );

      // Function to generate the error embed
      let generateErrorEmbed = (message: string) => {
        return createEmbed()
          .setTitle("Invalid command usage!")
          .setDescription(
            `You used the command wrong\n${codeblock}\nAbove the arrows (${arg.name}): ${message}\n\nNote: \`<...>\` means it's required, and \`[...]\` means it's optional.`
          );
      };

      // Check if it can be substituted
      if (!givenValue && arg.infer && message.reference) {
        let reference = await message.fetchReference();
        switch (arg.type) {
          case "string":
            givenValue = reference.content;
            break;
          case "user":
            givenValue = reference.author.id;
            break;
        }
      }

      // Check if it is there and required
      if (!givenValue && command.args.requiredArguments > +i)
        return await message.reply({
          embeds: [
            generateErrorEmbed(
              "Parameter is missing, but is required for this command"
            ),
          ],
        });
      if (!givenValue) continue;

      let result: any;

      // Returns null if success (puts it in result)
      let checkArg = async (a: string): Promise<string | null> => {
        switch (arg.type) {
          case "wholepositivenumber":
            if (isNaN(parseInt(a)) || parseInt(a) % 1 !== 0)
              return "Expected a whole, positive number";
          case "number":
            if (isNaN(parseInt(a))) return "Invalid number provided";

            let min = (arg as NumberArgument).min;
            let max = (arg as NumberArgument).max;

            if (min || min === 0)
              if (parseInt(a) < min) return `The minimum value is: ${min}`;

            if (max || max === 0)
              if (parseInt(a) > max) return `The maximum value is: ${max}`;
            result = parseInt(a);
            break;
          case "boolean":
            if (
              !["true", "t", "yes", "false", "f", "no"].includes(
                a.toLowerCase()
              )
            )
              return "Expected true or false";
            result = {
              true: true,
              t: true,
              yes: true,
              false: false,
              f: false,
              no: false,
            }[a.toLowerCase()];
            break;
          case "string":
            if (
              (arg as StringArgument).takeContent &&
              a.split(" ").length === 1
            ) {
              result = originalArguments.join(" ");
            } else {
              result = a;
            }
            break;
          case "any":
            result = a;
            break;
          case "confirm":
            if (a.toLowerCase() !== "confirm") return `Expected "confirm"`;
            result = "confirm";
            break;
          case "card":
            let card: Card;
            if (a.match(/^([0-9]+)$/)) card = await getCardById(parseInt(a));
            else card = await getCardByName(a);
            if (!card) return "Invalid card ID/name provided";
            result = card;
            break;
          case "deck":
            let deck: Deck;
            if (a.match(/^([0-9]+)$/)) deck = await getDeckById(parseInt(a));
            else deck = await getDeckByName(a);
            if (!deck) return "Invalid deck ID/name provided";
            result = deck;
            break;
          case "user":
            // Check if it matches
            if (!a.match(/<?@?[0-9]+>?/))
              return "Invalid user format provided! Please provide a mention or ID";

            // Try fetch
            try {
              result = await client.users.fetch(a.replace(/[<@>]/g, ""));
            } catch {
              return `Failed to fetch the user: ${a}`;
            }
            break;
          case "channel":
            // Check if it matches
            if (!a.match(/<?#?[0-9]+>?/))
              return "Invalid channel format provided! Please provide a mention or ID";

            // Try fetch
            try {
              result = await message.guild.channels.fetch(
                a.replace(/[<#>]/g, "")
              );
            } catch {
              return `Failed to fetch the channel: ${a}`;
            }
            break;
          default:
            return `The developer has not set up a type checker for ${arg.type}`;
        }

        return null;
      };

      // Check if it is a valid type
      let checkerResult = await checkArg(givenValue);
      if (checkerResult !== null) {
        return await message.reply({
          embeds: [
            generateErrorEmbed(
              `This part must be a **${arg.type}**\n**Error**: ${checkerResult}`
            ),
          ],
        });
      }

      // Check must be
      if (arg.mustBe && result !== arg.mustBe)
        return await message.reply({
          embeds: [generateErrorEmbed(`This part must be "${arg.mustBe}"`)],
        });

      // Check one of
      if (arg.oneOf && !arg.oneOf.includes(result))
        return await message.reply({
          embeds: [
            generateErrorEmbed(
              `This part must be one of the following values: ${arg.oneOf
                .map((x) => `**${x}**`)
                .join(", ")}`
            ),
          ],
        });

      details.args[arg.name] = result;
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
            ]),
        ],
      });
    } else {
      await message.reply(
        `Oops... I ran into an error whilst trying to run that command :(`
      );
    }
    throw err;
  }
});
