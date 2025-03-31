import Canvas from "canvas";
import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";
import { Jimp } from "jimp";

const command: HypnoCommand<{ code: string; image: string }> = {
  name: "countryflag",
  aliases: ["cflag"],
  description: "Overlay a country's flag over a image",
  type: "fun",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "code",
        type: "string",
        description: "The country code",
      },
      {
        name: "image",
        type: "attachment",
        infer: true,
        defaultPfp: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    console.log(args);
    try {
      // Load images
      let _bg = await Jimp.read(
        `https://flagcdn.com/w2560/${args.code.toLowerCase()}.png`,
      );
      let _img = await Jimp.read(args.image);

      // Modify
      _bg.resize({ w: 480 });
      _img.resize({ w: 480 });
      _bg.opacity(0.4);

      // Buffer and add to canvas
      let bgBuffer = await _bg.getBuffer("image/png");
      let imgBuffer = await _img.getBuffer("image/png");
      let bg = await Canvas.loadImage(bgBuffer);
      let img = await Canvas.loadImage(imgBuffer);

      // Draw
      const canvas = Canvas.createCanvas(480, 480);
      const ctx = canvas.getContext(`2d`);
      ctx.drawImage(img, 0, 0, 480, 480);
      ctx.drawImage(bg, 0, 0, 480, 480);

      // Done
      const attachment = new AttachmentBuilder(
        canvas.toBuffer("image/png"),
      ).setName(`${args.code}.png`);
      return message.reply({
        files: [attachment],
      });
    } catch (e) {
      console.log(e);
      return message.reply(
        `Failed to make image - did you provide a valid country code? (e.g. GB, FR)`,
      );
    }
  },
};

export default command;
