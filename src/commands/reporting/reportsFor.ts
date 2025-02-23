import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ user: User }> = {
  name: "reportsfor",
  description: "Get a list of report IDs for a specific person",
  type: "reporting",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const reports = await actions.reports.getFor(args.user.id);
    return message.reply(
      `Here are the reports for **${args.user.username}** (**${
        reports.length
      }**)\n\n${reports.map((x) => x.id).join(", ")}`
    );
  },
};

export default command;
