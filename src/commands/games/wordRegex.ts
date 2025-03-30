import { HypnoCommand } from "../../types/util";
import { words } from "./letterMaker";

const command: HypnoCommand<{ regex: string }> = {
  name: "wordregex",
  aliases: ["wordsearch", "searchword"],
  type: "fun",
  description: "Search words from a dictionary by a regex",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "regex",
        type: "string",
      },
    ],
  },

  handler: (message, { args }) => {
    let matchedWords = Array.from(words)
      .filter((x) => new RegExp(args.regex).test(x))
      .join(", ")
      .substring(0, 1999);

    return message.reply(matchedWords);
  },
};

export default command;
