import { HypnoCommand } from "../../types/command";
import { getCardById } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ card: Card }> = {
    name: "setcarddescription",
    aliases: ["setcarddesc"],
    description: "Set a cards description",
    type: "cards",

    botOwnerOnly: true,

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "card",
                type: "card"
            }
        ]
    },

    handler: async (message, { args, oldArgs }) => {
        oldArgs.shift();
        let desc = oldArgs.join(" ");

        let card = await database.get(`UPDATE cards SET description = ? WHERE id = ? RETURNING *;`, desc, args.card.id);
        return message.reply({
            embeds: [await generateCardEmbed(card)]
        });
    }
};

export default command;