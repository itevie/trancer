import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getEconomyFor, removeMoneyFor } from "../../util/actions/economy";
import { addItemFor, getItemByName } from "../../util/actions/items";

const command: HypnoCommand<{ name: string, amount?: number }> = {
    name: "buy",
    type: "economy",
    description: "Buy an item from the shop",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "name",
                type: "string"
            },
            {
                name: "amount",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Fetch details
        let eco = await getEconomyFor(message.author.id);
        let item = await getItemByName(args.name);

        // Check if item exists
        if (!item)
            return message.reply(`That item does not exist!`);

        let amount = args.amount || 1;
        let price = item.price * amount;

        // Check if user has enough money
        if (price > eco.balance)
            return message.reply(`You do not have **${price}${config.economy.currency}**`);

        // Give the user the item
        await removeMoneyFor(message.author.id, price);
        await addItemFor(message.author.id, item.id, amount);

        // Done
        return message.reply(`You bought ${amount} **${item.name}** for **${price}${config.economy.currency}**`)
    }
};

export default command;