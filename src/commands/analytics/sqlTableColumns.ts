import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";

const command: HypnoCommand<{ name: string }> = {
    name: "sqlcolumns",
    type: "analytics",
    description: "Get a list of columns in one of our tables",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "name",
                type: "string",
                oneOf: ["economy", "user_data"]
            }
        ]
    },

    handler: async (message, { args }) => {
        let result = (await database.all(`PRAGMA table_info(${args.name})`)).map(x => `\`${x.name}\`: type \`${x.type}\``);
        return message.reply(result.join("\n"));
    }
};

export default command;