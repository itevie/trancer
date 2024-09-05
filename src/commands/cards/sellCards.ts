import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getAllAquiredCardsFor, getCardById } from "../../util/actions/cards";
import { addMoneyFor } from "../../util/actions/economy";
import { computeCardPrice } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "sellcards",
    description: "Sell multiple cards, providing an ID of each one",
    examples: [
        ["$cmdsellcard 2 8 3 2", "Sells 2 2's, 1 3 and 1 8 "]
    ],
    type: "cards",

    handler: async (message, { oldArgs }) => {
        let aquiredCards = await getAllAquiredCardsFor(message.author.id);
        let amount = 0;
        for await (const arg of oldArgs) {
            // Check if valid number
            if (!arg.match(/^([0-9]+)$/))
                return message.reply(`Please provide a valid number for: **${arg}**`);
            let id = parseInt(arg);

            // Check if the user has any
            let card = aquiredCards.find(x => x?.card_id === id);
            if (!card || card.amount === 0)
                return message.reply(`You do not have a **${card.card_id}**!`);
            let actualCard = await getCardById(card.card_id);

            let price = await computeCardPrice(actualCard);

            // Remove one
            await database.run(`UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?`, 1, message.author.id, card.card_id);
            await addMoneyFor(message.author.id, price);
            amount += price;
            card.amount -= 1;
        }

        return message.reply(`Success! Sold all the cards for: **${amount}${config.economy.currency}**`);
    }
};

export default command;