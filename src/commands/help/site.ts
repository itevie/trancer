import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "site",
  description: "Get the URL to the analytic site",
  type: "help",

  handler: async (message) => {
    return await message.reply(
      `https://trancer.dawn.rest/servers/${message.guild.id}/`
    );
  },
};

export default command;
