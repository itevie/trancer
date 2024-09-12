import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { addMoneyFor, economyForUserExists } from "../../util/actions/economy";
import config from "../../config";

const command: HypnoCommand<{ user: User, amount: number }> = {
    name: "+money",
    description: "Give a user money",
    type: "economy",
    guards: ["bot-owner"],

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

        // Add money
        await addMoneyFor(options.args.user.id, options.args.amount);

        // Done
        return message.reply(`Successfully gave **${options.args.user.username} ${options.args.amount}${config.economy.currency}**!`);

    }
};

export default command;