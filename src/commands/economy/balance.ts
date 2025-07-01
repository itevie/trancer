import { HypnoCommand } from "../../types/util";
import { User } from "discord.js";
import { currency } from "../../util/language";
import { actions } from "../../util/database";

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
    let pronoun = args.user.id !== message.author.id ? "Their" : "Your";
    let economy = await actions.eco.getFor(args.user.id);
    return message.reply(`${pronoun} balance is ${currency(economy.balance)}`);
  },
};

export default command;
