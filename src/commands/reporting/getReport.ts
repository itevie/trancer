import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ id: number }> = {
  name: "getreport",
  description: "Get a report by ID",
  type: "reporting",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "number",
        name: "id",
      },
    ],
  },

  handler: async (message, { args }) => {
    const report = await actions.reports.getById(args.id);
    if (!report) return message.reply(`That report does not exist`);
    return message.reply({
      ...(await actions.reports.generateEmbed(report)),
    });
  },
};

export default command;
