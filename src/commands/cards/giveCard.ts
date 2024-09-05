import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { addCardFor, getAquiredCardsFor, removeCardFor } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";

const command: HypnoCommand<{ card: Card, user: User, amount?: number }> = {
    name: "givecard",
    type: "cards",

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "user",
                type: "user",
            },
            {
                name: "card",
                type: "card"
            },
            {
                name: "amount",
                type: "wholepositivenumber"
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