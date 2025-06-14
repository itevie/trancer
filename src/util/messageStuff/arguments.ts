import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { generateCommandCodeBlock } from "../args";
import { createEmbed, compareTwoStrings } from "../other";
import { argumentCheckers } from "./argumentChecker";
import { checkInfer } from "./infer";
import { CommandCheckContext, CommandCheckPhase } from "./util";

export async function checkCommandArguments(
  ctx: CommandCheckContext,
): CommandCheckPhase {
  const { command, wickStyle, message, details, args, settings } = ctx;

  let errorHelp = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Command Help")
      .setCustomId(`command-help-${command.name}`),
  );

  // Check if all wick-style are valid
  for (const arg in wickStyle) {
    if (
      !command.args.args.some((x) => x.name === arg || x.aliases?.includes(arg))
    ) {
      await message.reply({
        embeds: [
          createEmbed()
            .setTitle("Invalid command usage!")
            .setDescription(
              generateCommandCodeBlock(details.command, command, settings) +
                `\n**Error**: This command does not have the **${arg}** ?arg`,
            ),
        ],
        components: [
          // @ts-ignore
          errorHelp,
        ],
      });
      return false;
    }
  }

  // Validate arguments
  if (!command.args) return true;
  let artifical = 0;

  for (let i in command.args.args) {
    const arg = command.args.args[i];
    let givenValue = args[artifical];

    if (
      +i === 0 &&
      arg.type === "user" &&
      !args[0]?.match(/<?@?[0-9]{16,}>?/)
    ) {
      if (arg.infer !== false && ctx.message.reference) {
        details.args[arg.name] = (await ctx.message.fetchReference()).author;
      } else {
        details.args[arg.name] = message.author;
      }

      continue;
    }

    // Check if it is wickstyle and should be set
    if (arg.wickStyle) {
      let key =
        arg.name in wickStyle
          ? arg.name
          : arg.aliases?.find((x) => x in wickStyle);

      if (key) givenValue = wickStyle[key];
      else givenValue = "";
    }

    givenValue = await checkInfer(arg, givenValue, {
      super: ctx,
      index: artifical,
    });

    // Generate codeblock for the errors
    const codeblock = generateCommandCodeBlock(
      details.command,
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

    // Check if it is there and required
    if (!givenValue && command.args.requiredArguments > +i) {
      await message.reply({
        embeds: [
          generateErrorEmbed(
            "Parameter is missing, but is required for this command",
          ),
        ],
        components: [
          // @ts-ignore
          errorHelp,
        ],
      });
      return false;
    }
    if (!givenValue) continue;

    let toCheck = [arg];
    if (arg.or) toCheck.push(...arg.or.map((x) => ({ ...arg, ...x })));

    for (const i in toCheck) {
      let _arg = toCheck[i];
      let result = await argumentCheckers[_arg.type](_arg, givenValue, {
        super: ctx,
        index: artifical,
      });

      // Check if the arg parser gave a error
      if (
        typeof result === "string" ||
        (typeof result === "object" && "error" in result)
      ) {
        if (+i !== toCheck.length - 1) {
          continue;
        }

        let didYouMean =
          typeof result === "object"
            ? Array.from(
                new Map(
                  result.autocomplete.map((x) => [
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

        await message.reply({
          embeds: [
            generateErrorEmbed(
              `This part must be a **${arg.type}**${arg.or ? ` (or **${arg.or.map((x) => x.type).join(", ")}**)` : ""}\n**Error**: ${
                typeof result === "object" ? result.error : result
              }${didYouMean ? `\n**Did you mean**: ${didYouMean}?` : ""}`,
            ),
          ],
          components: [
            // @ts-ignore
            errorHelp,
          ],
        });
        return false;
      }

      // Now check the arg's needs
      if (_arg.mustBe && result.result !== _arg.mustBe) {
        await message.reply({
          embeds: [generateErrorEmbed(`This part must be: \`${arg.mustBe}\``)],
          components: [
            // @ts-ignore
            errorHelp,
          ],
        });
        return false;
      }

      if (
        _arg.oneOf &&
        _arg.type === "string" &&
        _arg.oneOf.some((x) => x.toLowerCase() === result.result.toLowerCase())
      ) {
        result.result = _arg.oneOf.find(
          (x) => x.toLowerCase() === result.result.toLowerCase(),
        );
      }

      if (_arg.oneOf && !_arg.oneOf.includes(result.result)) {
        await message.reply({
          embeds: [
            generateErrorEmbed(
              `This part must be one of: ${_arg.oneOf.map((x) => `\`${x}\``).join(", ")}`,
            ),
          ],
          components: [
            // @ts-ignore
            errorHelp,
          ],
        });
        return false;
      }

      ctx.details.args[arg.name] = result.result;
      artifical++;
      break;
    }
  }

  return true;
}
