import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "dashboard",
  description: "Get the link to your server's dashboard",
  type: "admin",
  permissions: ["ManageGuild"],

  handler: async (message) => {
    return message.reply(
      `https://trancer.dawn.rest/servers/${message.guild.id}/dashboard`
    );
  },
};

export default command;
