import type { HypnoCommand } from "../../types/util.d.ts";
import { generateCardEmbed } from "../../util/cards.ts";

const command: HypnoCommand<{ card: Card }> = {
  name: "getcard",
  aliases: ["gc", "card"],
  type: "cards",
  description: "Gets a card by ID or name",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "card",
        type: "card",
      },
    ],
  },

  handler: async (message, options) => {
    return await message.reply({
      embeds: [await generateCardEmbed(options.args.card)],
    });
  },
};

export default command;
