import { Channel, Message, PermissionsBitField, Role, User } from "discord.js";
import { client, commands, handlers } from "..";
import { HypnoCommandDetails } from "../types/util";
import {
  createEconomyFor,
  economyForUserExists,
} from "../util/actions/economy";
import { getServerSettings, setupSettingsFor } from "../util/actions/settings";
import { createUserData, userDataExists } from "../util/actions/userData";
import { generateCommandCodeBlock } from "../util/args";
import { database } from "../util/database";
import config from "../config";
import { addCommandUsage, addMessageForCurrentTime } from "../util/analytics";
import {
  getCardById,
  getCardByName,
  getDeckById,
  getDeckByName,
} from "../util/actions/cards";
import { createEmbed } from "../util/other";

client.on("messageCreate", async (message) => {
  // German commas go away
  message.content = message.content.replace(/[’]/g, "'");

  // Stop the shitty connect timeout error
  let oldReply = message.reply;
  message.reply = (data) => {
    return new Promise<Message<boolean>>(async (resolve, reject) => {
      let tries = 0;
      const trySend = async () => {
        try {
          // Call oldReply with the correct context
          let msg = await oldReply.call(message, data);
          resolve(msg);
        } catch (e) {
          if (tries >= 3) {
            e.msg = message;
            reject(e);
            return;
          }
          tries++;
          console.log(e, `Attempt: ${tries}`);
          await trySend(); // Recursively retry sending the reply
        }
      };

      await trySend();
    });
  };

  for (const i in handlers)
    if (handlers[i].botsOnly) handlers[i].handler(message);

  // Disallow bots
  if (message.author.bot) return;
  if (!message?.author?.id || !message?.guild?.id) return;
  if (!database) return;

  // Check for user_data
  if (!(await userDataExists(message.author.id, message.guild.id)))
    await createUserData(message.author.id, message.guild.id);

  // Check for economy
  if (!(await economyForUserExists(message.author.id)))
    await createEconomyFor(message.author.id);

  // Setup settings
  if (!(await getServerSettings(message.guild.id)))
    await setupSettingsFor(message.guild.id);
  const settings = await getServerSettings(message.guild.id);

  if (message.content.trim() == `<@${client.user.id}>`)
    return message.reply(
      `Hey! My prefix is: \`${settings.prefix}\`\nUse \`${settings.prefix}commands\` to view my commands!\nAnd use \`${settings.prefix}about\` to learn about me! :cyclone:`
    );

  // Check handlers
  for (const i in handlers)
    if (!handlers[i].botsOnly) {
      if (handlers[i].noCommands) {
        if (message.content.startsWith(settings.prefix)) continue;
      }
      handlers[i].handler(message);
    }

  if (
    !message.content.startsWith(settings.prefix) &&
    !message.content.startsWith(settings.prefix + " ")
  ) {
    await addMessageForCurrentTime();
    return;
  }

  // Extract command
  const content = message.content
    .substring(settings.prefix.length, message.content.length)
    .trim();

  const fullArgs: string[] = [];
  let currentArg: string = "";
  let inQuote: boolean = false;

  for (const char of content) {
    // Check if new arg
    if (char === " " && !inQuote) {
      fullArgs.push(currentArg);
      currentArg = "";
      continue;
    }

    // Check if string
    if (char === '"') {
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
  if (currentArg) fullArgs.push(currentArg);

  const command = fullArgs.shift()?.toLowerCase() ?? "";

  const originalContent = content.split(" ");
  originalContent.shift();

  try {
    // Check if command was found
    if (commands[command]) {
      const cmd = commands[command];
      const details: HypnoCommandDetails<any> = {
        serverSettings: settings,
        command,
        args: {},
        oldArgs: fullArgs,
        originalContent: originalContent.join(" "),
      };

      // Function to actually execute the command if wanted
      const execute = async () => {
        // Check if the cmd requires arguments
        if (cmd.args) {
          for (let i in cmd.args.args) {
            let arg = cmd.args.args[i];
            const codeblock = generateCommandCodeBlock(
              command,
              cmd,
              settings,
              arg.name
            );

            let generateErrorEmbed = (message: string) => {
              return createEmbed()
                .setTitle("Invalid command usage!")
                .setDescription(
                  `You used the command wrong\n${codeblock}\nAbove the arrows (${arg.name}): ${message}\n\nNote: \`<...>\` means it's required, and \`[...]\` means it's optional.`
                );
            };

            // Check if it is there (and required)
            if (!fullArgs[i] && cmd.args.requiredArguments > +i)
              return message.reply({
                embeds: [
                  generateErrorEmbed(
                    "Parameter is missing, but is required for this command"
                  ),
                ],
              });
            if (!fullArgs[i]) continue;

            const checkers: {
              [key: string]: (
                arg: string
              ) => Promise<string | { value: any }> | string | { value: any };
            } = {
              number: (arg) =>
                isNaN(parseInt(arg))
                  ? "Invalid number provided"
                  : { value: parseInt(arg) },
              wholepositivenumber: (arg) =>
                isNaN(parseInt(arg)) ||
                parseInt(arg) < 0 ||
                parseInt(fullArgs[i]) % 1 !== 0
                  ? "Expected a whole, positive number"
                  : { value: parseInt(arg) },
              boolean: (arg) =>
                !["true", "false", "yes", "no", "t", "f"].includes(arg)
                  ? "Expected true or false"
                  : {
                      value: {
                        true: true,
                        false: false,
                        yes: true,
                        no: false,
                        t: true,
                        f: false,
                      }[arg],
                    },
              string: (arg) => {
                return { value: arg };
              },
              any: (arg) => {
                return { value: arg };
              },
              confirm: (arg) =>
                ["confirm", "c"].includes(arg.toLowerCase())
                  ? { value: "confirm" }
                  : "Expected **confirm**",
              card: async (arg) => {
                let card: Card;
                if (arg.match(/[0-9]+/))
                  card = await getCardById(parseInt(arg));
                else card = await getCardByName(arg);
                if (!card) return "Invalid card ID/name provided!";
                return { value: card };
              },
              deck: async (arg) => {
                let deck: Deck;
                if (arg.match(/[0-9]+/))
                  deck = await getDeckById(parseInt(arg));
                else deck = await getDeckByName(arg);
                if (!deck)
                  return `Invalid deck ID/name provided! Try running \`${settings.prefix}decks\``;
                return { value: deck };
              },
              user: async (arg) => {
                // Check if self
                if (arg.toLowerCase() === "me") {
                  return { value: message.author };
                }

                if (!arg.match(/<?@?[0-9]+>?/))
                  return `Invalid user format provided, please provide a mention or ID!`;

                let user: User;
                try {
                  user = await client.users.fetch(arg.replace(/[<>@]/g, ""));
                } catch (err) {
                  console.log(err);
                  return `Failed to fetch the user: ${arg}`;
                }

                return { value: user };
              },
              role: async (arg) => {
                if (!arg.match(/<?@?&?[0-9]+>?/))
                  return `Invalid role format provided, please provide a mention or ID!`;

                let role: Role;
                try {
                  role = await message.guild.roles.fetch(
                    arg.replace(/[<>@&]/g, "")
                  );
                } catch (err) {
                  console.log(err);
                  return `Failed to fetch the role: ${arg}`;
                }

                return { value: role };
              },
              channel: async (arg) => {
                if (!arg.match(/<?#?[0-9]+>?/))
                  return `Invalid channel format provided, please provide a mention or ID!`;

                let channel: Channel;
                try {
                  channel = await message.guild.channels.fetch(
                    arg.replace(/[<>#]/g, "")
                  );
                } catch (err) {
                  console.log(err);
                  return `Failed to fetch the channel: ${arg}`;
                }

                return { value: channel };
              },
            };

            let checker = checkers[arg.type];
            if (!checker)
              return message.reply(
                `Oops! The develoepr hasn't set up a checker for ${arg.type}`
              );

            let result = await checker(fullArgs[i]);
            if (typeof result === "string") {
              return message.reply({
                embeds: [
                  generateErrorEmbed(
                    `This part must be a **${arg.type}**\n**Error**: ${result}`
                  ),
                ],
              });
            }
            details.args[arg.name] = result.value;

            if (arg.mustBe) {
              if (details.args[arg.name] !== arg.mustBe)
                return message.reply({
                  embeds: [
                    generateErrorEmbed(
                      `This part must be exactly \`${arg.mustBe}\``
                    ),
                  ],
                });
            }

            if (arg.oneOf) {
              let success = false;
              for (const i of arg.oneOf)
                if (details.args[arg.name] === i) success = true;
              if (!success)
                return message.reply({
                  embeds: [
                    generateErrorEmbed(
                      "This part must be one of: " +
                        arg.oneOf.map((x) => `\`${x}\``).join(", ")
                    ),
                  ],
                });
            }
          }
        }

        await addCommandUsage(cmd.name);

        // Finally, run it.
        await cmd.handler(message, details);
      };
      const except = () => {
        if (cmd.except) return cmd.except(message, fullArgs);
        else return false;
      };

      // Used to ignore guards
      if (cmd.allowExceptions && config.exceptions.includes(message.author.id))
        return await execute();

      // Check if AI is turned off
      if (cmd.type === "ai" && !config.modules.ai.enabled)
        return message.reply(`AI is disabled! :cyclone:`);

      // Check guards
      if (cmd.guards) {
        // Check for bot owner only
        if (
          cmd.guards.includes("bot-owner") &&
          message.author.id !== config.owner
        )
          return message.reply(`Only the bot owner can run this command!`);

        // Check if command is admin only
        if (cmd.guards.includes("admin"))
          if (
            !message.member.permissions.has(
              PermissionsBitField.Flags.Administrator
            ) &&
            !except()
          )
            return message.reply(`You are not administrator :cyclone:`);

        // Check if command is bot-server only
        if (
          cmd.guards.includes("bot-server") &&
          message.guild.id !== config.botServer.id
        )
          return message.reply(
            `This command can only be used in the bot server :cyclone:`
          );
      }

      // Check if has specific permissions
      if (cmd.permissions) {
        for (const permission of cmd.permissions)
          if (!message.member.permissions.has(permission) && !except())
            return message.reply(
              `You do not have the ${permission} permission!`
            );
      }

      // Execute
      await execute();
    }
  } catch (err) {
    if (message.author.id === config.owner) {
      await message.reply({
        embeds: [
          createEmbed()
            .setTitle(`Oops! I died :(`)
            .setDescription(err.message)
            .setThumbnail(null)
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
