import { resolve } from "path";
import { Attachment } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { getCardById } from "../../util/actions/cards";
import { downloadFile } from "../../util/fileDownloader";
import { database } from "../../util/database";
import { generateCardEmbed } from "../../util/cards";

const command: HypnoCommand<{ id: number }> = {
    name: "setcardimage",
    description: "Set a card's image",
    type: "cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            }
        ]
    },

    botOwnerOnly: true,

    handler: async (message, { args }) => {
        const card = await getCardById(args.id);
        if (!card) return message.reply("That card does not exist!");

        const image = (message.attachments.entries().next().value[1] as Attachment);

        if (!["image/png", "image/gif"].includes(image.contentType))
            return message.reply("Please provide a png");

        // Write file
        let fileName = `${card.name}-${card.rarity}-${card.id}.${image.contentType === "image/png" ? "png" : "gif"}`;
        let path = resolve(__dirname + "/../../data/card_images/" + fileName);

        // Try save file
        try {
            await downloadFile(image.proxyURL, path);
        } catch {
            return message.reply(`Failed to save the image!`);
        }

        let c = await database.get(`UPDATE cards SET file_name = ?, link = ? WHERE id = ? RETURNING *;`, fileName, image.proxyURL, card.id) as Card;
        return message.reply({
            embeds: [
                await generateCardEmbed(c)
            ]
        });
    }
};

export default command;