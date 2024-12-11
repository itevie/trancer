import { AttachmentBuilder, Message, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import DIG from "discord-image-generation";
import {
  generateNotImmuneImage,
  generateSpeechbubbleImage,
} from "../../util/imageGeneration";

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
};

let allowed: Record<string, string> = {
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
};

const command: HypnoCommand<{
  type: keyof typeof allowed;
  user?: User;
  url?: string;
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
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "type",
        oneOf: Object.keys(allowed),
      },
      {
        type: "user",
        name: "user",
        infer: true,
      },
      {
        type: "string",
        name: "url",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;
    let ref: Message | null = null;
    if (message.reference) ref = await message.fetchReference();

    let attachment = args.url
      ? args.url
      : message.attachments.size > 0
      ? message.attachments.at(0).url
      : ref && ref.attachments.size > 0
      ? ref.attachments.at(0).url
      : user.displayAvatarURL({
          forceStatic: true,
          extension: "png",
        });

    let img = await new imageFunctions[allowed[args.type]]().getImage(
      attachment
    );
    let attach = new AttachmentBuilder(img).setName(`${args.type}.png`);
    return message.reply({
      files: [attach],
    });
  },
};

export default command;
