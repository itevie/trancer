import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import config from "../../config";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";
import { MessageCreateOptions, MessageEditOptions } from "discord.js";

const command: HypnoCommand<{ force?: boolean }> = {
  name: "quote",
  aliases: ["q", "createquote"],
  type: "quotes",
  description: `Reply to a funny message and it will be saved!`,

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "force",
        type: "boolean",
        description: "Force quote",
        wickStyle: true,
        aliases: ["f"],
      },
    ],
  },

  handler: async (message, { serverSettings }) => {
    // Check for ref
    if (!message.reference) return message.reply(`Please reply to a message!`);
    const ref = await message.fetchReference();

    if (
      ref.author.id === message.client.user.id &&
      (ref.content.startsWith("According to") ||
        ref.content.startsWith("amazing rizz"))
    ) {
      return message.reply(`Nuh uh! Can't quote the results of those commands`);
    }

    // Validate
    if (ref.author.id === message.author.id)
      return message.reply(`You cannot quote yourself! :cyclone:`);

    // Check if already quoted
    let messageAlreadyExists = await database.get<Quote>(
      `SELECT * FROM quotes WHERE message_id = (?)`,
      ref.id,
    );
    if (messageAlreadyExists)
      return message.reply(
        `Sadly, that quote has already been quoted! :cyclone: (id: #${messageAlreadyExists.id})`,
      );

    // Check similar
    let messageIsSimilar = await database.get<Quote>(
      `SELECT * FROM quotes WHERE LOWER(content) = ? AND server_id = ? AND author_id = ?`,
      ref.content.toLowerCase(),
      message.guild.id,
      ref.author.id,
    );

    ConfirmAction({
      message,
      embed: messageIsSimilar
        ? (await actions.quotes.generateEmbed(messageIsSimilar)).setTitle(
            "That quote is too similar to this quote! Is it worth it?",
          )
        : createEmbed(),
      autoYes: !messageIsSimilar,
      async callback() {
        // Add to database
        const quote = await actions.quotes.add(ref, message.author.id);

        let embed = await actions.quotes.generateEmbed(quote);

        let options: MessageEditOptions & MessageCreateOptions =
          !ref.reference && ref.attachments.size === 0 && ref.content.length > 0
            ? {
                files: [await actions.quotes.generateQuoteImage(quote)],
              }
            : { embeds: [embed] };

        // Check if should send in quotes channel
        if (serverSettings.quotes_channel_id) {
          try {
            let channel = await message.guild.channels.fetch(
              serverSettings.quotes_channel_id,
            );
            if (channel.isTextBased()) {
              await channel.send(options);
            }
          } catch {}
        }

        return options;
      },
    });
  },
};

export default command;
