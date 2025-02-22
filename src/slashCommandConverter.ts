import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { HypnoCommand } from "./types/util";

export default function convertNormalCommandsToSlashCommands(
  commands: HypnoCommand[]
): SlashCommandBuilder[] {
  const slashCommands: SlashCommandBuilder[] = [];

  for (const command of commands) {
    if (command.guards || command.ignore || command.permissions) continue;

    const _slashCommand: SlashCommandBuilder = new SlashCommandBuilder();
    _slashCommand.setName(command.name);
    _slashCommand.setDescription(command.description);

    for (const [index, arg] of command.args.args.entries()) {
      switch (arg.type) {
        case "string":
          _slashCommand.addStringOption(
            new SlashCommandStringOption()
              .setName(arg.name)
              .setRequired(index < command.args.requiredArguments)
              .setDescription(arg.description)
          );
          break;
      }
    }
  }

  return [];
}
