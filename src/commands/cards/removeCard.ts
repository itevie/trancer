import { HypnoCommand } from "../../types/command";
import { getCardById } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ card: Card, confirm?: true }> = {
    name: "removecard",
    aliases: ["deletecard"],
    type: "cards",

    botOwnerOnly: true,

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "card",
                type: "card"
            },
            {
                name: "confirm",
                type: "string",
                mustBe: "confirm"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if confirm
        if (!args.confirm)
            return message.reply({
                content: `Please provide the confirm option`,
                embeds: [await generateCardEmbed(args.card)]
            });

        // Delete
        await database.run(`DELETE FROM aquired_cards WHERE card_id = ?`, args.card.id);
        await database.run(`DELETE FROM cards WHERE id = ?`, args.card.id);

        return message.reply(`Card deleted!`);
    }
};

export default command;