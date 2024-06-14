import { EmbedBuilder, Message } from "discord.js";
import { database } from "../database";
import { createEmbed } from "../other";
import { client } from "../..";

export async function addQuote(message: Message): Promise<Quote> {
    await database.run(
        `INSERT INTO quotes (content, author_id, server_id, message_id) VALUES ((?), (?), (?), (?));`,
        message.content, message.author.id, message.guild.id, message.id,
    );
    return await database.get(`SELECT * FROM quotes ORDER BY id DESC LIMIT 1`) as Quote;
}

export async function getQuote(id: number): Promise<Quote> {
    return await database.get(`SELECT * FROM quotes WHERE id = (?)`, id) as Quote;
}

export async function randomQuote(from?: string): Promise<Quote> {
    if (from)
        return await database.get(`SELECT * FROM quotes WHERE server_id = (?) ORDER BY RANDOM() LIMIT 1;`, from);
    return await database.get(`SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1;`);
}

export async function deleteQuote(id: number): Promise<void> {
    await database.run(`DELETE FROM quotes WHERE id = (?)`, id);
}

export async function genQuote(quote: Quote): Promise<EmbedBuilder> {
    return createEmbed()
        .setFooter({
            text: `Quote #${quote.id}`
        })
        .setTitle("Quote")
        .setDescription(`*${quote.content}*\n   \- ${(await client.users.fetch(quote.author_id)).username} (${new Date().toDateString()})`)
}