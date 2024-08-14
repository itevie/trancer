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
    let exist = aquired.filter(x => x.card_id === card.id);
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

export async function computeCardPrice(card: Card): Promise<number> {
    let basePrice = 20;
    let rarityMultiplier = rarities.indexOf(card.rarity) + 1;
    let exist = (await getAllAquiredCards()).filter(x => x.card_id === card.id).length;

    return Math.round(Math.max((basePrice * (rarityMultiplier * 0.2)) / (exist / 20), basePrice));
}