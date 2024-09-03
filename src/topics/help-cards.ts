import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

let message: MessageCreateOptions = {
    content: "Test",
    embeds: [
        createEmbed()
            .setTitle("Cards")
            .setDescription(
                "Cards are a part of the bots economy functions. You are able to collect cards, sell them, give them to others and more!"
                + `\nThis place will help you learn how to use the cards`
            )
            .addFields([
                {
                    name: "Decks",
                    value: `Each card belongs to a deck, for example there is a deck called ONE, and all the cards are ONE characters.`
                        + `\nTo view a decks cards, run: \`$prefixdeck <deck name>\`, for example \`$prefixdeck one\``
                        + `\nYou can also get all the cards with a certain rarity: \`$prefixdeck one mythic\``
                },
                {
                    name: "Viewing Cards",
                    value: `To view the cards you have: \`$prefixcards\``
                        + `\nTo get details about a specific card: \`$prefixgetcard <card>\``
                        + `\nTo see who has a card: \`$prefixwhohascard <card>\``
                },
                {
                    name: "Obtaining Cards",
                    value: "The only way to obtain cards are by \"pulling\" them.\n\nTo do this, you must buy a \"card-pull\" from the `$prefixshop` "
                        + "using `$prefixbuy card-pull`, then using it with `$prefixpull`"
                },
                {
                    name: "Selling Cards",
                    value: "Once you have obtained cards, you can sell them for money!"
                        + `\nUse \`$prefixsellcard <card>\` to sell a card`
                        + `\nUse \`$prefixsellduplicates\` to sell all the duplicate cards you have`
                        + `\nUse \`$prefixgivecard <card>\` to give someone else a card`
                }
            ])
    ]
};

export default message;