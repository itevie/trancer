import { ColorResolvable, EmbedBuilder } from "discord.js";
import { createEmbed } from "../../util/other";
import { actions } from "../../util/database";

export const rarities: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "mythic",
];
export const rarityColors: { [key: string]: ColorResolvable } = {
  common: "DarkGrey",
  uncommon: "Green",
  rare: "Blue",
  epic: "Purple",
  mythic: "Fuchsia",
};

export async function generateCardEmbed(card: Card): Promise<EmbedBuilder> {
  let aquired = await actions.cards.aquired.getAll();
  let userAmount: string[] = [];
  let exist = aquired
    .filter((x) => x.card_id === card.id)
    .filter((x) => x.amount !== 0);
  for (let a of exist)
    if (!userAmount.includes(a.user_id)) userAmount.push(a.user_id);
  let total = 0;
  for (const e of exist) total += e.amount;

  let embed = createEmbed()
    .setTitle(`${card.name} - ${card.rarity}`)
    .setImage(card.link)
    .setColor(rarityColors[card.rarity])
    .setFooter({
      text: `ID ${card.id} - ${userAmount.length} have this - ${total} exist`,
    });

  if (card.description) embed.setDescription(card.description);

  return embed;
}

const rarityBasePrices = {
  common: 20,
  uncommon: 40,
  rare: 100,
  epic: 200,
  mythic: 600,
};

export function computeCardPrice(card: Card): number {
  let basePrice = rarityBasePrices[card.rarity];
  //let exist = (await getAllAquiredCards()).filter(x => x.card_id === card.id).length;

  return Math.round(basePrice);
}

export async function convertAquiredCardsToCards(
  acards: AquiredCard[]
): Promise<Card[]> {
  let cards: Card[] = [];
  for await (const acard of acards) {
    cards.push(await actions.cards.getById(acard.card_id));
  }
  return cards;
}
