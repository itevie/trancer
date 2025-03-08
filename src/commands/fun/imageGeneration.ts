import { AttachmentBuilder, Message, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import DIG from "discord-image-generation";
import {
  createRotatingGifBuffer,
  generateNotImmuneImage,
  generateSpeechbubbleImage,
} from "./_image_util";

function genClass(func: any) {
  return class Temp {
    async getImage(attachment: any): Promise<any> {
      return func(attachment);
    }
  };
}

let imageFunctions = {
  ...DIG,
  NotImmune: genClass(generateNotImmuneImage),
  SpeechBubble: genClass(generateSpeechbubbleImage),
  Rotate: genClass(createRotatingGifBuffer),
};

export let allowed: Record<string, string> = {
  gay: "Gay",
  blur: "Blur",
  greyscale: "Greyscale",
  invert: "Invert",
  sepia: "Sepia",
  triggered: "Triggered",
  ad: "Ad",
  affect: "Affect",
  "12yearslater": "Affect",
  beautiful: "Beautiful",
  bobross: "Bobross",
  deepfry: "Deepfry",
  delete: "Delete",
  greatpoint: "Heartbreaking",
  jail: "Jail",
  catch: "Catch",
  "m&ms": "Mms",
  mms: "Mms",
  notstonk: "Notstonk",
  rip: "Rip",
  stonk: "Stonk",
  stonks: "Stonk",
  trash: "Trash",
  circle: "Circle",
  wanted: "Wanted",
  notimmune: "NotImmune",
  speechbubble: "SpeechBubble",
  bubble: "SpeechBubble",
  rotate: "Rotate",
};

const command: HypnoCommand<{
  type: keyof typeof allowed;
  user?: User;
  attachment: string;
}> = {
  name: "image",
  aliases: ["img"],
  type: "fun",
  description:
    "Generate images\nTypes: " +
    Object.keys(allowed)
      .map((x) => `**${x}**`)
      .join(", "),

  args: {
    requiredArguments: 2,
    args: [
      {
        type: "string",
        name: "type",
        oneOf: Object.keys(allowed),
      },
      {
        type: "attachment",
        name: "attachment",
        infer: true,
        defaultPfp: true,
      },
      {
        type: "user",
        name: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let img = await new imageFunctions[allowed[args.type]]().getImage(
      args.attachment
    );
    let attach = new AttachmentBuilder(img).setName(`${args.type}.png`);
    return message.reply({
      files: [attach],
    });
  },
};

export default command;
