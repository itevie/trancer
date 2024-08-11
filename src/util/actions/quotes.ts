import { Attachment, EmbedBuilder, Message, User } from "discord.js";
import { database } from "../database";
import { createEmbed } from "../other";
import { client } from "../..";
import { inspect } from "util";

export async function addQuote(message: Message): Promise<Quote> {
    await database.run(
        `INSERT INTO quotes (content, author_id, server_id, message_id, channel_id) VALUES ((?), (?), (?), (?), (?));`,
        message.content, message.author.id, message.guild.id, message.id, message.channel.id
    );
    return await database.get(`SELECT * FROM quotes ORDER BY id DESC LIMIT 1`) as Quote;
}

export async function getQuote(id: number): Promise<Quote> {
    return await database.get(`SELECT * FROM quotes WHERE id = (?)`, id) as Quote;
}

export async function randomQuote(from?: string): Promise<Quote> {
    for (let i = 0; i != 10; i++) {
        try {
            if (from)
                return await database.get(`SELECT * FROM quotes WHERE server_id = (?) ORDER BY RANDOM() LIMIT 1;`, from);
            return await database.get(`SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1;`);
        } catch { }
    }

    throw new Error("Failed to fetch quote");
}

export async function deleteQuote(id: number): Promise<void> {
    await database.run(`DELETE FROM quotes WHERE id = (?)`, id);
}

export async function genQuote(quote: Quote, hideUser: boolean = false): Promise<EmbedBuilder> {
    // Try fetch the user
    let user: User | null = null;
    try {
        user = await client.users.fetch(quote.author_id);
    } catch (e) { 1; }

    // Check if it has messages
    let message: Message | null = null;
    if (quote.message_id && quote.channel_id) {
        try {
            let channel = await client.channels.fetch(quote.channel_id);
            if (channel.isTextBased()) {
                message = await channel.messages.fetch(quote.message_id);
            }
        } catch { }
    }

    let messageLink: string = "";
    if (message) {
        messageLink = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;
    }

    // Check if there is an image
    let image: string | null = null;
    if (message) {
        for (let embed of message.embeds) {
            if (embed.data.url) {
                image = embed.data.image?.proxy_url
                    || embed.data.thumbnail?.proxy_url
                    || null
            }
        }
    }

    // Override if attachment
    if (message?.attachments?.size > 0) {
        let attachment = message.attachments.entries().next().value[1] as Attachment;
        if (["image/png", "image/jpeg", "image/jpg", "image/gif", "image/gifv"].includes(attachment.contentType)) {
            image = attachment.proxyURL;
        }
    }

    // Construct embed
    let embed = createEmbed()
        .setTitle("Quote")

    if (!hideUser) {
        embed.setDescription(`*${quote.content}*\n - ${user ? user.username : "*(failed to get user details)*"
            } - (${new Date(quote.created_at).toDateString()})${messageLink ? ` - [Message Link](${messageLink})` : ""}`);
        embed.setFooter({
            text: `Quote #${quote.id}`
        })
    } else {
        embed.setDescription(`*${quote.content}*`);
        embed.setFooter({ text: `Use guess (guess) to guess!` });
    }

    // Add image to embed if there was one
    if (image) {
        embed.setImage(image);
    }

    return embed;
}