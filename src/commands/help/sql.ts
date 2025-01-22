import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand<{ sql: string }> = {
  name: "sql",
  description: "Run an SQL statement",
  type: "admin",
  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "sql",
        type: "string",
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const result = await database.all(args.sql);
    return message.reply(JSON.stringify(result));
  },
};

export default command;
