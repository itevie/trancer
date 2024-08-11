import { client } from "../..";
import { HypnoCommand } from "../../types/command";
import { rankExists } from "../../util/actions/ranks";
import createLeaderboardFromData, { accumlateSortLeaderboardData } from "../../util/createLeaderboard";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Get the top 10 users on a specific leaderboard",
    type: "leaderboards",

    handler: async (message, { oldArgs: args, serverSettings }) => {
        // Validate
        if (!args[0])
            return message.reply(`Please provide a leaderboard name! Like: \`${serverSettings.prefix}lb fish\``);
        const name = args[0].toLowerCase();

        // Check if the leaderboard exists
        if (!await rankExists(name))
            return message.reply(`That leaderboard does not exist, but you can create it using \`${serverSettings.prefix}createrank ${name}\``);
        const lb = await database.get(`SELECT * FROM ranks WHERE rank_name = (?)`, name);

        // Fetch results
        const dbResults = await database.all(`SELECT * FROM votes WHERE rank_name = (?);`, name) as Vote[];
        return message.reply({
            embeds: [
                (await createLeaderboardFromData(accumlateSortLeaderboardData(dbResults.map(x => x.votee)), lb.description))
                    .setTitle(`Leaderboard for ${name}`)
                    .setFooter({ text: `Use ${serverSettings.prefix}vote ${name} <user> to vote!` })
            ]
        });
    }
}

export default command;