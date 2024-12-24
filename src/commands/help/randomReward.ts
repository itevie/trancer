import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ itemtag?: string }> = {
  name: "randomreward",
  type: "help",
  description: "Debug command",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "itemtag",
        type: "string",
        wickStyle: true,
      },
    ],
  },

  handler: (message, { args }) => {},
};

export default command;
