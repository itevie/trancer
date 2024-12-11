import { HypnoCommand, NumberArgument } from "../../types/util";
import { commands } from "../..";
import { createEmbed } from "../../util/other";
import { generateCommandCodeBlock } from "../../util/args";

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

    // Check for aliases
    if (command.aliases) {
      embed.addFields([
        {
          name: "Aliases",
          value: command.aliases.map((x) => `\`${x}\``).join(", "),
        },
      ]);
    }

    // Check for arguments
    if (command.args) {
      embed.addFields([
        {
          name: "Parameters",
          value: `${generateCommandCodeBlock(
            command.name,
            command,
            serverSettings
          )}\n${command.args.args
            .map((arg) => {
              let text = `**${arg.wickStyle ? "?" : ""}${arg.name}**`;
              if (arg.description) text += `\n*${arg.description}*`;
              text += `\n- Type: ${arg.type}`;
              if (arg.infer)
                text += `\n- Inferrable: ${arg.infer ? "yes" : "no"}`;
              if ((arg as NumberArgument).min)
                text += `\n- Minimum: ${(arg as NumberArgument).min}`;
              if ((arg as NumberArgument).max)
                text += `\n- Maximum: ${(arg as NumberArgument).max}`;
              return text;
            })
            .join("\n\n")}`,
        },
      ]);
    }

    // Check for examples
    if (command.examples) {
      embed.addFields([
        {
          name: "Examples",
          value: command.examples
            .map(
              (x) =>
                `\`${x[0].replace(
                  /\$cmd/g,
                  `${serverSettings.prefix}${command.name}`
                )}\`: ${x[1]}`
            )
            .join("\n"),
        },
      ]);
    }

    // Check for usage
    if (command.usage) {
      embed.addFields([
        {
          name: "Usage",
          value: command.usage
            .map(
              (x) =>
                `\`${x[0].replace(
                  /\$cmd/g,
                  `${serverSettings.prefix}${command.name}`
                )}\`: ${x[1]}`
            )
            .join("\n"),
        },
      ]);
    }

    // Check fore restrictions
    if (restrictions.length > 0) {
      embed.addFields([
        {
          name: `Restrictions`,
          value: restrictions.join(", "),
        },
      ]);
    }

    return message.reply({
      embeds: [embed],
    });
  },
};

export default command;
