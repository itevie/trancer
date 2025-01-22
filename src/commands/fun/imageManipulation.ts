import { Jimp } from "jimp";
import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";
import { allowed } from "./imageGeneration";

const command: HypnoCommand<any> = {
  name: "imagemanipulation",
  aliases: ["imgm", "imgman", "imgmanipulation"],
  description: "Manipulate an image however you like!",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "attachment",
        type: "attachment",
        infer: true,
      },
      {
        name: "blur",
        type: "number",
        description: "Blur the image",
        wickStyle: true,
      },
      {
        name: "brightness",
        type: "number",
        description: "Change the brightness of an image",
        wickStyle: true,
      },
      {
        name: "contrast",
        type: "number",
        description: "Change the contrast of an image",
        wickStyle: true,
        min: -1,
        max: 1,
      },
      {
        name: "circle",
        type: "none",
        description: "Turns the image into a circle",
        wickStyle: true,
      },
      {
        name: "width",
        type: "wholepositivenumber",
        description: "Change the image's width",
        wickStyle: true,
        aliases: ["w"],
      },
      {
        name: "height",
        type: "wholepositivenumber",
        description: "Change the image's height",
        wickStyle: true,
        aliases: ["h"],
      },
      {
        name: "rotate",
        type: "wholepositivenumber",
        description: "Rotate an image",
        wickStyle: true,
        aliases: ["r"],
      },
      {
        name: "flipv",
        type: "boolean",
        description: "Flip vertically",
        wickStyle: true,
      },
      {
        name: "fliph",
        type: "boolean",
        description: "Flip horizontally",
        wickStyle: true,
      },
      {
        name: "fisheye",
        type: "number",
        description: "Fish eye filter",
        wickStyle: true,
        max: 6,
      },
      {
        name: "invert",
        type: "boolean",
        description: "Invert an image",
        wickStyle: true,
      },
      {
        name: "fade",
        type: "number",
        description: "Fades each pixel",
        wickStyle: true,
        min: 0,
        max: 1,
      },
      {
        name: "effects",
        type: "array",
        inner: "string",
        oneOf: Object.keys(allowed),
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let img: Awaited<ReturnType<typeof Jimp.read>>;
    try {
      img = await Jimp.read(args.attachment);
    } catch {
      return message.reply(`Failed to load the image: ${args.attachment}`);
    }

    if (args.blur) img.blur(args.blur);
    if (args.brightness) img.blur(args.brightness);
    if (args.contrast) img.contrast(args.contrast);
    if (args.rotate) img.rotate(args.rotate);
    if ("circle" in args) img.circle();
    if (args.invert) img.invert();
    if (args.fade) img.fade(args.fade);
    if (args.flipv || args.fliph)
      img.flip({
        horizontal: args.fliph || false,
        vertical: args.flipv || false,
      });
    if (args.width || args.height) {
      img.resize({
        w: args.width || img.width,
        h: args.height || img.height,
      });
    }
    if (args.fisheye) img.fisheye({ radius: args.fisheye });

    let attachment = new AttachmentBuilder(
      await img.getBuffer("image/png")
    ).setName("result.png");
    return await message.reply({
      files: [attachment],
    });
  },
};

export default command;
