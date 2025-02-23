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
import {
  getCardById,
  getCardByName,
  getDeckById,
  getDeckByName,
} from "../util/actions/cards";
import { economyForUserExists, getEconomyFor } from "../util/actions/economy";
import { getRatelimit, setRatelimit } from "../util/actions/ratelimit";
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
import { currency } from "../util/textProducer";

client.on("messageCreate", async (message) => {
  // Only listen if in guild
  if (!message.inGuild()) return;
  if (config.ignoreChannels.includes(message.channel.id)) return;

  if (!message?.member?.permissions?.has("MentionEveryone"))
    message.content = message.content.replace(/@everyone/gi, "<at>everyone");

  // Replace special characters
  message.content = message.content.replace(/[’]/g, "'");
  message.content = message.content.replace(/[“”]/g, '"');

  // Run bot-only handlers
  for (const handler of Object.values(handlers).filter((x) => x.botsOnly))
    handler.handler(message);

  // Guards
  if (message.author.bot || !message?.author?.id || !message?.guild?.id) return;

  const economy = await getEconomyFor(message.author.id);
  const userData = await actions.userData.getFor(
    message.author.id,
    message.guild.id
  );

  // Fetch data
  const settings = await actions.serverSettings.getFor(message.guild.id);

  // Check if it's just a ping, if so send details
  if (message.content.trim() == `<@${client.user.id}>`)
    return message.reply(
      `Hey! My prefix is: \`${settings.prefix}\`\nUse \`${settings.prefix}commands\` to view my commands!\nAnd use \`${settings.prefix}about\` to learn about me! :cyclone:`
    );

  if (!config.ignoreHandlersIn.includes(message.channel.id)) {
    // Run handlers
    for (const handler of Object.values(handlers).filter((x) => !x.botsOnly)) {
      if (handler.noCommands && message.content.startsWith(settings.prefix))
        continue;
      else handler.handler(message);
    }
  }

  if (message.guild.id === config.botServer.id) {
    await checkBadges(message, { ...userData, ...economy });
  }

  // Analytics
  if (
    !message.content.startsWith(settings.prefix) &&
    !message.content.startsWith(settings.prefix + " ") &&
    message.guild.id === config.botServer.id
  ) {
    await addMessageForCurrentTime();
    return;
  }

  if (!message.content.startsWith(settings.prefix)) return;

  // ----- Beyond is actual command handler -----

  // Extract command
  const content = message.content.substring(settings.prefix.length).trim();
  const originalArguments = content.split(" ").slice(1);

  const { wickStyle, args } = parseCommand(content);

  // Check if the command exists
  if (args.length === 0) return;
  const commandName = args.shift()?.toLowerCase() ?? "";
  const command = commands[commandName.toLowerCase()];
  if (!command) {
    if (commandName.length > 4) {
      let suggestions = Array.from(
        new Map(
          Object.values(commands).map((x) => [
            x.name,
            [x.name, compareTwoStrings(commandName, x.name)] as [
              string,
              number
            ],
          ])
        ).values()
      ).filter((x) => x[1] > 0.6);
      if (suggestions.length > 0)
        return message.reply(
          `Did you mean ${englishifyList(
            suggestions.map((x) => `\`${x[0]}\``),
            true
          )}?`
        );
    }
    return;
  }

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
    let lastUsed = await getRatelimit(message.author.id, command.name);
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
                }** command!`
              ),
          ],
        });
      await setRatelimit(message.author.id, command.name, new Date());
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
        arg.name
      );

      // Function to generate the error embed
      let generateErrorEmbed = (message: string) => {
        return createEmbed()
          .setTitle("Invalid command usage!")
          .setDescription(
            `${codeblock}\n**Above the arrows (*${arg.name}*)**: ${message}\n\nNote: \`<...>\` means it's required, and \`[...]\` means it's optional.`
          );
      };

      // Handle attachment argument
      if (arg.type === "attachment") {
        if (
          (givenValue?.toLowerCase() === "pfp" ||
            (!givenValue && (arg as AttachmentArgument).defaultPfp)) &&
          !(arg.infer && message.reference)
        ) {
          givenValue = message.author.displayAvatarURL({
            size: 2048,
            extension: "png",
          });
        } else if (!givenValue || !isURL(givenValue)) {
          givenValue =
            message.attachments.size > 0
              ? message.attachments.at(0).url
              : givenValue;
        }
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
          case "attachment":
            if (
              givenValue?.toLowerCase() === "pfp" ||
              (!givenValue && (arg as AttachmentArgument).defaultPfp)
            ) {
              givenValue = reference.author.displayAvatarURL({
                size: 2048,
                extension: "png",
              });
            } else {
              givenValue =
                reference.attachments.size > 0
                  ? reference.attachments.at(0).url
                  : isURL(reference.content)
                  ? reference.content
                  : givenValue;
            }
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
      let checkArg = async (
        a: string
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
            if (a.match(/^([0-9]+)$/)) card = await getCardById(parseInt(a));
            else card = await getCardByName(a);
            if (!card)
              return {
                error: "Invalid card ID/name provided",
                autocomplete: (await actions.cards.getAll()).map((x) => x.name),
              };
            result = card;
            break;
          case "deck":
            let deck: Deck;
            if (a.match(/^([0-9]+)$/)) deck = await getDeckById(parseInt(a));
            else deck = await getDeckByName(a);
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
          case "user":
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
              if (userArg.mustHaveEco && !(await economyForUserExists(r.id)))
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
                a.replace(/[<#>]/g, "")
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
                        x.toLowerCase()
                      ),
                    ] as [string, number],
                  ])
                ).values()
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
              }${didYouMean ? `\n**Did you mean**: ${didYouMean}?` : ""}`
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
      if (err.message.toLowerCase().includes("timeout")) {
        await message.reply(
          `:warning: Oops! I ran into an error, but your command *did* sucessfully run!`
        );
      } else {
        await message.reply(
          `:warning: Oops! I ran into an error whilst trying to run that command :(`
        );
      }
    }
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
