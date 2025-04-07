import { client, commands, handlers } from "..";
import config from "../config";
import {
  AttachmentArgument,
  CurrencyArgument,
  HypnoCommandDetails,
  NumberArgument,
  StringArgument,
  UserArgument,
} from "../types/util";
import { addCommandUsage, addMessageForCurrentTime } from "../util/analytics";
import { generateCommandCodeBlock } from "../util/args";
import { checkBadges } from "../util/badges";
import { actions } from "../util/database";
import { msToHowLong } from "../util/ms";
import {
  compareTwoStrings,
  createEmbed,
  englishifyList,
  isURL,
} from "../util/other";
import { currency } from "../util/language";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Embed,
  EmbedBuilder,
  Message,
  MessageCreateOptions,
  TextChannel,
} from "discord.js";
import megaAliases from "../megaAliases";

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
    !message.content.startsWith(settings.prefix + " ") &&
    message.guild.id === config.botServer.id
  ) {
    await addMessageForCurrentTime(message.channel as TextChannel);
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

  // Check ratelimit
  if (command.ratelimit) {
    let lastUsed = await actions.ratelimits.get(
      message.author.id,
      command.name,
    );
    let ratelimit =
      typeof command.ratelimit === "function"
        ? await command.ratelimit(message, details)
        : command.ratelimit;
    if (ratelimit !== null) {
      let ms = ratelimit - (Date.now() - lastUsed.getTime());

      if (ms > 0)
        return await message.reply({
          embeds: [
            createEmbed()
              .setTitle(`Hey! You can't do that!`)
              .setColor("#FF0000")
              .setDescription(
                `You need to wait **${msToHowLong(ms)}** to use the **${
                  command.name
                }** command!`,
              ),
          ],
        });
      await actions.ratelimits.set(message.author.id, command.name, new Date());
    }
  }

  for (const arg in wickStyle) {
    if (
      !command.args.args.some((x) => x.name === arg || x.aliases?.includes(arg))
    ) {
      return await message.reply({
        embeds: [
          createEmbed()
            .setTitle("Invalid command usage!")
            .setDescription(
              generateCommandCodeBlock(commandName, command, settings) +
                `\n**Error**: This command does not have the **${arg}** ?arg`,
            ),
        ],
      });
    }
  }

  // Check if the command requires argument validation
  if (command.args) {
    for (let i in command.args.args) {
      const arg = command.args.args[i];
      let givenValue = args[i];

      if (arg.wickStyle) {
        let found = false;
        if (arg.name in wickStyle) {
          givenValue = wickStyle[arg.name] ?? "";
          found = true;
        }
        for (const i in arg.aliases)
          if (arg.aliases[i] in wickStyle) {
            givenValue = wickStyle[arg.aliases[i]] ?? "";
            found = true;
          }
        if (!found) givenValue = "";
      }

      // Generate codeblock for the errors
      const codeblock = generateCommandCodeBlock(
        commandName,
        command,
        settings,
        arg.name,
      );

      // Function to generate the error embed
      let generateErrorEmbed = (message: string) => {
        return createEmbed()
          .setTitle("Invalid command usage!")
          .setDescription(
            `${codeblock}\n**Above the arrows (*${arg.name}*)**: ${message}\n\nNote: \`<...>\` means it's required, and \`[...]\` means it's optional.`,
          );
      };

      let members = Array.from(message.guild.members.cache);
      let randomMember =
        members[Math.floor(Math.random() * members.length)][1].user;

      // Handle attachment argument
      if (arg.type === "attachment") {
        let ref = message.reference ? await message.fetchReference() : null;
        let isPfp = givenValue?.toLowerCase() === "pfp";
        let self = message.author.displayAvatarURL({
          size: 2048,
          extension: "png",
        });

        // ref + "pfp" = ref pfp
        // "pfp" = self pfp
        // ref + url = ref url
        // url = url
        // <@user> = user pfp
        // ref + infer + attachment = ref attachment
        // ref + infer = ref pfp
        // attachment = self attachment
        // self pfp

        let preferences = [
          givenValue === "@someone"
            ? randomMember.displayAvatarURL({
                size: 2048,
                extension: "png",
              })
            : null,
          arg.infer && ref !== null && isPfp
            ? ref.author.displayAvatarURL({
                size: 2048,
                extension: "png",
              })
            : null,
          ref === null && isPfp ? self : null,
          ref !== null && isURL(ref.content) ? ref.content : null,
          isURL(givenValue) ? givenValue : null,
          givenValue?.match(/<@[0-9]+>/)
            ? givenValue /* deal with it later  */
            : null,
          arg.infer && ref !== null && ref.attachments.size > 0
            ? ref.attachments.at(0).url
            : null,
          arg.infer && ref !== null
            ? ref.author.displayAvatarURL({
                size: 2048,
                extension: "png",
              })
            : null,
          message.attachments.size > 0 ? message.attachments.at(0).url : null,
          self,
        ];

        givenValue = preferences.find((x) => x !== null) || givenValue;
      }

      // Infer value from message reference if applicable
      if (
        arg.infer &&
        message.reference &&
        (!givenValue ||
          (arg.type === "attachment" && givenValue.toLowerCase() === "pfp"))
      ) {
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
              "Parameter is missing, but is required for this command",
            ),
          ],
        });
      if (!givenValue) continue;

      let result: any;

      // Returns null if success (puts it in result)
      let checkArg = async (
        a: string,
      ): Promise<string | { error: string; autocomplete: string[] } | null> => {
        switch (arg.type) {
          case "wholepositivenumber":
            if (isNaN(parseInt(a)) || parseInt(a) % 1 !== 0 || parseInt(a) < 0)
              return "Expected a whole, positive number";
          case "number": {
            if (isNaN(parseInt(a))) return "Invalid number provided";

            let min = (arg as NumberArgument).min;
            let max = (arg as NumberArgument).max;

            if (min !== undefined || min === 0)
              if (parseInt(a) < min) return `The minimum value is: ${min}`;

            if (max !== undefined || max === 0)
              if (parseInt(a) > max) return `The maximum value is: ${max}`;
            result = parseInt(a);
            break;
          }
          case "currency":
            let currencyArg = arg as CurrencyArgument;
            // Check for shortcuts
            a =
              {
                half: Math.round(economy.balance / 2),
                quarter: Math.round(economy.balance / 4),
                third: Math.round(economy.balance / 3),
              }[a.toLowerCase()]?.toString() ?? a;

            // Validate
            if (isNaN(parseInt(a))) return "Invalid number provided";
            if (parseInt(a) % 1 !== 0) return "Currency cannot be a decimal";
            if (!currencyArg.allowNegative && parseInt(a) < 0)
              return "Currency cannot be negative";

            let amount = parseInt(a);

            // Check if user has amount
            if (amount > economy.balance)
              return `You do not have ${currency(amount)}`;

            // Validate
            if (currencyArg.min && amount < currencyArg.min)
              return `Minimum amount is ${currency(currencyArg.min)}`;
            if (currencyArg.max && amount > currencyArg.max)
              return `Maximum amount is ${currency(currencyArg.max)}`;

            result = amount;
            break;
          case "boolean":
            if (
              !["true", "t", "yes", "false", "f", "no"].includes(
                a.toLowerCase(),
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
              result = args.join(" ");
            } else if ((arg as StringArgument).takeRest) {
              result = args.slice(parseInt(i)).join(" ");
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
            if (a.match(/^([0-9]+)$/))
              card = await actions.cards.getById(parseInt(a));
            else card = await actions.cards.getByName(a);
            if (!card)
              return {
                error: "Invalid card ID/name provided",
                autocomplete: (await actions.cards.getAll()).map((x) => x.name),
              };
            result = card;
            break;
          case "deck":
            let deck: Deck;
            if (a.match(/^([0-9]+)$/))
              deck = await actions.cards.decks.getById(parseInt(a));
            else deck = await actions.cards.decks.getByName(a);
            if (!deck)
              return {
                error: "Invalid deck ID/name provided",
                autocomplete: (await actions.decks.getAll()).map((x) => x.name),
              };
            result = deck;
            break;
          case "item":
            let item: Item;
            if (a.match(/^([0-9]+)$/))
              item = await actions.items.get(parseInt(a));
            else item = await actions.items.getByName(a);
            if (!item)
              return {
                error: "Invalid item ID/name provided",
                autocomplete: (await actions.items.getAll()).map((x) => x.name),
              };
            result = item;
            break;
          case "rank":
            let rank = await actions.ranks.get(a);
            if (!rank) {
              return {
                error: `That rank does not exist, try creating it with ${settings.prefix}createrank ${a}!`,
                autocomplete: (await actions.ranks.getAll()).map(
                  (x) => x.rank_name,
                ),
              };
            }
            result = rank;
            break;
          case "user":
            if (a === "@someone") {
              result = randomMember;
              return null;
            }

            if (a.toLowerCase() === "me") {
              result = message.author;
              return null;
            }

            // Check if it matches
            if (!a.match(/<?@?[0-9]+>?/))
              return "Invalid user format provided! Please provide a mention or ID";

            // Try fetch
            try {
              let r = await client.users.fetch(a.replace(/[<@>]/g, ""));
              let userArg = arg as UserArgument;

              if (userArg.denyBots && r.bot)
                return "A bot cannot be used for this command";
              if (userArg.mustHaveEco && !(await actions.eco.existsFor(r.id)))
                return "This user does not have economy setup";

              result = r;
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
                a.replace(/[<#>]/g, ""),
              );
            } catch {
              return `Failed to fetch the channel: ${a}`;
            }
            break;
          case "attachment":
            if (a.match(/<?@[0-9]+?>?/)) {
              try {
                const user = await client.users.fetch(a.replace(/[<>@]/g, ""));
                result = user.displayAvatarURL({
                  size: 2048,
                  extension: "png",
                });
              } catch {
                result = givenValue;
              }
            } else {
              result = givenValue;
            }
            break;
          case "none":
            break;
          default:
            return `The developer has not set up a type checker for ${arg.type}`;
        }

        return null;
      };

      // Check if it is a valid type
      let checkerResult = await checkArg(givenValue);
      if (checkerResult !== null) {
        let didYouMean =
          typeof checkerResult === "object"
            ? Array.from(
                new Map(
                  checkerResult.autocomplete.map((x) => [
                    x,
                    [
                      x,
                      compareTwoStrings(
                        givenValue.toLowerCase(),
                        x.toLowerCase(),
                      ),
                    ] as [string, number],
                  ]),
                ).values(),
              )
                .filter((x) => x[1] > 0.6)
                .map((x) => `\`${x[0]}\``)
                .join(", ")
            : "";
        return await message.reply({
          embeds: [
            generateErrorEmbed(
              `This part must be a **${arg.type}**\n**Error**: ${
                typeof checkerResult === "object"
                  ? checkerResult.error
                  : checkerResult
              }${didYouMean ? `\n**Did you mean**: ${didYouMean}?` : ""}`,
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
      if (arg.oneOf) {
        for (let i in arg.oneOf)
          if (
            arg.oneOf[i].toString().toLowerCase() ===
            result.toString().toLowerCase()
          )
            result = arg.oneOf[i];
      }
      if (arg.oneOf && !arg.oneOf.includes(result))
        return await message.reply({
          embeds: [
            generateErrorEmbed(
              `This part must be one of the following values: ${arg.oneOf
                .map((x) => `**${x}**`)
                .join(", ")}`,
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
