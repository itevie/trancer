import { client } from "..";
import { HypnoMessageHandler } from "../types/util";
import { getServerCount } from "../util/actions/serverCount";
import { database } from "../util/database";
import { createEmbed } from "../util/other";
import config from "../config";

const handler: HypnoMessageHandler = {
    name: "counter",
    description: "Detects and updates the counting feature in a server",

    handler: async (message) => {
        // Get count & do guards
        let count = await getServerCount(message.guild.id);
        if (!count) return;
        if (message.channel.id !== count.channel_id) return;
        if (client.user.id === config.devBot) return;

        // Check if it contains a number
        if (!message.content.match(/^([0-9]+)$/)) return;
        let number = parseInt(message.content);

        if (count.last_counter === message.author.id)
            return message.reply(`You cannot count twice in a row - wait for someone else!`);

        // Check if it is expected
        if (number !== count.current_count + 1) {
            await database.run(`UPDATE server_count SET current_count = 0 WHERE server_id = ?`, message.guild.id);
            await message.react(`❌`);
            return message.reply({
                embeds: [
                    createEmbed()
                        .setTitle("Count ruined!")
                        .setDescription(`<@${message.author.id}> ruined the count! The next number was **${count.current_count + 1}**\n\nThe count has been reset, next number is **1**`)
                        .setColor(`#FF0000`)
                ]
            });
        }

        // Check if it is the highest
        if (number > count.highest_count)
            await database.run(`UPDATE server_count SET highest_count = ? WHERE server_id = ?`, number, message.guild.id);

        // Update & add reaction
        await database.run(`UPDATE server_count SET current_count = current_count + 1 WHERE server_id = ?`, message.guild.id);
        await database.run(`UPDATE server_count SET last_counter = ? WHERE server_id = ?`, message.author.id, message.guild.id);
        await message.react(number < count.highest_count ? `✅` : "☑️");
    }
};

export default handler;