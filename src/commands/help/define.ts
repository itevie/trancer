import { HypnoCommand } from "../../types/util";
import { createEmbed, paginate } from "../../util/other";
import axios from "axios";

const command: HypnoCommand<{ word: string }> = {
  name: "define",
  type: "help",
  aliases: ["dict", "dictionary", "lookupword"],
  description: "Defines a word",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "word",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    try {
      const result = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${args.word}`
      );

      if (result.status === 404)
        return message.reply(`That word does not exist`);

      const word = result.data[0];

      paginate({
        replyTo: message,
        embed: createEmbed()
          .setTitle(`${word.word} - ${word.phonetic || "/?/"}`)
          .setDescription(word.origin ? `**Origin:** ${word.origin}` : "__ __"),
        type: "field",
        data: word.meanings.flatMap((x) => {
          return x.definitions.map((y) => {
            return {
              name: `${x.partOfSpeech} - ${word.word}`,
              value: `${y.definition}${
                y.example ? `\n> **Example:** ${y.example}` : ""
              }${
                y.synonyms?.length > 0
                  ? `\n> **Synonyms:** ${y.synonyms.join(", ")}`
                  : ""
              }`,
            };
          });
        }),
      });
    } catch {
      return message.reply(`That word does not exist`);
    }
  },
};

export default command;
