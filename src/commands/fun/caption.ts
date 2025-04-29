import { AttachmentBuilder } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { addCaptionToGif } from "./_image_util";
import { downloadFile } from "../../util/other";
import { randomUUID } from "crypto";
import { unlink } from "fs/promises";

const command: HypnoCommand<{ image: string; content: string }> = {
  name: "caption",
  description: "Caption an image / gif",
  type: "fun",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "image",
        type: "attachment",
        infer: true,
      },
      {
        name: "content",
        type: "string",
        takeRest: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const ext =
      args.image
        .match(/\.([a-z0-9]{2,5})(?=($|\?|#))/i)?.[1]
        ?.replace(".", "") ?? "png";
    const filePath = `/tmp/${randomUUID()}.${ext}`;
    await downloadFile(args.image, `${filePath}`);
    const file = addCaptionToGif(filePath, args.content, ext);
    await unlink(filePath);
    await message.reply({
      files: [new AttachmentBuilder(file.buffer, { name: file.name })],
    });
  },
};

export default command;
