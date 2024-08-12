import { TextBasedChannel } from "discord.js";
import { client } from "..";
import config from "../config.json";
import { createEmbed } from "../util/other";

client.on("messageDelete", async message => {
    const channel = await client.channels.fetch(config.botServer.channels.logs);
    if (channel.isTextBased()) {
        await channel.send({
            embeds: [
                createEmbed()
                    .setTitle(`Message deleted in #${(message.channel as any).name}`)
                    .setDescription(message.content)
                    .setColor("#FF0000")
                    .setAuthor({
                        iconURL: message.author.displayAvatarURL(),
                        name: message.author.username
                    })
            ]
        });
    }
});