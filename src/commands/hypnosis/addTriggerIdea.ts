import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ name: string; description: string }> = {
  name: "addtriggeridea",
  type: "hypnosis",
  description: "Add a trigger/suggestion idea to Trancer!",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "name",
        type: "string",
        description: 'The name of the trigger, e.g. "snap"',
      },
      {
        name: "description",
        type: "string",
        takeRest: true,
        description:
          'The description of the trigger, e.g. "Drops you into trance"',
      },
    ],
  },

  handler: async (message, { args }) => {
    await actions.triggerIdeas.add(
      args.name,
      args.description,
      message.author.id,
    );
    return message.reply(`Added! Thank you!`);
  },
};

export default command;
