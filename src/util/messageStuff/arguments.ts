import { generateCommandCodeBlock } from "../args";
import { createEmbed, compareTwoStrings } from "../other";
import { argumentCheckers } from "./argumentChecker";
import { checkInfer } from "./infer";
import { CommandCheckContext, CommandCheckPhase } from "./util";

export async function checkCommandArguments(
  ctx: CommandCheckContext,
): CommandCheckPhase {
  const { command, wickStyle, message, details, args, settings } = ctx;

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
      });
      return false;
    }
  }

  // Validate arguments
  if (!command.args) return true;

  if (
    command.args.args[0]?.type === "user" &&
    !args[0]?.match(/<?@?[0-9]+>?/)
  ) {
    if (command.args.args[0].infer !== false && ctx.message.reference) {
      args.unshift((await ctx.message.fetchReference()).author.id.toString());
    } else {
      args.unshift("me");
    }
  }

  for (let i in command.args.args) {
    const arg = command.args.args[i];
    let givenValue = args[i];

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
      index: +i,
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
      });
      return false;
    }
    if (!givenValue) continue;

    let result = await argumentCheckers[arg.type](arg, givenValue, {
      super: ctx,
      index: +i,
    });

    if (
      typeof result === "string" ||
      (typeof result === "object" && "error" in result)
    ) {
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
            `This part must be a **${arg.type}**\n**Error**: ${
              typeof result === "object" ? result.error : result
            }${didYouMean ? `\n**Did you mean**: ${didYouMean}?` : ""}`,
          ),
        ],
      });
      return false;
    }

    ctx.details.args[arg.name] = result.result;
  }

  return true;
}
