import { HypnoCommand } from "../../types/util";
import { getEconomyFor } from "../../util/actions/economy";
import config from "../../config";
import { User } from "discord.js";
import { currency } from "../../util/textProducer";

const command: HypnoCommand<{ user?: User }> = {
  name: "balance",
  aliases: ["bal"],
  description: "Get your balance, or someone elses",
  type: "economy",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        description: "The other user to get the balance of",
        mustHaveEco: true,
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    // Collect user to fetch & pronouns
    let user = args.user || message.author;
    let pronoun = args.user ? "Their" : "Your";

    // Get the economy
    let economy = await getEconomyFor(user.id);

    // Done
    return message.reply(`${pronoun} balance is ${currency(economy.balance)}`);
  },
};

export default command;
