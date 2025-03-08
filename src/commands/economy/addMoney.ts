import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { currency } from "../../util/textProducer";
import { actions } from "../../util/database";

const command: HypnoCommand<{ user: User; amount: number }> = {
  name: "+money",
  description: "Give a user money",
  type: "economy",
  guards: ["bot-owner"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
      {
        name: "amount",
        type: "number",
      },
    ],
  },

  handler: async (message, options) => {
    // Add money
    await actions.eco.addMoneyFor(options.args.user.id, options.args.amount);

    // Done
    return message.reply(
      `Successfully gave **${options.args.user.username}** ${currency(
        options.args.amount
      )}!`
    );
  },
};

export default command;
