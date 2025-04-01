import { disable } from "../../messageHandlers/aprilFools";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "disableapril",
  description: "",
  type: "admin",
  guards: ["bot-owner"],

  handler: async (message) => {
    disable();
    return message.reply("ok");
  },
};

export default command;
