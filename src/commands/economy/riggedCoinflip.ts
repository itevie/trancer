import { HypnoCommand } from "../../types/util";
import {
  addMoneyFor,
  getEconomyFor,
  removeMoneyFor,
} from "../../util/actions/economy";
import { currency } from "../../util/textProducer";

const command: HypnoCommand<{ amount: number; confirm?: string }> = {
  name: "riggedcoinflip",
  type: "economy",
  aliases: ["rcf"],
  description: "Flip a ***RIGGED*** coin (40% chance of winning)",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "amount",
        type: "wholepositivenumber",
      },
      {
        name: "confirm",
        type: "string",
        mustBe: "confirm",
      },
    ],
  },

  handler: async (message, args) => {
    let eco = await getEconomyFor(message.author.id);

    // Check if has enough
    if (args.args.amount > eco.balance)
      return message.reply(`You do not have ${currency(args.args.amount)}`);

    // Check if below 10
    if (args.args.amount < 10)
      return message.reply(`Minimum amount is ${currency(10)}`);

    // Check if requires confirm
    if (
      args.args.amount > 1000 ||
      (eco.balance > 100 && args.args.amount > eco.balance / 2)
    )
      if (!args.args.confirm)
        return message.reply(
          `Please provide the confirm option when coinflipping large amounts of money.`
        );

    let win = Math.random() < 0.4;

    if (win) {
      await addMoneyFor(message.author.id, args.args.amount, "gambling");
      return message.reply(
        `:green_circle: The coin landed in your favour! Your earnt ${currency(
          args.args.amount
        )}!`
      );
    } else {
      await removeMoneyFor(message.author.id, args.args.amount, true);
      return message.reply(
        `:red_circle: The coin did not land in your favour, you lost ${currency(
          args.args.amount
        )} :(`
      );
    }
  },
};

export default command;
