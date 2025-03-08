import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "getquote",
  aliases: ["gq", "getq"],
  description: "Get a quote by ID",
  type: "quotes",
  usage: [["$cmd random", "Get a random quote"]],

  handler: async (message, { oldArgs: args }) => {
    // Collect quote
    let quote: Quote;
    if (["r", "random"].includes(args[0]))
      quote = await actions.quotes.getRandomQuote();
    else {
      const number = parseInt(args[0]?.replace(/#/g, "") ?? "");
      if (Number.isNaN(number))
        return message.reply(`Please provide a valid number ID (or "random")!`);
      quote = await actions.quotes.getById(number);
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
