import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ user: User }> = {
  name: "reportsby",
  description: "Get a list of report IDs by a specific person",
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
    const reports = await actions.reports.getBy(args.user.id);
    return message.reply(
      `Here are are the reports **${args.user.username}** has created (**${
        reports.length
      }**)\n\n${reports.map((x) => `#${x.id}`).join(", ")}`
    );
  },
};

export default command;
