import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { User } from "discord.js";
import {
  economyForUserExists,
  getEconomyFor,
  addMoneyFor,
  removeMoneyFor,
} from "../../util/actions/economy";

const command: HypnoCommand<{ user: User; amount: number }> = {
  name: "give",
  description: `Give someone else some ${config.economy.currency}`,
  type: "economy",

  args: {
    requiredArguments: 2,
    args: [
      {
        type: "user",
        name: "user",
        onMissing: "Please provide a user to give money to!",
      },
      {
        type: "number",
        name: "amount",
        onMissing: `Please provide the amount of ${config.economy.currency} you want to give`,
      },
    ],
  },

  handler: async (message, options) => {
    // Check if that user has economy set up
    if (!(await economyForUserExists(options.args.user.id)))
      return message.reply(
        `Sorry, that user hasn't been set up with the economy!`
      );

    // Check if negative
    if (options.args.amount < 0 || options.args.amount % 1 !== 0)
      return message.reply(
        `Please provide a non-negative whole number to give!`
      );

    // Get the current users eco
    let eco = await getEconomyFor(message.author.id);

    // Check if they have enough
    if (options.args.amount > eco.balance)
      return message.reply(
        `You do not have ${options.args.amount}${config.economy.currency}!`
      );

    // Add money
    await addMoneyFor(options.args.user.id, options.args.amount);
    await removeMoneyFor(message.author.id, options.args.amount);

    // Done
    return message.reply(
      `Successfully gave **${options.args.user.username} ${options.args.amount}${config.economy.currency}**!`
    );
  },
};

export default command;
