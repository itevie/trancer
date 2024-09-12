import { HypnoCommand } from "../../types/util";
import { rankExists } from "../../util/actions/ranks";
import createLeaderboardFromData, { accumlateSortLeaderboardData } from "../../util/createLeaderboard";
import { database } from "../../util/database";

const command: HypnoCommand<{ name: string }> = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Get the top 10 users on a specific leaderboard",
    type: "ranks",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "name",
                type: "string"
            }
        ]
    },

    handler: async (message, { args, serverSettings }) => {
        // Validate
        const name = args.name.toLowerCase();

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