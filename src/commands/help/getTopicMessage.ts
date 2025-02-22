import { HypnoCommand } from "../../types/util";
import { messages } from "./help";

const command: HypnoCommand<{ name: string }> = {
  name: "gettopicmessage",
  description: "Get's a topic message",
  type: "help",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "name",
        type: "string",
        oneOf: Object.keys(messages),
      },
    ],
  },

  handler: (message, { args }) => {
    return message.reply(messages[args.name]);
  },
};

export default command;
