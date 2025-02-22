import { HypnoCommand } from "../../types/util";
import { addQuote, genQuote } from "../../util/actions/quotes";
import { database } from "../../util/database";
import config from "../../config";

const command: HypnoCommand = {
  name: "quote",
  aliases: ["q", "createquote"],
  type: "quotes",
  description: `Reply to a funny message and it will be saved!`,

  handler: async (message, { serverSettings }) => {
    // Check for ref
    if (!message.reference) return message.reply(`Please reply to a message!`);
    const ref = await message.fetchReference();

    // Validate
    if (ref.author.id === message.author.id)
      return message.reply(`You cannot quote yourself! :cyclone:`);

    // Check if already quoted
    let messageAlreadyExists = await database.get<Quote>(
      `SELECT * FROM quotes WHERE message_id = (?)`,
      ref.id
    );
    if (messageAlreadyExists)
      return message.reply(
        `Sadly, that quote has already been quoted! :cyclone: (id: #${messageAlreadyExists.id})`
      );

    // Check similar
    let messageIsSimilar = await database.get<Quote>(
      `SELECT * FROM quotes WHERE LOWER(content) = ? AND server_id = ? AND author_id = ?`,
      ref.content.toLowerCase(),
      message.guild.id,
      ref.author.id
    );

    if (messageIsSimilar) {
      return message.reply(
        `That message is too similar to a quote they already have! (id #${messageIsSimilar.id})`
      );
    }

    // Add to database
    const quote = await addQuote(ref);

    let embed = await genQuote(quote);

    // Check if should send in quotes channel
    if (serverSettings.quotes_channel_id) {
      try {
        let channel = await message.guild.channels.fetch(
          serverSettings.quotes_channel_id
        );
        if (channel.isTextBased()) {
          await channel.send({
            embeds: [embed],
          });
        }
      } catch {}
    }

    // Done
    return message.reply({
      embeds: [embed],
    });
  },
};

export default command;
