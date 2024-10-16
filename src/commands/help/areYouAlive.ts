import type { HypnoCommand } from "../../types/util.d.ts";

const command: HypnoCommand<{ test: number }> = {
  name: "areyoualive",
  description: "Check if the bot is alive",
  type: "help",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "test",
        type: "number",
      },
    ],
  },

  handler: async (message, details) => {
    return await message.reply(`Yes :D ${details.args.test}`);
  },
};

export default command;
