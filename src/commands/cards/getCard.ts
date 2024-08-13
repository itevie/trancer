import { HypnoCommand } from "../../types/command";
import { getCard } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";

const command: HypnoCommand<{ id: number }> = {
    name: "getcard",
    type: "cards",
    description: "Gets and displays a card",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        let card = await getCard(args.id);
        if (!card)
            return message.reply(`A card with that ID does not exist`);

        return message.reply({
            embeds: [
                await generateCardEmbed(card)
            ]
        });
    }
};

export default command;