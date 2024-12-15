import { parseCommand } from "../../events/messageCreate";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "parsecommand",
  type: "help",
  description: "Debug command",

  handler: async (message, { originalContent }) => {
    let result = parseCommand(originalContent);
    return await message.reply(
      `# Parsed: **${originalContent}**\n## Normal Arguments\n${result.args.join(
        ", "
      )}\n## Wick Style\n${Object.entries(result.wickStyle)
        .map((x) => `**${x[0]}**: ${x[1]}`)
        .join("\n")}`
    );
  },
};

export default command;
