import { ColorResolvable, EmbedBuilder } from "discord.js";
import database from "../database/database.ts";
import { createEmbed } from "./util.ts";

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
} as const;

export async function generateCardEmbed(card: Card): Promise<EmbedBuilder> {
  const aquired = await database.cards.aquired.getAll();
  const amount = aquired.filter((x) => x.card_id === card.id);
  const userAmount: string[] = [];
  for (const a of amount) {
    if (!userAmount.includes(a.user_id)) userAmount.push(a.user_id);
  }

  const embed = createEmbed()
    .setTitle(`${card.name} - ${card.rarity}`)
    .setImage(card.link)
    .setColor(rarityColors[card.rarity])
    .setFooter({
      text:
        `ID ${card.id} - ${userAmount.length} have this - ${amount.length} exist`,
    });

  if (card.description) {
    embed.setDescription(card.description);
  }

  return embed;
}

export function cardsToEmbedText(cards: Card[]): string {
  return cards.map((c) => `**${c.name}** *${c.rarity} [${c.id}]*`).join("\n");
}

export async function aquiredCardsToEmbedText(
  cards: AquiredCard[],
): Promise<string> {
  const actualCards = await aquiredCardsArrayToNormal(cards);
  return actualCards.map((c, i) =>
    `**${c.name}** *${c.rarity} [${c.id}]*: ${cards[i].amount}`
  ).join("\n");
}

export async function aquiredCardsArrayToNormal(
  cards: AquiredCard[],
): Promise<Card[]> {
  const actualCards: Card[] = [];
  for await (const aqc of cards) {
    actualCards.push(await database.cards.getById(aqc.card_id) as Card);
  }
  return actualCards;
}
