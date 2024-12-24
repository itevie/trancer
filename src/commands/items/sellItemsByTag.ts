import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ tag: string }> = {
  name: "sellitemsbytag",
  type: "economy",
  description: "Sell all items that match a tag",
  args: {
    requiredArguments: 1,
    args: [
      {
        name: "tag",
        type: "string",
        oneOf: ["fish"],
      },
    ],
  },

  handler: async (_) => {},
};

export default command;
