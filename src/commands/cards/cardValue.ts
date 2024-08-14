import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getCardById } from "../../util/actions/cards";
import { computeCardPrice } from "../../util/cards";

const command: HypnoCommand<{ id: number }> = {
    name: "cardvalue",
    aliases: ["cardv"],
    description: "Get the price of a card, if you were to sell it",
    type: "cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, args) => {
        let card = await getCardById(args.args.id);
        if (!card) return message.reply(`That card does not exist`);

        let result = await computeCardPrice(card);
        return message.reply(`At the moment, **${card.name}** would be worth **${result}${config.economy.currency}**`);
    }
};

export default command;