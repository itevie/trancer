import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ attachment: string }> = {
  name: "imageeditor",
  description: "Image edit",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "attachment",
        type: "attachment",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {},
};

export default command;
