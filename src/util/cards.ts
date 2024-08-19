import { ColorResolvable, EmbedBuilder } from "discord.js";
import { createEmbed } from "./other";
import { getAllAquiredCards } from "./actions/cards";

export const rarities: Rarity[] = ["common", "uncommon", "rare", "epic", "mythic"];
export const rarityColors: { [key: string]: ColorResolvable } = {
    common: "DarkGrey",
    uncommon: "Green",
    rare: "Blue",
    epic: "Purple",
    mythic: "Fuchsia"
};

export async function generateCardEmbed(card: Card): Promise<EmbedBuilder> {
    let aquired = await getAllAquiredCards();
    let userAmount: string[] = [];
    let exist = aquired.filter(x => x.card_id === card.id).filter(x => x.amount !== 0);
    for (let a of exist) if (!userAmount.includes(a.user_id)) userAmount.push(a.user_id);

    let embed = createEmbed()
        .setTitle(`${card.name} - ${card.rarity}`)
        .setImage(card.link)
        .setColor(rarityColors[card.rarity])
        .setFooter({ text: `ID ${card.id} - ${userAmount.length} have this - ${exist.length} exist` });

    if (card.description)
        embed.setDescription(card.description);

    return embed;
}

const rarityBasePrices = {
    "common": 20,
    "uncommon": 40,
    "rare": 100,
    "epic": 200,
    "mythic": 600
};

export async function computeCardPrice(card: Card): Promise<number> {
    let basePrice = rarityBasePrices[card.rarity];
    //let exist = (await getAllAquiredCards()).filter(x => x.card_id === card.id).length;

    return Math.round(basePrice);
}   