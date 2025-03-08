import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { computeCardPrice } from "./_util";
import config from "../../config";
import { currency } from "../../util/textProducer";
import { actions } from "../../util/database";

const command: HypnoCommand<{ user?: User }> = {
  name: "allcardvalue",
  description: "Sums up all of your cards value",
  aliases: ["allcardsvalue", "acv"],
  type: "cards",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;
    let cards = (await actions.cards.aquired.getAllFor(user.id)).filter(
      (x) => x.amount !== 0
    );
    let cardPrice = 0;

    for await (const card of cards) {
      let actualCard = await actions.cards.getById(card.card_id);
      cardPrice += computeCardPrice(actualCard) * card.amount;
    }

    return message.reply(
      `With all your card values summed up, you have: ${currency(
        cardPrice
      )} worth of cards`
    );
  },
};

export default command;
