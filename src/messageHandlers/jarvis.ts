import { AttachmentBuilder } from "discord.js";
import { HypnoMessageHandler } from "../types/util";
import { addCaptionToGif } from "../commands/fun/_image_util";
import config from "../config";

const handler: HypnoMessageHandler = {
  name: "jarvis",
  description: 'Sends a jarvis message when a message starts with "Jarvis"',

  handler: async (message) => {
    if (!message.content.startsWith("Jarvis,")) return;
    const file = addCaptionToGif(
      config.dataDirectory + "/jarvis.gif",
      message.content
    );
    await message.reply({
      files: [new AttachmentBuilder(file.buffer, { name: file.name })],
    });
  },
};

export default handler;
