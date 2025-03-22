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
    // Fetch all deteails
    const embed = createEmbed().setTitle("Quote");
    let user: User | null = null;
    let message: Message | null = null;
    let image: string | null = null;
    let messageLink = "";

    // Try fetch user so it can show username
    try {
      user = await client.users.fetch(quote.author_id);
    } catch {}

    // Check if it is a newer quote so it can have replies
    if (quote.message_id && quote.channel_id) {
      try {
        const channel = await client.channels.fetch(quote.channel_id);
        if (channel.isTextBased()) {
          message = await channel.messages.fetch(quote.message_id);
        }
      } catch {}
    }

    if (message) {
      messageLink = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;

      for (const embed of message.embeds) {
        image =
          embed.data.image?.proxy_url ||
          embed.data.thumbnail?.proxy_url ||
          image;
      }

      if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        if (
          attachment &&
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
    }

    if (image) embed.setImage(image);

    let description = quote.content ? `*${quote.content}*` : "";
    if (!hideUser) {
      description += `\n - ${
        user ? user.username : "*(failed to get user)*"
      } - ${new Date(quote.created_at).toDateString()}`;
      if (messageLink) description += ` - [Message Link](${messageLink})`;

      if (message && message.embeds.length > 0) {
        const msgEmbed = message.embeds[0];
        embed.addFields({
          name: `Embed: ${msgEmbed.title || "(No title)"}`,
          value: msgEmbed.description || "(No description)",
        });
        if (!image && msgEmbed.image) embed.setImage(msgEmbed.image.url);
        if (msgEmbed.thumbnail) embed.setThumbnail(msgEmbed.thumbnail.url);
        if (msgEmbed.fields.length > 0) embed.addFields(...msgEmbed.fields);
      }
    } else if (message?.reference) {
      try {
        const ref = await message.fetchReference();
        description += `\n:arrow_right_hook: ${ref.content}`;
      } catch {}
    }

    embed.setDescription(description.length === 0 ? "**" : description);
    embed.setFooter({
      text: hideUser
        ? "Use guess (guess) to guess! (NO PREFIX)"
        : `Quote #${quote.id}`,
    });

    return embed;
  },
} as const;

export default _actions;
