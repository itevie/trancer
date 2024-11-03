import { HypnoCommand } from "../../types/util";
import { generateSiteCode } from "../../website";

const command: HypnoCommand = {
  name: "site",
  description: "Get the URL to the analytic site",
  type: "help",

  handler: async (message) => {
    return await message.reply(
      `https://dawn.rest/trancer?auth=${generateSiteCode(message.author.id)}`
    );
  },
};

export default command;
