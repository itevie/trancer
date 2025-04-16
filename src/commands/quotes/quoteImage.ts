import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ quote: number }> = {
  name: "quoteimage",
  aliases: ["quoteimg", "qimg"],
  description: "Turn a quote into an image",
  type: "quotes",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "quote",
        type: "wholepositivenumber",
      },
    ],
  },

  handler: async (message, { args }) => {
    let quote = await actions.quotes.getById(args.quote);
    if (!quote) return message.reply(`Invalid quote ID!`);
    if (quote.server_id !== message.guild.id)
      return message.reply(`That quote is not from this server`);

    return message.reply({
      files: [await actions.quotes.generateQuoteImage(quote)],
    });
  },
};

export default command;
