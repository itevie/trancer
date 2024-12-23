import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import {
  economyForUserExists,
  removeMoneyFor,
} from "../../util/actions/economy";
import config from "../../config";

const command: HypnoCommand<{ user: User; amount: number }> = {
  name: "-money",
  description: "Remove user money",
  type: "economy",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
      },
      {
        name: "amount",
        type: "number",
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
        `Please provide a non-negative whole number to remove!`
      );

    // Add money
    await removeMoneyFor(options.args.user.id, options.args.amount);

    // Done
    return message.reply(
      `Successfully removed **${options.args.amount}${config.economy.currency} from ${options.args.user.username}**!`
    );
  },
};

export default command;
