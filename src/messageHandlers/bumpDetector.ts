import { HypnoMessageHandler } from "../types/messageHandler";
import { createLeaderboard, insertLeaderboardEntry, leaderboardExists } from "../util/actions/leaderboards";
import { addBump } from "../util/actions/userData";
import config from "../config.json";
import { addMoneyFor } from "../util/actions/economy";
import { randomFromRange } from "../util/other";

const handler: HypnoMessageHandler = {
    name: "bump-detector",
    description: "Detects /bump and adds to leaderboard",
    botsOnly: true,

    handler: async message => {
        // Check if the message is sent by Disboard & the embed contains "Bump done!"
        if (message.author.id === "302050872383242240" && message.embeds[0].data.description.includes("Bump done!")) {
            // Get the authors ID
            let user = message.interaction.user;

            await addBump(user.id, message.guild.id);

            // Check for bot server
            if (message.guild.id === config.botServer.id)
                await addMoneyFor(user.id, randomFromRange(config.economy.bump.min, config.economy.bump.max));
        }
    }
}

export default handler;