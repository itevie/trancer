import { HypnoCommand } from "../../types/command";
import { getAllAquiredCardsFor, getDeckById, getDeckByName } from "../../util/actions/cards";
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

    handler: async (message, { args }) => {
        // Get the card
        let cards: Card[] = await database.all(`SELECT * FROM cards WHERE deck = ?`, args.deck.id);
        let aquired = (await getAllAquiredCardsFor(message.author.id)).filter(x => x.amount > 0).map(x => x.card_id);
        let has = 0;
        for (const card of cards)
            if (aquired.includes(card.id))
                has++;

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
                    .setDescription(`${cards.map(x => `${aquired.includes(x.id) ? ":white_check_mark:" : ":x:"} **${x.name}** (${x.id})`).join("\n")}`)
                    .setFooter({ text: `ID: ${args.deck.id}, You have ${has}/${cards.length} (${((has / cards.length) * 100).toFixed(0)}%)` })
            ]
        });
    }
};

export default command;