import { AttachmentBuilder, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import DIG from "discord-image-generation";

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
  trash: "Trash",
  circle: "Circle",
};

const command: HypnoCommand<{ type: keyof typeof allowed; user?: User }> = {
  name: "image",
  aliases: ["img"],
  type: "fun",
  description: "Generate images",

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
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;

    let attachment =
      message.attachments.size > 0
        ? message.attachments.at(0).url
        : user.displayAvatarURL({
            forceStatic: true,
            extension: "png",
          });

    let img = await new DIG[allowed[args.type]]().getImage(attachment);
    let attach = new AttachmentBuilder(img).setName(`${args.type}.png`);
    return message.reply({
      files: [attach],
    });
  },
};

export default command;
