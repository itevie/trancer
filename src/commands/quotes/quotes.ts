import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed, paginate } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
    name: "quotes",
    description: "Get amount of quotes / IDs from a user",
    aliases: ["qs"],
    type: "quotes",
    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            }
        ]
    },

    handler: async (message, { args }) => {
        const user = args.user ? args.user : message.author;
        const list = (await database.all<Quote[]>(`SELECT * FROM quotes WHERE author_id = (?)`, user.id)).map(x => {
            return {
                name: `Quote #${x.id}`,
                value: `*${x.content || "No Content"}*`
            };
        });

        return paginate(message, createEmbed().setTitle(`Quotes from ${user.username}`), list);
    }
}

export default command;