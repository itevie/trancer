import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { getAllAquiredCardsFor, getCardById } from "../../util/actions/cards";
import { createEmbed } from "../../util/other";
import { rarities } from "../../util/cards";

const command: HypnoCommand<{ user?: User, sortBy: "rarity" | "id" }> = {
    name: "cards",
    type: "cards",
    description: "Get yours or another persons cards",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            },
            {
                name: "sortBy",
                type: "string",
                oneOf: ["rarity", "id"]
            }
        ]
    },

    handler: async (message, { args }) => {
        // Get details
        let user = args.user ? args.user : message.author;
        let cards = (await getAllAquiredCardsFor(user.id))
            .filter(x => x.amount > 0)
            .sort((a, b) => a.card_id - b.card_id);
        let actualCards: { [key: string]: Card } = {};
        if (args.sortBy === "rarity") {
            for await (const card of cards) {
                actualCards[card.card_id] = await getCardById(card.card_id);
            }
        }

        if (args.sortBy === "id") {
            cards = cards.sort((a, b) => a.card_id - b.card_id);
        } else if (args.sortBy === "rarity") {
            let cardsA: { [key: string]: AquiredCard[] } = { mythic: [], epic: [], rare: [], uncommon: [], common: [] };
            for (const card of cards) {
                cardsA[actualCards[card.card_id].rarity].push(card);
            }
            cards = [];
            for (const i in cardsA) {
                cards.push(...cardsA[i])
            }
        }

        // Create embed
        let embed = createEmbed()
            .setTitle(`${user.username}'s cards`);

        // Check if they had any
        if (cards.length === 0)
            embed.setDescription("*No cards :(*");
        else {
            let text: string[] = [];
            for await (const card of cards) {
                let actualCard = await getCardById(card.card_id);
                text.push(`**${actualCard.name}** *${actualCard.rarity} [${actualCard.id}]*: ${card.amount}`);
            }
            embed.setDescription(text.join("\n"));
        }

        return message.reply({
            embeds: [
                embed
            ]
        });
    }
};

export default command;