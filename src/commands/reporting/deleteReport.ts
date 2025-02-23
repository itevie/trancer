import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ id: number }> = {
  name: "deletereport",
  description: "Delete a report from the database",
  type: "reporting",
  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "id",
        type: "number",
      },
    ],
  },

  handler: async (message, { args }) => {
    const report = await actions.reports.getById(args.id);
    if (!report) return message.reply(`That report does not exist`);
    await actions.reports.delete(args.id);
    return message.reply(`Report deleted!`);
  },
};

export default command;
