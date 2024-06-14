import { client } from "../..";
import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "quotes",
    description: "Get amount of quotes / IDs from a user",
    aliases: ["qs"],
    type: "quotes",
    usage: [
        ["$cmd <user mention>", "Get the list of quotes another user has sent"]
    ],

    handler: async (message, args) => {
        if (!args[0]) {
            const list = (await database.all(`SELECT 1 FROM quotes;`)).length;
            const inThis = (await database.all(`SELECT 1 FROM quotes WHERE server_id = (?);`, message.guild.id)).length;
            return message.reply(`There are **${list}** quotes registered! (**${inThis}** in this server)`);
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