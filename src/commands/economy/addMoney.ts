import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { addMoneyFor, economyForUserExists, getEconomyFor } from "../../util/actions/economy";
import config from "../../config.json";

const command: HypnoCommand<{ user: User, amount: number }> = {
    name: "+money",
    description: "Give a user money",

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "user",
                type: "user"
            },
            {
                name: "amount",
                type: "number"
            }
        ]
    },

    handler: async (message, options) => {
        // Check if that user has economy set up
        if (!await economyForUserExists(options.args.user.id))
            return message.reply(`Sorry, that user hasn't been set up with the economy!`);

        // Check if negative
        if (options.args.amount < 0 || options.args.amount % 1 !== 0)
            return message.reply(`Please provide a non-negative whole number to give!`);

        // Add money
        await addMoneyFor(options.args.user.id, options.args.amount);

        // Done
        return message.reply(`Successfully gave **${options.args.user.username} ${options.args.amount}${config.economy.currency}**!`);

    }
};

export default command;