import { HypnoCommand } from "../../types/command";
import { getCard } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ id: number }> = {
    name: "=carddesc",
    description: "Set a cards description",
    type: "cards",

    botOwnerOnly: true,

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args, oldArgs }) => {
        if (!await getCard(args.id))
            return message.reply(`That card does not exist`);

        oldArgs.shift();
        let desc = oldArgs.join(" ");

        let card = await database.get(`UPDATE cards SET description = ? WHERE id = ? RETURNING *    `, desc, args.id);
        return message.reply({
            embeds: [await generateCardEmbed(card)]
        });
    }
};

export default command;