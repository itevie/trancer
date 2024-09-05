import { client } from "../..";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "quotes",
    description: "Get amount of quotes / IDs from a user",
    aliases: ["qs"],
    type: "quotes",
    usage: [
        ["$cmd <user mention>", "Get the list of quotes another user has sent"]
    ],

    handler: async (message, { oldArgs: args }) => {
        if (!args[0]) {
            const list = (await database.all(`SELECT id FROM quotes;`));
            const inThis = (await database.all(`SELECT id FROM quotes WHERE server_id = (?);`, message.guild.id));
            return message.reply(`There are **${list.length}** quotes registered! (**${inThis.length}** in this server):\n${inThis.map(x => `#${x.id}`).join(", ")}`);
        } else {
            let userId = args[0].replace(/[<@>]/g, "");
            const user = await client.users.fetch(userId);

            if (!user)
                return message.reply(`That user does that exist! :cyclone:`);

            const list = (await database.all(`SELECT id FROM quotes WHERE author_id = (?)`, user.id)).map(x => `#${x.id}`);
            return message.reply(`List of quotes from **${user.username}**:\n\n${list.join(", ")}`);
        }
    }
}

export default command;