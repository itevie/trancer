import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getAllAquiredCardsFor, getCardById } from "../../util/actions/cards";
import { computeCardPrice } from "../../util/cards";
import config from "../../config";

const command: HypnoCommand<{ user?: User }> = {
    name: "allcardvalue",
    description: "Sums up all of your cards value",
    aliases: ["allcardsvalue", "acv"],
    type: "cards",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            }
        ]
    },

    handler: async (message, { args }) => {
        let user = args.user ? args.user : message.author;
        let cards = (await getAllAquiredCardsFor(user.id)).filter(x => x.amount !== 0);
        let cardPrice = 0;

        for await (const card of cards) {
            let actualCard = await getCardById(card.card_id);
            cardPrice += await computeCardPrice(actualCard) * card.amount;
        }

        return message.reply(`With all your card values summed up, you have: **${cardPrice}${config.economy.currency}** worth of cards`);
    }
};

export default command;