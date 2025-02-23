import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ server: string; state: boolean }> = {
  name: "setserverreporttrust",
  description: "Trusts/untrusts a server for reports",
  type: "reporting",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "server",
        type: "string",
      },
      {
        name: "state",
        type: "boolean",
      },
    ],
  },

  handler: async (message, { args }) => {
    const server = await message.client.guilds.fetch(args.server);
    await actions.serverSettings.update(
      server.id,
      "report_trusted",
      args.state
    );
    return message.reply(`Updated`);
  },
};

export default command;
