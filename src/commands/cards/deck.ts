import { HypnoCommand } from "../../types/command";
import { getDeckById, getDeckByName } from "../../util/actions/cards";
import { rarities } from "../../util/cards";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ deck: Deck, rarity?: Rarity }> = {
    name: "deck",
    aliases: ["cardsindeck", "deckcards", "deckdetails", "deckdet"],
    description: "Get a details of a deck",
    type: "cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "deck",
                type: "deck",
                description: "Provide either the name or ID of a deck"
            },
            {
                name: "rarity",
                type: "string",
                description: "The rarity to show"
            }
        ]
    },

    handler: async (message, { args, serverSettings }) => {
        // Get the card
        let cards: Card[] = await database.all(`SELECT * FROM cards WHERE deck = ?`, args.deck.id);

        // Check if rarity only
        if (args.rarity)
            if (!rarities.includes(args.rarity))
                return message.reply(`Invalid rarity`)
            else
                cards = cards.filter(x => x.rarity === args.rarity);

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Deck ${args.deck.name}`)
                    .setDescription(`List of cards:\n\n${cards.map(x => `**${x.name}** (${x.id})`).join(", ")}`)
                    .setFooter({ text: `ID: ${args.deck.id}` })
            ]
        });
    }
};

export default command;