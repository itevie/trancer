import { HypnoCommand } from "../../types/command";
import { addMoneyFor, getEconomyFor, removeMoneyFor } from "../../util/actions/economy";
import config from "../../config";

const command: HypnoCommand<{ amount: number, confirm?: string }> = {
    name: "riggedcoinflip",
    type: "economy",
    aliases: ["rcf"],
    description: "Flip a ***RIGGED*** coin (30% chance of winning)",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "amount",
                type: "wholepositivenumber"
            },
            {
                name: "confirm",
                type: "string",
                mustBe: "confirm"
            }
        ]
    },

    handler: async (message, args) => {
        let eco = await getEconomyFor(message.author.id);

        // Check if has enough
        if (args.args.amount > eco.balance)
            return message.reply(`You do not have ${args.args.amount}${config.economy.currency}`);

        // Check if requires confirm
        if (args.args.amount > 1000 || (eco.balance > 100 && args.args.amount > eco.balance / 2))
            if (!args.args.confirm)
                return message.reply(`Please provide the confirm option when coinflipping large amounts of money.`);

        let win = Math.random() < 0.3;

        if (win) {
            await addMoneyFor(message.author.id, args.args.amount);
            return message.reply(`:green_circle: The coin landed in your favour! Your earnt ${args.args.amount}${config.economy.currency}!`);
        } else {
            await removeMoneyFor(message.author.id, args.args.amount);
            return message.reply(`:red_circle: The coin did not land in your favour, you lost ${args.args.amount}${config.economy.currency} :(`);
        }
    }
};

export default command;