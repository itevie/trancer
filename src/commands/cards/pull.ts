import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { addCardFor } from "../../util/actions/cards";
import { getAquiredItem, getItem, removeItemFor } from "../../util/actions/items";
import { generateCardEmbed } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "pull",
    type: "cards",
    description: "Get a new card, check command `rarities` to see chances, requires the card-pull item",

    handler: async (message, args) => {
        // Check if user has the pull item
        let item = await getAquiredItem(config.cards.pullItemID, message.author.id);
        let shopItem = await getItem(config.cards.pullItemID);
        if (item.amount === 0)
            return message.reply(`You do not have any **${shopItem.name}**s!`);

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
        let cards = await database.all(`SELECT * FROM cards WHERE rarity = ?`, rarity) as Card[];

        // Check if there was any
        if (cards.length === 0)
            return message.reply(`Oops! I chose a rarity which has no cards`);

        // Get random card
        let card = cards[Math.floor(Math.random() * cards.length)];

        // Add & remove stuff
        await addCardFor(message.author.id, card.id);
        await removeItemFor(message.author.id, config.cards.pullItemID);

        // Done
        return message.reply({
            embeds: [
                await generateCardEmbed(card)
            ]
        });
    }
}

export default command;