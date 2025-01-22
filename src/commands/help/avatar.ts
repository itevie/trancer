import { ImageFormat, ImageSize, User } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{
  user?: User;
  size?: ImageSize;
  format?: ImageFormat;
}> = {
  name: "avatar",
  description: "Get a user's avatar",
  aliases: ["pfp"],
  type: "help",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
      {
        name: "size",
        type: "wholepositivenumber",
        oneOf: [16, 32, 64, 128, 256, 512, 1024, 2048, 4096],
        wickStyle: true,
      },
      {
        name: "format",
        type: "string",
        oneOf: ["webp", "png", "jpg", "jpeg", "gif"],
        wickStyle: true,
      },
    ],
  },

  handler: (message, { args }) => {
    let user = args.user ? args.user : message.author;
    return message.reply(
      `${user.displayAvatarURL({
        size: args.size || 2048,
        extension: args.format || ("png" as any),
      })}`
    );
  },
};

export default command;
