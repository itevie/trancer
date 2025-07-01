import { HypnoCommand } from "../../types/util";
import cachedUsernames from "../../util/cachedUsernames";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ word: string }> = {
  name: "whosaidword",
  description: "See who said a word in the server",
  type: "analytics",
  aliases: ["wsw"],

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "word",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    const words = Object.entries(
      (
        await actions.wordUsage.getWordInServer(args.word, message.guild.id)
      ).reduce<{ [key: string]: number }>(
        (p, c) => ({ ...p, [c.author_id]: (p[c.author_id] ?? 0) + c.amount }),
        {},
      ),
    ).sort((a, b) => b[1] - a[1]);

    return paginate({
      message,
      embed: createEmbed().setTitle(`Who has said ${args.word} the most?`),
      type: "description",
      data: words.map(
        (x) => `**${cachedUsernames.getSync(x[0])}**: ${x[1]} time`,
      ),
    });
  },
};

export default command;
