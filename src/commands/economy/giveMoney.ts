import { HypnoCommand } from "../../types/util";
import { User } from "discord.js";
import ecoConfig from "../../ecoConfig";
import { currency } from "../../util/language";
import { actions } from "../../util/database";

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
    await actions.eco.addMoneyFor(options.args.user.id, options.args.amount);
    await actions.eco.removeMoneyFor(message.author.id, options.args.amount);

    // Done
    return message.reply(
      `Successfully gave **${options.args.user.username}** ${currency(
        options.args.amount
      )}!`
    );
  },
};

export default command;
