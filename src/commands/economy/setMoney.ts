import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { economyForUserExists, setMoneyFor } from "../../util/actions/economy";
import config from "../../config";

const command: HypnoCommand<{ user: User, amount: number }> = {
    name: "=money",
    description: "Set a users money",
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
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, options) => {
        // Check if that user has economy set up
        if (!await economyForUserExists(options.args.user.id))
            return message.reply(`Sorry, that user hasn't been set up with the economy!`);

        // Add money
        await setMoneyFor(options.args.user.id, options.args.amount);

        // Done
        return message.reply(`Successfully set **${options.args.user.username}'s** balance to **${options.args.amount}${config.economy.currency}**!`);

    }
};

export default command;