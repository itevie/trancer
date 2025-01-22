import { HypnoCommand } from "../../types/util";
import { checkBadges } from "../../util/badges";

const command: HypnoCommand = {
  name: "checkbadges",
  description: "Rescans the badge list",
  type: "admin",
  guards: ["admin", "bot-server"],

  handler: (message) => {
    checkBadges();
    return message.reply("Rescanned!");
  },
};

export default command;
