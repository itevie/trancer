import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { compareTwoStrings } from "../../util/other";

let games = [];

const command: HypnoCommand = {
  name: "guessquote",
  aliases: ["guessq", "quotegame", "qgame"],
  type: "quotes",
  description: `A random quote will be sent, and you must guess who sent it!`,

  handler: async (message) => {
    if (games.includes(message.author.id)) {
      return {
        content: "You are already in a game!",
      };
    }

    const quote = await actions.quotes.getRandomQuote(message.guild.id);
    if (!quote) return message.reply(`Looks like this server has no quotes!`);

    const user = await message.client.users.fetch(quote.author_id);

    const collector = message.channel.createMessageCollector({
      filter: (msg) => msg.content.toLowerCase().startsWith(`guess `),
      time: 120000,
    });

    const botMessage = await message.reply({
      embeds: [await actions.quotes.generateEmbed(quote, true)],
    });

    games.push(message.author.id);

    collector.on("end", async () => {
      games = games.filter((x) => x !== message.author.id);
      await botMessage.edit({
        content: `Sorry, you took too long!`,
        embeds: [await actions.quotes.generateEmbed(quote)],
      });
    });

    collector.on("collect", async (m) => {
      collector.stop();
      games = games.filter((x) => x !== message.author.id);
      const response = m.content
        .substring("guess ".length)
        .replace(/[\\<@>]/g, "")
        .toLowerCase();

      const username = user.username.toLowerCase();
      const displayName = user.displayName.toLowerCase();

      const correct =
        compareTwoStrings(response, username) > 0.8 ||
        compareTwoStrings(response, displayName) > 0.8 ||
        username.startsWith(response) ||
        displayName.startsWith(response) ||
        response === user.id;

      // Check what happened
      if (!correct)
        return m.reply({
          content: "You got it wrong! :cyclone:",
          embeds: [await actions.quotes.generateEmbed(quote)],
        });

      // Success
      return m.reply({
        content: `**${m.author.username}** got it right! Welldone :cyclone:`,
        embeds: [await actions.quotes.generateEmbed(quote)],
      });
    });
  },
};

export default command;
