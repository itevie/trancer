import { HypnoCommand } from "../../types/util";
import { clearFileDirectoryCache } from "./_util";

const command: HypnoCommand = {
  name: "clearfiledirectorycache",
  type: "file-directory",
  guards: ["bot-owner"],
  description: "Clears the cache for the file directory",

  handler: async (message) => {
    clearFileDirectoryCache();
    return message.reply(`Deleted!`);
  },
};

export default command;
