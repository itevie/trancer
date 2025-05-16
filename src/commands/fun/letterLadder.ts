import { HypnoCommand } from "../../types/util";
import { words } from "../games/letterMaker";

function oneLetterDifferent(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 1) return false;
  }
  return diffs === 1;
}

function findLadderPath(
  start: string,
  end: string,
  wordSet: Set<string>,
): string[] | null {
  if (start === end) return [start];

  const queue: string[][] = [[start]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const lastWord = path[path.length - 1];

    for (const word of wordSet) {
      if (!visited.has(word) && oneLetterDifferent(lastWord, word)) {
        if (word === end) {
          return [...path, word];
        }
        visited.add(word);
        queue.push([...path, word]);
      }
    }
  }
  return null;
}

const command: HypnoCommand<{ start: string; end: string }> = {
  name: "letterladder",
  aliases: ["ladder"],
  description: "Find the shortest letter ladder path between two words",
  type: "fun",

  args: {
    requiredArguments: 2,
    args: [
      { name: "start", type: "string" },
      { name: "end", type: "string" },
    ],
  },

  handler: async (message, { args }) => {
    const start = args.start.toLowerCase();
    const end = args.end.toLowerCase();

    if (start.length !== end.length) {
      await message.reply("Both words must be the same length!");
      return;
    }
    if (!words.has(start) || !words.has(end)) {
      await message.reply("Both words must be a valid dictionary word!");
      return;
    }

    // Filter word set to only words with the correct length
    const filteredWords = new Set(
      Array.from(words).filter((w) => w.length === start.length),
    );

    const path = findLadderPath(start, end, filteredWords);

    if (!path) {
      await message.reply(`No ladder found from **${start}** to **${end}**.`);
    } else {
      await message.reply(
        `Ladder from **${start}** to **${end}** (${path.length}):\n` +
          path.join(" → "),
      );
    }
  },
};

export default command;
