import { Guild, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { client } from "../..";

const command: HypnoCommand<{ user: User }> = {
  name: "userfind",
  description: "",
  type: "admin",
  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    const servers: Guild[] = [];

    const guilds = await client.guilds.fetch();

    for await (const guild of guilds) {
      const actual = await guild[1].fetch();
      const members = await actual.members.fetch();
      if (members.some((x) => x.user.id === args.user.id)) servers.push(actual);
    }

    return message.reply(`Servers: ${servers.map((x) => x.name).join(", ")}`);
  },
};

export default command;
