import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ id: number | "latest" | "random" | "oldest" }> = {
  name: "getquote",
  aliases: ["gq", "getq"],
  description: "Get a quote by ID",
  type: "quotes",
  usage: [["$cmd random", "Get a random quote"]],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "id",
        type: "wholepositivenumber",
        or: [
          {
            type: "string",
            oneOf: ["random", "latest", "oldest"],
          },
        ],
      },
    ],
  },

  handler: async (message, { args }) => {
    // Collect quote
    let quote: Quote;

    if (typeof args.id === "number") {
      quote = await actions.quotes.getById(args.id);
    } else if (args.id === "latest") {
      quote = await actions.quotes.getLastQuote(message.guild.id);
    } else if (args.id === "oldest") {
      quote = await actions.quotes.getFirstQuote(message.guild.id);
    } else if (args.id === "random") {
      quote = await actions.quotes.getRandomQuote(message.guild.id);
    }

    // Check if it existed
    if (!quote)
      return message.reply(`It seems the quote with that ID does not exist...`);

    if (quote.server_id !== message.guild.id)
      return message.reply(`That quote is not from this server.`);

    // Done
    return message.reply({
      embeds: [await actions.quotes.generateEmbed(quote)],
    });
  },
};

export default command;
