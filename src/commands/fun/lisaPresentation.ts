import { LisaPresentation } from "discord-image-generation";
import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";

const command: HypnoCommand<{ content: string }> = {
  name: "listpresentation",
  type: "fun",
  aliases: ["lisa", "lisapres"],
  description: "Lisa Presentation",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "content",
        type: "string",
        infer: true,
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let image = await new LisaPresentation().getImage(args.content);
    return message.reply({
      files: [new AttachmentBuilder(image).setName("list.png")],
    });
  },
};

export default command;
