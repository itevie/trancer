import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "usersettings",
  aliases: ["uset"],
  description: "Modify your user settings",
  type: "help",

  handler: async (_) => {},
};

export default command;
