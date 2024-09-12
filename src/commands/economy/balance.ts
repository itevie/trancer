import { HypnoCommand } from "../../types/util";
import { getEconomyFor } from "../../util/actions/economy";
import config from "../../config";
import { User } from "discord.js";

const command: HypnoCommand<{ user?: User }> = {
    name: "balance",
    aliases: ["bal"],
    description: "Get your balance, or someone elses",
    type: "economy",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user",
                description: "The other user to get the balance of"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Collect user to fetch & pronouns
        let user = args.user || message.author;
        let pronoun = args.user ? "Their" : "Your";

        // Get the economy
        let economy = await getEconomyFor(user.id);
        if (!economy)
            return message.reply(`That user has no economy setup.`);

        // Done
        return message.reply(`${pronoun} balance is **${economy.balance}${config.economy.currency}**`);
    }
}

export default command;