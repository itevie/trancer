import { resolve } from "path";
import { HypnoCommand } from "../../types/command";
import { addCard, getDeckById } from "../../util/actions/cards";
import { generateCardEmbed, rarities } from "../../util/cards";
import { Attachment } from "discord.js";
import { downloadFile } from "../../util/other";

const command: HypnoCommand<{ deck: Deck, name: string, rarity: string }> = {
    name: "+card",
    type: "cards",
    description: "Add a card to a deck",

    botOwnerOnly: true,

    args: {
        requiredArguments: 3,
        args: [
            {
                name: "deck",
                type: "deck"
            },
            {
                name: "name",
                type: "string"
            },
            {
                name: "rarity",
                type: "string"
            },
        ]
    },

    handler: async (message, { args }) => {
        // Check for attachments
        if (message.attachments.size !== 1)
            return message.reply(`Please attach an image for the card.`);

        const image = (message.attachments.entries().next().value[1] as Attachment);

        if (!["image/png", "image/gif"].includes(image.contentType))
            return message.reply("Please provide a png or gif");

        // Check rarity
        if (!rarities.includes(args.rarity as Rarity))
            return message.reply(`Invalid rarity! Provide one of: ${rarities.join(", ")}`);

        // Write file
        let fileName = `${args.name}-${args.rarity}-${args.deck.id}.${image.contentType === "image/png" ? "png" : "gif"}`;
        let path = resolve(__dirname + "/../../data/card_images/" + fileName);

        // Try save file
        try {
            await downloadFile(image.proxyURL, path);
        } catch {
            return message.reply(`Failed to save the image!`);
        }

        // Add card
        let card = await addCard(args.name, args.deck.id, args.rarity, fileName, image.proxyURL);
        return message.reply({
            embeds: [
                await generateCardEmbed(card)
            ]
        });
    }
};

export default command;