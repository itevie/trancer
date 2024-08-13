import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";

const command: HypnoCommand<{ deckId: number }> = {
    name: "deckcards",
    description: "Get a list of a deck's cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "deckId",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        let cards = await database.all(`SELECT * FROM cards WHERE deck = ?`, args.deckId) as Card[];
        return message.reply(`Here are the cards:\n\n${cards.map(x => `**${x.name}** (${x.id})`).join(", ")}`);
    }
};

export default command;