import { HypnoCommand } from "../../types/command";
import { genQuote, randomQuote } from "../../util/actions/quotes";
import { createEmbed } from "../../util/other";

let games = [];

const command: HypnoCommand = {
    name: "guessquote",
    aliases: ["guess", "guessq", "quotegame", "qgame"],
    type: "quotes",
    description: `A random quote will be sent, and you must guess who sent it!`,

    handler: async (message, args) => {
        if (games.includes(message.author.id))
            return message.reply(`You're already in a game!`);

        const quote = await randomQuote(message.guild.id);
        const user = await message.client.users.fetch(quote.author_id);

        const collector = message.channel.createMessageCollector({
            filter: msg => msg.author.id === message.author.id
                && msg.content.startsWith(`guess `),
            time: 30000,
        });

        await message.channel.send({
            embeds: [
                createEmbed()
                    .setTitle(`Who sent the following quote?`)
                    .setDescription(`*${quote.content}*`)
                    .setFooter({
                        text: `Type "guess (guess)" to guess`
                    })
            ]
        });

        games.push(message.author.id);

        collector.on("collect", async (m) => {
            collector.stop();
            games = games.filter(x => x !== message.author.id);
            const response = m.content.replace("guess ", "").replace(/[<@>]/g, "");

            // Check correctness
            let correct = false;
            if (response.toLowerCase() === user.username)
                correct = true;
            else if (response === user.id)
                correct = true;

            // Check what happened
            if (!correct)
                return m.reply(`You got it wrong! :cyclone:`);

            // Success
            return m.reply({
                content: `That's right!`,
                embeds: [
                    await genQuote(quote)
                ]
            });
        });
    }
}

export default command;