import { HypnoCommand } from "../../types/command";
import { rarities } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ deckName: string, rarity?: Rarity }> = {
    name: "deckcards",
    aliases: ["cardsindeck"],
    description: "Get a list of a deck's cards",
    type: "cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "deckName",
                type: "string"
            },
            {
                name: "rarity",
                type: "string"
            }
        ]
    },

    handler: async (message, { args }) => {
        if (!rarities.includes(args.rarity))
            return message.reply("Invalid rarity!");

        let cards = await database.all(`SELECT * FROM cards WHERE deck IN (SELECT id FROM decks WHERE LOWER(NAME) = LOWER(?))`, args.deckName) as Card[];
        if (args.rarity) cards = cards.filter(x => x.rarity === args.rarity);

        return message.reply(`Here are the cards:\n\n${cards.map(x => `**${x.name}** (${x.id})`).join(", ")}`);
    }
};

export default command;