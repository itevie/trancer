import { client } from "../..";
import { HypnoCommand } from "../../types/command";
import { rankExists } from "../../util/actions/ranks";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Get the top 10 users on a specific leaderboard",
    type: "leaderboards",

    handler: async (message, args, o) => {
        // Validate
        if (!args[0])
            return message.reply(`Please provide a leaderboard name! Like: \`${o.serverSettings.prefix}lb fish\``);
        const name = args[0].toLowerCase();

        // Check if the leaderboard exists
        if (!await rankExists(name))
            return message.reply(`That leaderboard does not exist, but you can create it using \`${o.serverSettings.prefix}createrank ${name}\``);
        const lb = await database.get(`SELECT * FROM ranks WHERE rank_name = (?)`, name);

        // Fetch results
        const dbResults = await database.all(`SELECT * FROM votes WHERE rank_name = (?);`, name) as Vote[];
        const result: { [key: string]: number } = {};

        // Calculate
        for (const vote of dbResults) {
            if (!result[vote.votee]) result[vote.votee] = 0;
            result[vote.votee]++;
        }

        // Sort
        const resultArr: [string, number][] = [];
        for (const i in result) resultArr.push([i, result[i]]);
        const sortedArr = resultArr.sort((a, b) => b[1] - a[1]).slice(0, 9);

        // Create
        let text = `${lb.description ? `*${lb.description}*\n\n` : ""}`;

        for (const i in sortedArr) {
            text += `**${parseInt(i) + 1}.** ${(await client.users.fetch(sortedArr[i][0])).username} (**${sortedArr[i][1]}** votes)\n`;
        }

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Leaderboard for ${name}`)
                    .setDescription(text || "*No votes :(*")
                    .setFooter({ text: `Use ${o.serverSettings.prefix}vote ${name} <user> to vote!` })
            ]
        });
    }
}

export default command;