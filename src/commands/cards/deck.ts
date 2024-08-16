import { HypnoCommand } from "../../types/command";
import { getDeckById, getDeckByName } from "../../util/actions/cards";
import { rarities } from "../../util/cards";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ deckNameOrId: string, rarity?: Rarity }> = {
    name: "deck",
    aliases: ["cardsindeck", "deckcards", "deckdetails", "deckdet"],
    description: "Get a details of a deck",
    type: "cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "deckNameOrId",
                type: "any",
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
        // Get the deck
        let deck: Deck;
        if (args.deckNameOrId.match(/^([0-9]+)$/))
            deck = await getDeckById(args.deckNameOrId as unknown as number);
        else deck = await getDeckByName(args.deckNameOrId);

        // Check if it was found
        if (!deck)
            return message.reply(`A deck with the name or ID: ${args.deckNameOrId} was not found!\nUse: \`${serverSettings.prefix}decks\` to view a list of decks`);

        // Get the card
        let cards: Card[] = await database.all(`SELECT * FROM cards WHERE deck = ?`, deck.id);

        // Check if rarity only
        if (args.rarity)
            if (!rarities.includes(args.rarity))
                return message.reply(`Invalid rarity`)
            else
                cards = cards.filter(x => x.rarity === args.rarity);

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Deck ${deck.name}`)
                    .setDescription(`List of cards:\n\n${cards.map(x => `**${x.name}** (${x.id})`).join(", ")}`)
                    .setFooter({ text: `ID: ${deck.id}` })
            ]
        });
    }
};

export default command;