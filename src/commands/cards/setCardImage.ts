import { resolve } from "path";
import { Attachment } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { generateCardEmbed } from "./_util";
import { downloadFile } from "../../util/other";

const command: HypnoCommand<{ card: Card }> = {
  name: "setcardimage",
  description: "Set a card's image",
  type: "cards",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "card",
        type: "card",
      },
    ],
  },

  handler: async (message, { args }) => {
    const image = message.attachments.entries().next().value[1] as Attachment;

    if (!["image/png", "image/gif"].includes(image.contentType))
      return message.reply("Please provide a png");

    // Write file
    let fileName = `${args.card.name}-${args.card.rarity}-${args.card.id}.${
      image.contentType === "image/png" ? "png" : "gif"
    }`;
    let path = resolve(__dirname + "/../../data/card_images/" + fileName);

    // Try save file
    try {
      await downloadFile(image.proxyURL, path);
    } catch {
      return message.reply(`Failed to save the image!`);
    }

    let c = (await database.get(
      `UPDATE cards SET file_name = ?, link = ? WHERE id = ? RETURNING *;`,
      fileName,
      image.proxyURL,
      args.card.id
    )) as Card;
    return message.reply({
      embeds: [await generateCardEmbed(c)],
    });
  },
};

export default command;
