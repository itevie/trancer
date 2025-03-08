import { HypnoCommand } from "../../types/util";
import { computeCardPrice } from "./_util";
import { currency } from "../../util/textProducer";

const command: HypnoCommand<{ card: Card }> = {
  name: "cardvalue",
  aliases: ["cardv"],
  description: "Get the price of a card, if you were to sell it",
  type: "cards",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "card",
        type: "card",
      },
    ],
  },

  handler: async (message, args) => {
    let result = computeCardPrice(args.args.card);
    return message.reply(
      `At the moment, **${args.args.card.name}** would be worth ${currency(
        result
      )}`
    );
  },
};

export default command;
