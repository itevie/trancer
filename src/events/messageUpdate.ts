import { TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { getServerCount } from "../util/actions/serverCount";
import { createEmbed } from "../util/other";

client.on("messageUpdate", async (old, newMsg) => {
  // Check if channel has a count
  let count = await getServerCount(old.guild.id);
  if (count && old.channel.id === count.channel_id) {
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
              old.author.username
            }** edited their number! The next number is **${
              count.current_count + 1
            }**`
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
          ])
          .setColor("#FFFF00")
          .setAuthor({
            iconURL: newMsg.author.displayAvatarURL(),
            name: newMsg.author.username,
          }),
      ],
    });
  }
});
