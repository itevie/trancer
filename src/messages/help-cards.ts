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
                        + `\nTo view a decks cards, run: \`$prefixdeckcards <deck name>\`, for example \`$prefixdeckcards one\``
                        + `\nYou can also get all the cards with a certain rarity: \`$prefixdeckcards one mythic\``
                },
                {
                    name: "Viewing Cards",
                    value: `To view the cards you have: \`$prefixcards\``
                        + `\nTo get details about a specific card: \`$prefixgetcard <id>\``
                },
                {
                    name: "Obtaining Cards",
                    value: "The only way to obtain cards are by \"pulling\" them.\n\nTo do this, you must buy a \"card-pull\" from the `$prefixshop`"
                        + "using `$prefixbuy card-pull`, then using it with `$prefixpull`"
                }
            ])
    ]
};

export default message;