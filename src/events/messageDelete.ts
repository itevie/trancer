import { TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { createEmbed } from "../util/other";
import { actions } from "../util/database";

client.on("messageDelete", async (message) => {
  // Check if channel has a count
  let count = await actions.serverCount.getFor(message.guild.id);
  if (count && message.channel.id === count.channel_id) {
    const channel = (await client.channels.fetch(
      count.channel_id
    )) as TextChannel;
    await channel.send({
      embeds: [
        createEmbed()
          .setTitle(`Count Edited`)
          .setColor("#FFFF00")
          .setDescription(
            `**${
              message.author.username
            }** deleted their number! The next number is **${
              count.current_count + 1
            }**`
          ),
      ],
    });
  }

  if (message.guild.id !== config.botServer.id) return;

  const channel = await client.channels.fetch(config.botServer.channels.logs);
  if (channel.isTextBased()) {
    await channel.send({
      embeds: [
        createEmbed()
          .setTitle(`Message deleted in #${(message.channel as any).name}`)
          .setDescription(message.content || "*No content*")
          .setColor("#FF0000")
          .setAuthor({
            iconURL:
              message.author?.displayAvatarURL() ??
              "https://dawn.rest/cdn/no_pfp.png",
            name: message.author?.username ?? "No Username",
          }),
      ],
    });
  }
});
