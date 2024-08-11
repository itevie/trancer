import { HypnoCommand } from "../../types/command";
import { addQuote, genQuote } from "../../util/actions/quotes";
import { database } from "../../util/database";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "quote",
    aliases: ["q", "createquote"],
    type: "quotes",
    description: `Reply to a funny message and it will be saved!`,

    handler: async (message, args) => {
        // Check for ref
        if (!message.reference)
            return message.reply(`Please reply to a message!`);
        const ref = await message.fetchReference();

        // Validate
        if (ref.author.id === message.author.id)
            return message.reply(`You cannot quote yourself! :cyclone:`);

        // Check if already quoted
        let old = await database.get(`SELECT * FROM quotes WHERE message_id = (?)`, ref.id);
        if (old)
            return message.reply(`Sadly, that quote has already been quoted! :cyclone: (id: #${old.id})`)

        // Add to database
        const quote = await addQuote(ref);

        let embed = await genQuote(quote);

        // Check if should send in quotes channel
        if (message.guild.id === config.botServer.id) {
            let server = await message.client.channels.fetch(config.botServer.channels.quotes);
            if (server.isTextBased()) {
                await server.send({
                    embeds: [embed]
                });
            }
        }

        // Done
        return message.reply({
            embeds: [
                embed
            ]
        });
    }
}

export default command;