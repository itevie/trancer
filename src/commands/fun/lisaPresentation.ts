import { LisaPresentation } from "discord-image-generation";
import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";

const command: HypnoCommand = {
  name: "listpresentation",
  type: "fun",
  aliases: ["lisa", "lisapres"],
  description: "Lisa Presentation",

  handler: async (message, { oldArgs }) => {
    if (oldArgs.length === 0) return message.reply("Please provide text!");

    let image = await new LisaPresentation().getImage(oldArgs.join(" "));
    return message.reply({
      files: [new AttachmentBuilder(image).setName("list.png")],
    });
  },
};

export default command;
