import { HypnoCommand } from "../../types/command";
import { genQuote, getQuote, randomQuote } from "../../util/actions/quotes";
import { compareTwoStrings, createEmbed } from "../../util/other";

let games = [];

const command: HypnoCommand = {
    name: "guessquote",
    aliases: ["guessq", "quotegame", "qgame"],
    type: "quotes",
    description: `A random quote will be sent, and you must guess who sent it!`,

    handler: async (message) => {
        if (games.includes(message.author.id))
            return message.reply(`You're already in a game!`);

        const quote = await randomQuote(message.guild.id);
        if (!quote)
            return message.reply(`Looks like this server has no quotes!`);

        const user = await message.client.users.fetch(quote.author_id);

        const collector = message.channel.createMessageCollector({
            filter: msg => msg.content.toLowerCase().startsWith(`guess `),
            time: 120000,
        });

        await message.reply({
            embeds: [
                await genQuote(quote, true)
            ]
        });

        games.push(message.author.id);

        collector.on("collect", async (m) => {
            collector.stop();
            games = games.filter(x => x !== message.author.id);
            const response = m.content.replace("guess ", "").replace(/[<@>]/g, "").toLowerCase();

            // Check correctness
            let correct = false;
            if (
                compareTwoStrings(response, user.username) > 0.8
                || (user.displayName && compareTwoStrings(response, user.displayName.replace(/[ ]/g, "")) > 0.6)
                || user.username.toLowerCase().startsWith(response)
                || user.username.toLowerCase() === response
                || user.displayName.toLowerCase().startsWith(response)
                || response == user.id
            )
                correct = true;

            // Check what happened
            if (!correct)
                return m.reply({
                    content: "You got it wrong! :cyclone:",
                    embeds: [
                        await genQuote(quote)
                    ]
                });

            // Success
            return m.reply({
                content: `**${m.author.username}** got it right! Welldone :cyclone:`,
                embeds: [
                    await genQuote(quote)
                ]
            });
        });
    }
}

export default command;