import { HypnoCommand } from "../../types/util";
import { analyticDatabase } from "../../util/analytics";
import { database } from "../../util/database";

const command: HypnoCommand<{ sql: string; analytics?: boolean }> = {
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
      {
        name: "analytics",
        type: "boolean",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const result = await (args.analytics ? analyticDatabase : database).all(
      args.sql,
    );
    return message.reply(JSON.stringify(result));
  },
};

export default command;
