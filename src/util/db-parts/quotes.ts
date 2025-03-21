import { Attachment, EmbedBuilder, Message, User } from "discord.js";
import { database } from "../database";
import { createEmbed } from "../other";
import { client } from "../..";

const _actions = {
  add: async (message: Message, createdBy: string): Promise<Quote> => {
    await database.run(
      `INSERT INTO quotes (content, author_id, server_id, message_id, channel_id, created_by) VALUES ((?), (?), (?), (?), (?), (?));`,
      message.content,
      message.author.id,
      message.guild.id,
      message.id,
      message.channel.id,
      createdBy
    );
    return (await database.get(
      `SELECT * FROM quotes ORDER BY id DESC LIMIT 1`
    )) as Quote;
  },

  getById: async (id: number): Promise<Quote> => {
    return (await database.get(
      `SELECT * FROM quotes WHERE id = (?)`,
      id
    )) as Quote;
  },

  getForServer: async (serverId: string): Promise<Quote[]> => {
    return await database.all<Quote[]>(
      "SELECT * FROM quotes WHERE server_id = ?;",
      serverId
    );
  },

  getForUser: async (authorId: string): Promise<Quote[]> => {
    return await database.all<Quote[]>(
      "SELECT * FROM quotes WHERE author_id = ?;",
      authorId
    );
  },

  getRandomQuote: async (from?: string): Promise<Quote> => {
    for (let i = 0; i != 10; i++) {
      try {
        if (from)
          return await database.get(
            `SELECT * FROM quotes WHERE server_id = (?) ORDER BY RANDOM() LIMIT 1;`,
            from
          );
        return await database.get(
          `SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1;`
        );
      } catch {}
    }

    throw new Error("Failed to fetch quote");
  },

  delete: async (id: number): Promise<void> => {
    await database.run(`DELETE FROM quotes WHERE id = (?)`, id);
  },

  generateEmbed: async (
    quote: Quote,
    hideUser: boolean = false
  ): Promise<EmbedBuilder> => {
    let user: User | null = null;
    try {
      user = await client.users.fetch(quote.author_id);
    } catch (e) {
      1;
    }

    let message: Message | null = null;
    if (quote.message_id && quote.channel_id) {
      try {
        let channel = await client.channels.fetch(quote.channel_id);
        if (channel.isTextBased()) {
          message = await channel.messages.fetch(quote.message_id);
        }
      } catch {}
    }

    let messageLink: string = "";
    if (message) {
      messageLink = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;
    }

    let image: string | null = null;
    if (message) {
      for (let embed of message.embeds) {
        if (embed.data.url) {
          image =
            embed.data.image?.proxy_url ||
            embed.data.thumbnail?.proxy_url ||
            null;
        }
      }
    }

    if (message?.attachments?.size > 0) {
      let attachment = message.attachments.entries().next()
        .value[1] as Attachment;
      if (
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/gifv",
        ].includes(attachment.contentType)
      ) {
        image = attachment.proxyURL;
      }
    }

    let embed = createEmbed().setTitle("Quote");

    if (!hideUser) {
      let text =
        quote.content.startsWith("*") || quote.content.endsWith("*")
          ? quote.content
          : `*${quote.content}*`;

      text +=
        `\n - ${user ? user.username : "*(failed to get user)*"} - ` +
        `${new Date(quote.created_at).toDateString()} - ` +
        `${messageLink ? `[Message Link](${messageLink})` : ""}`;
      embed.setDescription(text);
      embed.setFooter({
        text: `Quote #${quote.id}`,
      });
    } else {
      let text = `*${quote.content}*`;

      if (message.reference) {
        try {
          const ref = await message.fetchReference();
          text += `\n:arrow_right_hook: ${ref.content}`;
        } catch {}
      }

      embed.setDescription(text);
      embed.setFooter({ text: `Use guess (guess) to guess! (NO PREFIX)` });
    }

    if (image) {
      embed.setImage(image);
    }

    return embed;
  },
} as const;

export default _actions;
