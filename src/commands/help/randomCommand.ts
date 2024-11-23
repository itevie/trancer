import { commands } from "../..";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "randomcommand",
  aliases: ["ranc"],
  type: "help",
  description: "a",

  handler: (message) => {
    const key =
      Object.keys(commands)[
        Math.floor(Math.random() * Object.keys(commands).length)
      ];
    return message.reply(commands[key].name);
  },
};

export default command;
