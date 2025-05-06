import {
  EmbedBuilder,
  Message,
  TextChannel,
  Webhook,
  WebhookMessageCreateOptions,
} from "discord.js";
import { createEmbed } from "./other";

let webhookCache = new Map<string, Webhook>();

export async function sendProxyMessage(
  channel: TextChannel,
  data: WebhookMessageCreateOptions,
): Promise<Message> {
  if (!webhookCache.has(channel.id)) {
    let existing = await channel.fetchWebhooks();
    let webook = existing.find((w) => w.name === "TrancerWebhook");

    if (!webook)
      webook = await channel.createWebhook({
        name: "TrancerWebhook",
        reason: "UwU",
      });

    webhookCache.set(channel.id, webook);
  }

  const webook = webhookCache.get(channel.id);

  return await webook.send(data);
}

export function createMessageRefEmbed(message: Message): EmbedBuilder {
  return createEmbed()
    .setAuthor({
      url: message.author.displayAvatarURL(),
      name: message.author.username,
    })
    .setDescription(
      `**[Reply to:](${messageLink(message)})** ${message.content}`,
    );
}

export function messageLink(message: Message) {
  return `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
}
