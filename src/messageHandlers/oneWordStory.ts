import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { actions } from "../util/database";
import { createEmbed } from "../util/other";

const handler: HypnoMessageHandler = {
  name: "one-word-stories",
  description: "Handles the one word story game",

  handler: async (message) => {
    if (message.channel.id !== config.botServer.channels.oneWordStory) return;
    if (!message.content.match(/[^ ]+/)) return;

    // Only one peron can send it consecutivly
    if (
      (await actions.oneWordStories.getCurrentFor(message.guild.id))
        .last_user === message.author.id
    )
      return message.react("⏳");

    // Update sentence
    const finished = await actions.oneWordStories.addWordFor(
      message.guild.id,
      message.content.trim(),
      message.author.id,
    );

    // Check if done
    if (finished.done) {
      await message.react("🔥");
      const channel = await message.client.channels.fetch(
        config.botServer.channels.oneWordStorySend,
      );
      if (!channel.isTextBased()) return;

      await channel.send({
        embeds: [
          createEmbed()
            .setTitle("One Word Story")
            .setDescription(finished.sentence),
        ],
      });
    } else {
      await message.react("✅");
    }
  },
};

export default handler;
