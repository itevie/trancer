import { HypnoCommand } from "../../types/command";
import { getCardById } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ id: number, confirm?: true }> = {
    name: "removecard",
    aliases: ["deletecard"],
    type: "cards",

    botOwnerOnly: true,

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
        // Get card
        let card = await getCardById(args.id);
        if (!card) return message.reply(`That card does not exist`);

        // Check if confirm
        if (!args.confirm)
            return message.reply({
                content: `Please provide the confirm option`,
                embeds: [await generateCardEmbed(card)]
            });

        // Delete
        await database.run(`DELETE FROM aquired_cards WHERE card_id = ?`, card.id);
        await database.run(`DELETE FROM cards WHERE id = ?`, card.id);

        return message.reply(`Card deleted!`);
    }
};

export default command;