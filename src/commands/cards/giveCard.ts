import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { addCardFor, getAquiredCardsFor, removeCardFor } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";

const command: HypnoCommand<{ card: Card, user: User, amount?: number }> = {
    name: "givecard",
    description: "Give another user one of your cards",
    type: "cards",

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "user",
                type: "user",
                description: "The user you want to give the card to"
            },
            {
                name: "card",
                type: "card",
                description: "Which card you're giving"
            },
            {
                name: "amount",
                type: "wholepositivenumber",
                description: "How many of the card you are giving"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Collect details
        let amount = args.amount ? args.amount : 1;
        let acard = await getAquiredCardsFor(message.author.id, args.card.id);
        if (amount > acard.amount)
            return message.reply(`You do not have **${amount}** **${args.card.name}'s**`);

        // Give it
        await addCardFor(args.user.id, args.card.id, amount);
        await removeCardFor(message.author.id, args.card.id, amount);

        // Done
        return message.reply({
            content: `Gave **${args.user.username}** **${amount} ${args.card.name}'s**`,
            embeds: [
                await generateCardEmbed(args.card)
            ]
        });
    }
};

export default command;