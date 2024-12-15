import { Time } from "@itevie/util";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "debug",
  description: "A debug command",
  type: "help",

  handler: (message, { originalContent }) => {
    let date = Time.DawnTime.fromString(originalContent);
    return message.reply(JSON.stringify(date));
  },
};

export default command;
