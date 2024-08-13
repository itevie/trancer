import { HypnoMessageHandler } from "../types/messageHandler";
import { createLeaderboard, insertLeaderboardEntry, leaderboardExists } from "../util/actions/leaderboards";
import { addBump } from "../util/actions/userData";
import config from "../config";
import { addMoneyFor } from "../util/actions/economy";
import { createEmbed, randomFromRange } from "../util/other";
import { database } from "../util/database";
import { client } from "..";
import { getServerSettings } from "../util/actions/settings";

setInterval(async () => {
    let botServerSettings = await getServerSettings(config.botServer.id);

    // Compute
    if (7.2e+6 - (Date.now() - botServerSettings.last_bump) < 0) {
        // Update so it doesn't ask again
        if (!botServerSettings.bump_reminded) {
            await database.run(`UPDATE server_settings SET bump_reminded = true WHERE server_id = ?;`, config.botServer.id);

            // Send message
            let channel = await client.channels.fetch(config.botServer.channels.bumps);
            if (channel.isTextBased()) {
                await channel.send({
                    content: `${botServerSettings.last_bumper ? `<@${(await client.users.fetch(botServerSettings.last_bumper)).id}>` : ""}`,
                    embeds: [
                        createEmbed()
                            .setTitle("It's time to bump!")
                            .setDescription(`Run \`/bump\` with DISBOARD to help us grow!`)
                    ]
                });
            }
        }
    }
}, 1000);

const handler: HypnoMessageHandler = {
    name: "bump-detector",
    description: "Detects /bump and adds to leaderboard",
    botsOnly: true,

    handler: async message => {
        if (client.user.id === config.devBot)
            return;

        // Check if the message is sent by Disboard & the embed contains "Bump done!"
        if (message.author.id === "302050872383242240" && message.embeds[0].data.description.includes("Bump done!")) {
            // Get the authors ID
            let user = message.interaction.user;

            await addBump(user.id, message.guild.id);
            await database.run(`UPDATE server_settings SET last_bump = ? WHERE server_id = ?;`, Date.now(), config.botServer.id);
            await database.run(`UPDATE server_settings SET bump_reminded = false WHERE server_id = ?;`, config.botServer.id);
            await database.run(`UPDATE server_settings SET last_bumper = ? WHERE server_id = ?;`, user.id, config.botServer.id);

            // Check for bot server
            if (message.guild.id === config.botServer.id) {

                let money = randomFromRange(config.economy.bump.min, config.economy.bump.max);

                await message.reply({
                    embeds: [
                        createEmbed()
                            .setTitle("Thanks for bumping our server!")
                            .setDescription(`You have been awarded **${money}${config.economy.currency}**\n\nI will remind you again in **2 hours**!`)
                    ]
                });
                await addMoneyFor(user.id, money);
            }
        }
    }
}

export default handler;