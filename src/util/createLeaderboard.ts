import { EmbedBuilder } from "discord.js";
import { client } from "..";
import { createEmbed } from "./other";

export default async function createLeaderboardFromData(data: string[], description: string = "Leaderboard Results"): Promise<EmbedBuilder> {
    const result: { [key: string]: number } = {};

    // Accumulate
    for (const d of data) {
        if (!result[d])
            result[d] = 0;
        result[d]++;
    }

    // Sort
    const resultArr: [string, number][] = [];
    for (const i in result) resultArr.push([i, result[i]]);
    let sortedArr = resultArr.sort((a, b) => b[1] - a[1]).slice(0, 9);

    // Create text
    let text = `${description ? `*${description}*\n\n` : ""}`;

    for (const i in sortedArr) {
        text += `**${parseInt(i) + 1}.** ${(await client.users.fetch(sortedArr[i][0])).username} (**${sortedArr[i][1]}** entries)\n`;
    }

    // Create embed
    return createEmbed()
        .setDescription(sortedArr.length === 0 ? "No results :(" : text);
}