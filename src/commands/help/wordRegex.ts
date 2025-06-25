import { HypnoCommand } from "../../types/util";
import errorText from "../../util/components/error";
import { getWords } from "../games/letterMaker";

const command: HypnoCommand<{ regex: string }> = {
  name: "wordregex",
  aliases: ["wordsearch", "searchword"],
  type: "help",
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
    try {
      let matchedWords = Array.from(getWords())
        .filter((x) => new RegExp(args.regex).test(x))
        .join(", ")
        .substring(0, 1999);

      if (matchedWords.length === 0)
        return message.reply(`There are no words matching that!`);

      return message.reply(matchedWords);
    } catch (e) {
      return message.reply(
        errorText("Failed to parse your regex, did you write it correctly?", {
          error: e,
          _url: "<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet>",
        }),
      );
    }
  },
};

export default command;
