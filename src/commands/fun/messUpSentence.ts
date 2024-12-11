import { HypnoCommand } from "../../types/util";
import { randomFromRange } from "../../util/other";

const command: HypnoCommand = {
  name: "messupsentence",
  description:
    "Messes up a sentence by randomly moving around letters, but keeping the first and last letters in every word",
  aliases: ["messup"],
  type: "fun",

  handler: (message, { oldArgs }) => {
    if (oldArgs.length === 0)
      return message.reply("Please provide a sentence!");

    return message.reply(oldArgs.join(" "));
  },
};

export default command;

export function messUpSentence(words: string) {
  let finishedWords: string[] = [];
  let theWords = words.split(" ");

  for (const arg of theWords) {
    if (arg.length < 4) {
      finishedWords.push(arg);
      continue;
    }

    let first = arg[0];
    let last = arg[arg.length - 1];
    let middle = arg.slice(1, arg.length - 1).split("");
    let index = 0;

    let messUp = () => {
      while (index != middle.length - 1) {
        let i =
          index === 0 ? index + 1 : Math.random() > 0.5 ? index - 1 : index + 1;

        let old = middle[i];
        middle[i] = middle[index];
        middle[index] = old;

        index++;
      }
    };

    for (let i = 0; i <= randomFromRange(1, 3); i++) messUp();

    finishedWords.push(first + middle.join("") + last);
  }

  return finishedWords.join(" ");
}
