import { TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { createEmbed } from "../util/other";
import { actions } from "../util/database";
import { getUsernameSync } from "../util/cachedUsernames";

client.on("messageUpdate", async (old, newMsg) => {
  // Check if channel has a count
  let count = await actions.serverCount.getFor(old.guild.id);
  if (
    count &&
    old.channel.id === count.channel_id &&
    !old.author.bot &&
    old.content !== newMsg.content
  ) {
    const channel = (await client.channels.fetch(
      count.channel_id,
    )) as TextChannel;
    await channel.send({
      embeds: [
        createEmbed()
          .setTitle(`Count Edited`)
          .setColor("#FFFF00")
          .setDescription(
            `**${
              old.author.username
            }** edited their number! The next number is **${
              count.current_count + 1
            }**`,
          ),
      ],
    });
  }

  if (old.guild.id !== config.botServer.id) return;
  if (newMsg.author.bot) return;

  // Check if they are the same content (if so, probably some weird embed update)
  if (old.content === newMsg.content) return;

  const channel = await client.channels.fetch(config.botServer.channels.logs);
  if (channel.isTextBased()) {
    await channel.send({
      embeds: [
        createEmbed()
          .setTitle(`Message Eited in #${(newMsg.channel as any).name}`)
          .setDescription(newMsg.content || "*No content*")
          .addFields([
            {
              name: "Old Content",
              value: old.content || "*No Content*",
            },
            {
              name: "Link",
              value: `https://discord.com/channels/${newMsg.guildId}/${newMsg.channelId}/${newMsg.id}`,
            },
          ])
          .setColor("#FFFF00")
          .setAuthor({
            iconURL:
              newMsg.author?.displayAvatarURL() ??
              "https://dawn.rest/cdn/no_pfp.png",
            name:
              newMsg.author?.username ??
              getUsernameSync(newMsg.author.id) ??
              "No Username",
          }),
      ],
    });
  }
});
