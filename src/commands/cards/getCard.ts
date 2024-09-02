import { HypnoCommand } from "../../types/command";
import { getCardById } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";

const command: HypnoCommand<{ card: Card }> = {
    name: "getcard",
    type: "cards",
    description: "Gets and displays a card",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "card",
                type: "card"
            }
        ]
    },

    handler: async (message, { args }) => {
        return message.reply({
            embeds: [
                await generateCardEmbed(args.card)
            ]
        });
    }
};

export default command;