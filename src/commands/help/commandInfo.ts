import { CurrencyArgument, HypnoCommand } from "../../types/util";
import { commands } from "../..";
import { createEmbed } from "../../util/other";
import { generateCommandCodeBlock } from "../../util/args";
import { EmbedField } from "discord.js";
import { paginate } from "../../util/components/pagination";

const command: HypnoCommand<{ command: string }> = {
  name: "command",
  aliases: ["cmd"],
  description: `Get details on a command`,
  type: "help",
  args: {
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "command",
        description: `The command to get info on`,
        onMissing: "Please provide the command name to get info on",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    // Check if the command exists
    if (!commands[args.command])
      return message.reply(`The command **${args.command}** does not exist!`);

    // Get command
    const command = commands[args.command];

    // Get list of restrictions
    let restrictions = [];
    if (command.guards) {
      if (command.guards.includes("admin")) restrictions.push("Admin Only");
      if (command.guards.includes("bot-owner"))
        restrictions.push("Bot Owner Only");
      if (command.guards.includes("bot-server"))
        restrictions.push("Bot Server Only");
    }

    // Construct embed
    const embed = createEmbed().setTitle(`Command ${command.name}`);

    // Check for description
    if (command.description) embed.setDescription(command.description);

    let fields: { name: string; value: string; inline?: boolean }[] = [];

    // Check for aliases
    if (command.aliases) {
      fields.push({
        name: "Aliases",
        value: command.aliases.map((x) => `\`${x}\``).join(", "),
      });
    }

    // Check for examples
    if (command.examples) {
      fields.push({
        name: "Examples",
        value: command.examples
          .map(
            (x) =>
              `\`${x[0].replace(
                /\$cmd/g,
                `${serverSettings.prefix}${command.name}`,
              )}\`: ${x[1]}`,
          )
          .join("\n"),
      });
    }

    // Check for usage
    if (command.usage) {
      fields.push({
        name: "Usage",
        value: command.usage
          .map(
            (x) =>
              `\`${x[0].replace(
                /\$cmd/g,
                `${serverSettings.prefix}${command.name}`,
              )}\`: ${x[1]}`,
          )
          .join("\n"),
      });
    }

    // Check fore restrictions
    if (restrictions.length > 0) {
      fields.push({
        name: `Restrictions`,
        value: restrictions.join(", "),
      });
    }

    // Check for arguments
    if (command.args) {
      fields.push({
        name: "Parameters",
        value: generateCommandCodeBlock(command.name, command, serverSettings),
      });

      for (const _arg of command.args.args) {
        let parts = [_arg];
        if (_arg.or) parts.push(..._arg.or.map((x) => ({ ..._arg, ...x })));

        for (const arg of parts) {
          let text = "";
          if (arg.description) text += `\n*${arg.description}*`;

          if (arg.aliases)
            text += `\n- Aliases: ${arg.aliases
              .map((x) => `\`?${x}\``)
              .join(", ")}`;

          text += `\n- Type: ${arg.type}`;

          // Infer
          if (arg.infer) text += `\n- Inferrable: ${arg.infer ? "yes" : "no"}`;

          // Must be
          if (arg.mustBe) text += `\n- Must be: "${arg.mustBe}"`;

          // One of
          if (arg.oneOf)
            text += `\n- Must be one of: ${arg.oneOf
              .map((x) => `\`${x}\``)
              .join(", ")}`;

          // Min & max
          if ((arg as any).min) text += `\n- Minimum: ${(arg as any).min}`;
          if ((arg as any).max) text += `\n- Maximum: ${(arg as any).max}`;

          // Allow negative
          if ((arg as CurrencyArgument).allowNegative)
            text += `\n- Can be negative: yes`;

          fields.push({
            name: `${arg.wickStyle ? "?" : ""}${arg.name}${arg.type !== _arg.type ? " (alt)" : ""}`,
            value: text,
            inline: true,
          });
        }
      }
    }

    return paginate({
      message,
      embed,
      type: "field",
      data: fields,
      pageLength: 20,
    });
  },
};

export default command;
