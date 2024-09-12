import { Attachment, Message, PartialMessage, TextChannel } from "discord.js";
import { database } from "../database";
import { createEmbed } from "../other";

export async function getStarboardFor(serverId: string): Promise<StarBoard | null> {
    let result = await database.get<StarBoard>(`SELECT * FROM star_board WHERE server_id = ?`, serverId);
    if (!result) return null;
    return result;
}

export async function setupStarboard(serverId: string, channelId: string): Promise<StarBoard> {
    let exists = await getStarboardFor(serverId) !== null;
    if (exists)
        return await database.get(`UPDATE star_board SET channel_id = ? WHERE server_id = ? RETURNING *;`, channelId, serverId);
    else return await database.get(`INSERT INTO star_board (server_id, channel_id) VALUES (?, ?) RETURNING *;`, serverId, channelId);
}

export async function getStarboardMessage(messageId: string): Promise<StarBoardMessage> {
    return await database.get(`SELECT * FROM star_board_messages WHERE message_id = ? OR star_board_message_id = ?`, messageId, messageId);
}

export async function createStarboardMessage(message: Message | PartialMessage, amount: number): Promise<void> {
    // Send message in starboard
    let starboard = await getStarboardFor(message.guild.id);
    let channel = await message.client.channels.fetch(starboard.channel_id) as TextChannel;

    // Check if has attachment
    let attachment: Attachment | null = null;
    if (message.attachments.size > 0) {
        attachment = message.attachments.at(0);
    }

    // Create embed
    let embed = createEmbed()
        .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL()
        })
        .setDescription(
            `${message.content}\n\n[Jump To Message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`
        );

    // Check if should add attachment
    if (attachment)
        embed.setImage(attachment.proxyURL);

    // Send message
    let msg = await channel.send({
        content: `${starboard.emoji} ${amount} | <#${message.channel.id}>`,
        embeds: [
            embed
        ]
    });

    await msg.react(starboard.emoji);

    await database.run(`INSERT INTO star_board_messages (message_id, star_board_message_id, channel_id) VALUES (?, ?, ?);`, message.id, msg.id, message.channel.id);
}