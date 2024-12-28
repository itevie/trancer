import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { User } from "discord.js";
import {
  economyForUserExists,
  getEconomyFor,
  addMoneyFor,
  removeMoneyFor,
} from "../../util/actions/economy";
import ecoConfig from "../../ecoConfig";
import { currency } from "../../util/textProducer";

const command: HypnoCommand<{ user: User; amount: number }> = {
  name: "give",
  description: `Give someone else some ${ecoConfig.currency}`,
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
        onMissing: `Please provide the amount of ${ecoConfig.currency} you want to give`,
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
      return message.reply(`You do not have ${currency(options.args.amount)}!`);

    // Add money
    await addMoneyFor(options.args.user.id, options.args.amount);
    await removeMoneyFor(message.author.id, options.args.amount);

    // Done
    return message.reply(
      `Successfully gave **${options.args.user.username}** ${currency(
        options.args.amount
      )}!`
    );
  },
};

export default command;
