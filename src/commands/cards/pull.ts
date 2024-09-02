import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { addCardFor } from "../../util/actions/cards";
import { getAquiredItem, getItem, removeItemFor } from "../../util/actions/items";
import { generateCardEmbed } from "../../util/cards";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ deck: Deck, amount: number }> = {
    name: "pull",
    type: "cards",
    description: "Get a new card, check command `rarities` to see chances, requires the card-pull item",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "deck",
                type: "deck"
            },
            {
                name: "amount",
                type: "wholepositivenumber",
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if user has the pull item
        let item = await getAquiredItem(config.cards.pullItemID, message.author.id);
        let shopItem = await getItem(config.cards.pullItemID);
        let amount = args.amount ? args.amount : 1;
        if (amount > item.amount)
            return message.reply(`You do not have **${amount} ${shopItem.name}**s!`);

        let getCard: () => Promise<Card | string> = async () => {
            // Get the rarity
            let rarity: Rarity;
            for (const i in config.cards.weights) {
                // Check if random is LESS than the rarity
                // Because 0.34234 < 0.05 = false
                if (Math.random() < config.cards.weights[i]) {
                    rarity = i as Rarity;
                    break;
                }
            }

            // Obviously, there might be no matches, so just pick one of these
            if (!rarity) rarity = Math.random() < 0.6 ? "common" : "uncommon";

            // Get the card
            let cards = await database.all(`SELECT * FROM cards WHERE rarity = ? AND deck = ?`, rarity, args.deck.id) as Card[];

            // Check if there was any
            if (cards.length === 0)
                return `Oops! I chose a rarity which has no cards`;

            // Get random card
            let card = cards[Math.floor(Math.random() * cards.length)];
            return card;
        }

        let it = " ".repeat(amount).split("");
        let cards: Card[] = [];
        let prettyCards: { [key: string]: [number, Card] } = {};

        for await (const _ of it) {
            let card = await getCard();
            if (typeof card === "string")
                return message.reply(`Failed to fetch card rarity in that deck!`);
            await addCardFor(message.author.id, card.id);
            await removeItemFor(message.author.id, config.cards.pullItemID);
            cards.push(card);
            if (!prettyCards[card.id]) prettyCards[card.id] = [0, card];
            prettyCards[card.id][0]++;
        }

        if (cards.length === 1) {
            return message.reply({
                embeds: [
                    await generateCardEmbed(cards[0])
                ]
            });
        }

        let text = "";

        for (const i in prettyCards) {
            text += `**${prettyCards[i][1].name}** *${prettyCards[i][1].rarity}* x${prettyCards[i][0]}\n`;
        }

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle("Your cards!")
                    .setDescription(`${text}`)
            ]
        });
    }
}

export default command;