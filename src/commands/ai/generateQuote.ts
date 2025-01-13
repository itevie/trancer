import { HypnoCommand } from "../../types/util";
import ollama from "ollama";
import { actions } from "../../util/database";
import { shuffle } from "../../util/other";
import { User } from "discord.js";

const command: HypnoCommand<{ user?: User; allservers?: boolean }> = {
  name: "generatequote",
  aliases: ["genquote"],
  description: "Generate a quote based on this server's quotes",
  type: "ai",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        description: "Generate quotes based off of a specific user",
        wickStyle: true,
        type: "user",
      },
      {
        name: "allservers",
        description: "Allows usage of all servers you're in.",
        wickStyle: true,
        type: "boolean",
      },
    ],
  },

  handler: async (message, { args }) => {
    let quotes: Quote[] = [];
    if (args.allservers && args.user && args.user.id !== message.author.id)
      return message.reply(`The user parameter must be yourself.`);

    if (args.allservers)
      quotes = await actions.quotes.getForUser(message.author.id);
    else quotes = await actions.quotes.getForServer(message.guild.id);
    shuffle(quotes);
    if (args.user) quotes = quotes.filter((x) => x.author_id === args.user.id);

    if (!quotes.length)
      return message.reply(`:warning: There are no quotes in this server`);

    const quoteText = quotes
      .slice(-50)
      .filter((x) => x.content.trim().length > 5)
      .map((x) => `- "${x.content}"`)
      .join("\n");

    const prompt = `Mash up or parody the following server quotes to generate a humorous new quote:\n${quoteText}`;

    try {
      await message.react(`⏳`);
      const streamer = await ollama.chat({
        model: "llama3.1",
        messages: [
          {
            role: "system",
            content:
              "Generate exactly one humorous line blending or parodying elements from the input quotes. Maintain absurd and informal tone. No introductions or explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      });

      let response = "";
      let hasStopwatched = false;
      for await (const chunk of streamer) {
        if (!hasStopwatched) await message.react("⏱");
        response += chunk.message.content;
      }

      const content =
        response.replace(/everyone/, "") || "*AI did not generate anything*";

      message.reply(content);
    } catch (e) {
      console.log(e);
      return message.reply(`:red_circle: Failed to fetch response from ai`);
    }
  },
};

export default command;
