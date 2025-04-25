import axios from "axios";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ word: string }> = {
  name: "urbandictionary",
  description: "Searches on Urban Dictionary",
  type: "fun",
  aliases: ["urban", "ub"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "word",
        type: "string",
        takeContent: true,
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const result = await axios.get(
      "https://api.urbandictionary.com/v0/define?term=" +
        args.word.replace(/ /g, "%20"),
    );
    return paginate({
      message,
      embed: createEmbed().setTitle(`Definitions for ${args.word}`),
      type: "field",
      data: result.data.list
        .sort(
          (a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down),
        )
        .map((x) => {
          return {
            name: `${x.word} 👍${x.thumbs_up} 👎${x.thumbs_down}`,
            value: `${x.definition} ([permalink](${x.permalink}))\n> ${x.example}\n-# ${new Date(x.written_on).toDateString()}`,
          };
        }),
    });
  },
};

export default command;
