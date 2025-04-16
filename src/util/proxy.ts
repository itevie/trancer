import {
  Message,
  TextChannel,
  Webhook,
  WebhookMessageCreateOptions,
} from "discord.js";

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
        name: "TrancerWebook",
        reason: "UwU",
      });

    webhookCache.set(channel.id, webook);
  }

  const webook = webhookCache.get(channel.id);

  return await webook.send(data);
}
