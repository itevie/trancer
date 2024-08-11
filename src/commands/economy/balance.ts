import { HypnoCommand } from "../../types/command";
import { getEconomyFor } from "../../util/actions/economy";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "balance",
    aliases: ["bal", "xp"],
    description: "Get your balance, or someone elses",
    type: "economy",

    handler: async (message, { oldArgs: args }) => {
        let user = message.author;
        let pronoun = "Your";
        if (args[0]) {
            user = await message.client.users.fetch(args[0].replace(/[<>@]/g, ""));
            pronoun = "Their";
        }

        let economy = await getEconomyFor(user.id);
        if (!economy)
            return message.reply(`That user has no economy setup.`);

        return message.reply(`${pronoun} balance is **${economy.balance}${config.economy.currency}**`);
    }
}

export default command;