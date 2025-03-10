import { AttachmentBuilder } from "discord.js";
import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { addCaptionToGif } from "./_image_util";

const command: HypnoCommand<{ caption: string }> = {
  name: "jarvis",
  description: "Jarvis.",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "caption",
        type: "string",
        infer: true,
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const result = addCaptionToGif(
      config.dataDirectory + "/jarvis.gif",
      args.caption
    );
    const attachment = new AttachmentBuilder(result.buffer, {
      name: result.name,
    });
    return message.reply({
      files: [attachment],
    });
  },
};

export default command;
