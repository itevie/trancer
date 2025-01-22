import { HypnoCommand } from "../../types/util";
import { history } from "./ai";

const command: HypnoCommand = {
  name: "amnesia",
  description: "Clear your history with the AI",
  type: "ai",

  handler: async (message) => {
    const conversationID = message.author.id.toString();
    if (history[conversationID]) delete history[conversationID];
    return message.reply("I bonked Trancer on the head and made it forget!");
  },
};

export default command;
