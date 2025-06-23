import {
  AttachmentBuilder,
  EmbedBuilder,
  Message,
  TextBasedChannel,
  User,
} from "discord.js";
import { database } from "../database";
import { createEmbed } from "../other";
import { client } from "../..";
import cachedUsernames from "../cachedUsernames";
import { addAbortSignal } from "stream";
import { addMessageForCurrentTime } from "../analytics";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { Canvas, CanvasRenderingContext2D, loadImage } from "canvas";

const _actions = {
  add: async (message: Message, createdBy: string): Promise<Quote> => {
    await database.run(
      `INSERT INTO quotes (content, author_id, server_id, message_id, channel_id, created_by) VALUES ((?), (?), (?), (?), (?), (?));`,
      message.content,
      message.author.id,
      message.guild.id,
      message.id,
      message.channel.id,
      createdBy,
    );
    return (await database.get(
      `SELECT * FROM quotes ORDER BY id DESC LIMIT 1`,
    )) as Quote;
  },

  getById: async (id: number): Promise<Quote> => {
    return (await database.get(
      `SELECT * FROM quotes WHERE id = (?)`,
      id,
    )) as Quote;
  },

  getForServer: async (serverId: string): Promise<Quote[]> => {
    return await database.all<Quote[]>(
      "SELECT * FROM quotes WHERE server_id = ?;",
      serverId,
    );
  },

  getForUser: async (authorId: string): Promise<Quote[]> => {
    return await database.all<Quote[]>(
      "SELECT * FROM quotes WHERE author_id = ?;",
      authorId,
    );
  },

  getFirstQuote: async (serverId: string): Promise<Quote> => {
    return await database.get<Quote>(
      "SELECT * FROM quotes WHERE server_id = ? ORDER BY id ASC;",
      serverId,
    );
  },

  getLastQuote: async (serverId: string): Promise<Quote> => {
    return await database.get<Quote>(
      "SELECT * FROM quotes WHERE server_id = ? ORDER BY id DESC;",
      serverId,
    );
  },

  getRandomQuote: async (from?: string): Promise<Quote> => {
    for (let i = 0; i != 10; i++) {
      try {
        if (from)
          return await database.get(
            `SELECT * FROM quotes WHERE server_id = (?) ORDER BY RANDOM() LIMIT 1;`,
            from,
          );
        return await database.get(
          `SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1;`,
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
    isGame: boolean = false,
  ): Promise<EmbedBuilder> => {
    const embed = createEmbed().setTitle("Quote");
    embed.setFooter({
      text: isGame
        ? "Use guess (guess) to guess! (NO PREFIX)"
        : `Quote #${quote.id}`,
    });

    let makeFooter = (
      user: User | string,
      message?: Message,
      small: boolean = false,
    ) => {
      return `${
        typeof user === "string" ? cachedUsernames.getSync(user) : user.username
      }${!small ? ` - ${new Date(message?.createdAt || quote.created_at).toDateString()}` : ""}${
        message
          ? ` - [[Message Link]](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})`
          : ""
      }`;
    };

    let fallback = () => {
      embed.setDescription(
        `${quote.content.length !== 0 ? `*${quote.content}` : ""}\n - ${makeFooter(quote.author_id)}`,
      );
    };

    if (!quote.message_id || !quote.channel_id) {
      fallback();
      return embed;
    }

    try {
      const channel = (await client.channels.fetch(
        quote.channel_id,
      )) as TextBasedChannel;
      const message = await channel.messages.fetch(quote.message_id);

      // Main quote
      let description =
        message.content.length > 0 ? `*${message.content}*` : "";
      if (!isGame) description += "\n - " + makeFooter(message.author, message);

      // Check for reference
      if (message.reference) {
        let reference = await message.fetchReference();
        let amount = 1;

        do {
          description += `\n:arrow_right_hook: ${
            reference.content.length === 0 ? "" : `*${reference.content}*`
          }`;
          if (!isGame)
            description += ` - ${makeFooter(reference.author, reference, true)}`;
          reference = reference.reference
            ? await reference.fetchReference()
            : null;
        } while (reference !== null && amount < 5);
      }

      embed.setDescription(description);

      // Check if it has an embed
      if (message.embeds.length > 0) {
        const msgEmbed = message.embeds[0];
        embed.addFields({
          name: `Embed: ${msgEmbed.title || "(No title)"}`,
          value: msgEmbed.description || "(No description)",
        });
        if (msgEmbed.thumbnail) embed.setThumbnail(msgEmbed.thumbnail.url);
        if (msgEmbed.image) embed.setImage(msgEmbed.image.url);
        if (msgEmbed.fields.length > 0) embed.addFields(...msgEmbed.fields);
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
          embed.setImage(attachment.proxyURL);
        }
      }
    } catch {
      fallback();
    }

    return embed;
  },

  generateQuoteImage: async (quote: Quote): Promise<AttachmentBuilder> => {
    const width = 1920;
    const height = 1080;
    const user = await client.users.fetch(quote.author_id);
    let ref: User | null = null;

    try {
      const channel = await client.channels.fetch(quote.channel_id);
      const message = await (channel as TextBasedChannel).messages.fetch(
        quote.message_id,
      );
      if (message.reference) {
        ref = (await message.fetchReference()).author;
      }
    } catch {}

    const image = await loadImage(
      user.displayAvatarURL({ extension: "png", size: 2048 }),
    );

    const pfpSize = height;
    const mainQuoteFontSize = 72;
    const displayNameFontSize = mainQuoteFontSize - 16;
    const usernameFontSize = displayNameFontSize - 16;

    const canvas = new Canvas(width, height, "image");
    const ctx = canvas.getContext("2d");

    // Make it all black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pfp
    ctx.drawImage(image, 0, 0, pfpSize, pfpSize);

    // Overlay
    const gradient = ctx.createLinearGradient(width / 2, 0, 0, 0);
    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw main quote
    const lines = splitByLengthWithWhitespace(quote.content, 25);
    let y = height / 2 - (lines.length / 2) * mainQuoteFontSize;
    const x = width / 1.3 - mainQuoteFontSize;
    ctx.font = `bold ${mainQuoteFontSize}px serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    for (const line of lines) {
      ctx.fillText(line, x, y);
      y += mainQuoteFontSize;
    }

    // Display name
    ctx.font = `italic ${displayNameFontSize}px serif`;
    ctx.fillText(
      `- ${user.displayName}${ref ? ` to ${ref.username}` : ""}`,
      x,
      y,
    );
    y += displayNameFontSize;

    // Username
    ctx.font = `italic ${usernameFontSize}px serif`;
    ctx.fillStyle = "gray";
    ctx.fillText(`@${user.username}`, x, y);

    // ID
    ctx.textAlign = "right";
    ctx.fillText(`ID #${quote.id}`, width - 24, height - 24);

    // Make it gray
    applyGrayscale(ctx, 0, 0, width, height);

    // Done
    const img = canvas.toBuffer("image/png");
    const attachment = new AttachmentBuilder(img).setFile(img);

    return attachment;
  },
} as const;

export default _actions;

export function splitByLengthWithWhitespace(str: string, maxLength = 20) {
  const result = [];
  let remaining = str;

  while (remaining.length > maxLength) {
    // Try to find the last whitespace before maxLength
    let splitAt = remaining.lastIndexOf(" ", maxLength);
    if (splitAt === -1) splitAt = maxLength; // fallback to hard split

    result.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining.length > 0) result.push(remaining);

  return result;
}

function applyGrayscale(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Calculate luminance using weighted average
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const avg = 0.299 * r + 0.587 * g + 0.114 * b;

    // Set R, G, B to the grayscale value
    data[i] = data[i + 1] = data[i + 2] = avg;
  }

  ctx.putImageData(imageData, x, y);
}
