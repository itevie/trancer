import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { getAquiredItem, getItem, removeItemFor } from "../../util/actions/items";
import { database } from "../../util/database";
import { generateDawnagotchiEmbed } from "../../util/dawnagotchi";

const command: HypnoCommand<{ hex: string }> = {
    name: "dyehair",
    aliases: ["dye"],
    description: `Dye your Dawn's hair!`,
    type: "dawnagotchi",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "hex",
                type: "string",
                description: `Hex color for the Dawn's hair`
            }
        ]
    },

    handler: async (message, args) => {
        // Check if they have any hair dye
        let item = await getAquiredItem(config.dawnagotchi.hairDyeItemID, message.author.id);
        let shopItem = await getItem(config.dawnagotchi.hairDyeItemID);
        if (item.amount === 0) return message.reply(`You do not have the **${shopItem.name}** item!`);

        // Check if they have a Dawn
        let dawn = await getDawnagotchi(message.author.id);
        if (!dawn) return message.reply(`You do not have a Dawn!`);

        // Change hair color & remove item
        await database.run(`UPDATE dawnagotchi SET hair_color_hex = ? WHERE owner_id = ?`, args.args.hex, message.author.id);
        await removeItemFor(message.author.id, item.item_id);

        // Done
        return message.reply({
            content: `Your Dawn's hair has been dyed **${args.args.hex}**!`,
            embeds: [
                generateDawnagotchiEmbed(await getDawnagotchi(message.author.id))
            ]
        });
    }
};

export default command;