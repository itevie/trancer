import { HypnoMessageHandler } from "../types/messageHandler";
import { createLeaderboard, insertLeaderboardEntry, leaderboardExists } from "../util/actions/leaderboards";

const handler: HypnoMessageHandler = {
    name: "Bump Detector",
    description: "Detects /bump and adds to leaderboard",
    botsOnly: true,

    handler: async message => {
        // Check if the message is sent by Disboard & the embed contains "Bump done!"
        if (message.author.id === "302050872383242240" && message.embeds[0].data.description.includes("Bump done!")) {
            // Get the authors ID
            let user = message.interaction.user;

            // Check if the leaderboard exists
            if (!await leaderboardExists(`bumps-${message.guild.id}`))
                await createLeaderboard(`bumps-${message.guild.id}`);

            // Add entry
            await insertLeaderboardEntry(user.id, `bumps-${message.guild.id}`);
            console.log(`Added bump entry for ${user.username}`);
        }
    }
}

export default handler;