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
  name: "pay",
  description: `Give someone else some ${ecoConfig.currency}`,
  type: "economy",

  args: {
    requiredArguments: 2,
    args: [
      {
        type: "user",
        name: "user",
        onMissing: "Please provide a user to give money to!",
        mustHaveEco: true,
        infer: true,
      },
      {
        type: "currency",
        name: "amount",
        onMissing: `Please provide the amount of ${ecoConfig.currency} you want to give`,
      },
    ],
  },

  handler: async (message, options) => {
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
