import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { currency } from "../../util/textProducer";
import { actions } from "../../util/database";

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
        type: "wholepositivenumber",
      },
    ],
  },

  handler: async (message, options) => {
    // Add money
    await actions.eco.removeMoneyFor(options.args.user.id, options.args.amount);

    // Done
    return message.reply(
      `Successfully removed ${currency(options.args.amount)} from **${
        options.args.user.username
      }**!`
    );
  },
};

export default command;
