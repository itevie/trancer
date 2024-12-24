import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getAllAquiredCardsFor } from "../../util/actions/cards";
import { addMoneyFor } from "../../util/actions/economy";
import { computeCardPrice } from "../../util/cards";
import ConfirmAction from "../../util/components/Confirm";
import { actions, database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ card: Card; amount?: number }> = {
  name: "sellcard",
  description: "Sell one of your cards",
  type: "cards",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "card",
        type: "card",
      },
      {
        name: "amount",
        type: "wholepositivenumber",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Get the card inv
    let aquired = (await getAllAquiredCardsFor(message.author.id)).find(
      (x) => x.user_id === message.author.id && x.card_id === args.card.id
    );

    let amount = args.amount || 1;

    // Check if has any
    if (!aquired || aquired.amount < amount)
      return message.reply(
        `You do not have **${amount} ${args.card.name}** card(s)!`
      );

    // Get price
    let price = computeCardPrice(args.card) * amount;

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle("Confirm sell")
        .setDescription(
          `Are you sure you want to sell **${amount} ${args.card.name}** for **${price}${config.economy.currency}**?`
        ),
      callback: async () => {
        await database.run(
          `UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?`,
          amount,
          message.author.id,
          args.card.id
        );
        await addMoneyFor(message.author.id, price);
        return {
          content: `You sold **${amount} ${args.card.name}**(s) for **${price}${config.economy.currency}**!`,
        };
      },
      autoYes: price < 100,
    });
  },
};

export default command;
