import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ id: number }> = {
  name: "removetriggeridea",
  description: "Remove a trigger idea",
  type: "hypnosis",
  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "id",
        type: "number",
      },
    ],
  },

  handler: async (message, { args }) => {
    await actions.triggerIdeas.remove(args.id);
    return message.reply(`Removed trigger idea!`);
  },
};

export default command;
