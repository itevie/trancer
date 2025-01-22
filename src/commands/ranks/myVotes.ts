import { client } from "../..";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
    name: "myvotes",
    description: "View the things you have voted for on all the leaderboards",
    type: "ranks",

    handler: async (message) => {
        const fromUser = await database.all(`SELECT * FROM votes WHERE voter = (?)`, message.author.id) as Vote[];
        let text = "";

        for (const i in fromUser) {
            text += `**${fromUser[i].rank_name}**: ${(await client.users.fetch(fromUser[i].votee)).username}\n`
        }

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Stuff you have voted on`)
                    .setDescription(text || "You do not have any votes!")
            ]
        });
    }
}

export default command;