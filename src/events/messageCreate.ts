import config from "../../config.ts";
import { client, commands, handlers } from "../../main.ts";
import database from "../database/database.ts";
import type { HypnoCommandDetails } from "../types/util.d.ts";
import {
  argumentConverters,
  generateCommandCodeBlock,
} from "../util/arguments.ts";

client.on("messageCreate", async (message) => {
  // Check if and handlers listens for bot commands
  for (const handler of handlers) {
    if (!handler.botsOnly) {
      handler.handler(message);
    }
  }

  // Guards
  if (message.author.bot) return;

  // Fuck discord.js
  if (!message.guild?.id || !message.channel?.id) return;

  // Get / setup details
  const serverSettings = await database.servers.getSettings(message.guild.id);

  // Check for prefix
  if (
    !message.content.startsWith(serverSettings.prefix) &&
    !message.content.startsWith(serverSettings.prefix + " ")
  ) {
    // TODO: add message for current time
    return;
  }

  // Parse command
  const content = message.content.substring(
    serverSettings.prefix.length,
    message.content.length,
  ).trim();

  const fullArgs: string[] = [];
  let currentArg = "";
  let inQuote = false;

  for (const char of content) {
    // Check if it is a new argument
    if (char === " " && !inQuote) {
      if (currentArg.length > 0) {
        fullArgs.push(currentArg);
      }
      currentArg = "";
      continue;
    }

    // Check if it is a string
    if (char === '"') {
      // Quote is finished
      if (inQuote) {
        inQuote = false;
        fullArgs.push(currentArg);
        currentArg = "";
        continue;
      }

      inQuote = true;
      continue;
    }

    currentArg += char;
  }

  // Check for leftover
  if (currentArg) fullArgs.push(currentArg);

  // Get things
  const commandName = fullArgs.shift()?.toLowerCase() ?? "";
  const originalArgs = content.split(" ");
  originalArgs.shift();

  // Try to find & execute the command
  try {
    // Find command
    const command = commands[commandName];
    if (!command) return;

    const details: HypnoCommandDetails = {
      serverSettings,
      command: commandName,
      args: {},
      oldArgs: originalArgs,
    };

    const execute = async () => {
      // Check if it requires arguments
      if (command.args) {
        const codeblock = generateCommandCodeBlock(command, serverSettings);
        for (const i in command.args.args) {
          const arg = command.args.args[i];

          // Check if it is there and required
          if (!fullArgs[i] && command.args.requiredArguments > +i) {
            return message.reply(
              `You need to give **${command.args.requiredArguments}** args, but you only gave **${fullArgs.length}**!\n${codeblock}`,
            );
          }
          if (!fullArgs[i]) continue;

          // Check type
          const checker = argumentConverters[arg.type];
          if (!checker) {
            return message.reply(
              `Oopsies! There was no arg converter for **${arg.type}**!`,
            );
          }
          const result = await checker(fullArgs[i], arg, message);

          // Check result
          if (typeof result === "string") {
            return message.reply(
              `Error at perameter **${arg.name}!**\n*${result}*\n${codeblock}`,
            );
          }
          details.args[arg.name] = result.value;

          // Check if it must be a type
          if (arg.mustBe) {
            if (details.args[arg.name] !== arg.mustBe) {
              return message.reply(
                `Argument **${arg.name}** must be a **${arg.mustBe}**\n${codeblock}`,
              );
            }
          }

          // Check if it is one of many types
          if (arg.oneOf) {
            let success = false;
            for (const i of arg.oneOf) {
              if (details.args[arg.name] === i) {
                success = true;
              }
            }
            if (!success) {
              return message.reply(
                `Parameter **${arg.name}** must be one of: ${
                  arg.oneOf.join(", ")
                }\n${codeblock}`,
              );
            }
          }
        }
      }

      // Finally, run it
      await command.handler(message, details);
    };

    // Run it
    execute();
  } catch (err) {
    await message.reply(
      `Oops! I ran into an error :[${
        message.author.id === config.owner && `\`\`\`${err}\`\`\``
      }`,
    );
  }
});
