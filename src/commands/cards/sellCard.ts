import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getAllAquiredCardsFor, getCardById } from "../../util/actions/cards";
import { computeCardPrice } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ id: number, confirm?: string }> = {
    name: "sellcard",
    description: "Sell one of your cards",
    type: "cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            },
            {
                name: "confirm",
                type: "string",
                mustBe: "confirm"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Get the card
        let card = await getCardById(args.id);
        if (!card)
            return message.reply(`That card does not exist`);

        // Get the card inv
        let aquired = (await getAllAquiredCardsFor(message.author.id)).find(x => x.user_id === message.author.id && x.card_id === card.id);

        // Check if has any
        if (!aquired || aquired.amount === 0)
            return message.reply(`You do not have a **${card.name}** card!`);

        // Get price
        let price = await computeCardPrice(card);

        // Check if confirm
        if (price > 100 && !args.confirm)
            return message.reply(`Please provide the confirm option to sell **${card.name}** for **${price}${config.economy.currency}**`);

        // Remove card & add money
        await database.run(`UPDATE aquired_cards SET amount = amount - 1 WHERE user_id = ? AND card_id = ?`, message.author.id, card.id);

        return message.reply(`You sold **${card.name}** for **${price}${config.economy.currency}**!`);
    }
};

export default command;