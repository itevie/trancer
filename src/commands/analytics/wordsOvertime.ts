import { argv0 } from "node:process";
import { HypnoCommand } from "../../types/util";
import { actions, keyedCache } from "../../util/database";
import { ChartConfiguration, ChartDataset } from "chart.js";
import { PERM } from "sqlite3";
import {
  definedCache,
  definedCacheReversed,
} from "../../util/db-parts/wordUsage";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder, User } from "discord.js";
import { colors } from "./balanceOvertime";
import {
  chartJSNodeCanvas,
  generateMultilineDataGraph,
  graphArgs,
} from "../../util/charts";

const command: HypnoCommand<{ words: string[]; user?: User; top?: number }> = {
  name: "wordsovertime",
  description: "Get a word's usage overtime",
  type: "analytics",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "words",
        type: "array",
        inner: "string",
      },
      {
        name: "user",
        type: "user",
        aliases: ["for"],
        wickStyle: true,
        description: "Show the words for a specific user",
      },
      {
        name: "top",
        type: "number",
        aliases: ["top"],
        wickStyle: true,
        description: "Also show the top x",
      },
      ...graphArgs,
    ],
  },

  handler: async (message, { args }) => {
    if (args.top) {
      let words = await keyedCache(
        `serverwords-${message.guild.id}`,
        async () =>
          Object.entries(
            await actions.wordUsage.toObject(
              await actions.wordUsage.getForServer(message.guild.id),
            ),
          ).sort((a, b) => b[1] - a[1]),
      );

      args.words.push(...words.slice(0, 10).map((x) => x[0]));
    }

    // Initially get data
    let loadedWords = await Promise.all(
      args.words.map((x) =>
        actions.wordUsage.getWordInServer(x, message.guild.id),
      ),
    );

    if (loadedWords.length === 0) return message.reply(`No Data!`);

    if (args.user) {
      loadedWords = loadedWords.map((x) =>
        x.filter((y) => y.author_id === args.user.id),
      );
    }

    // By the end we need labels: Dates
    // datesets: [{data: number[], label: word}]

    // Data to: {[key: `id::iso_date`]: amount}
    // This turns the data from many users into one unified one
    let wordObject = loadedWords.flatMap((x) =>
      x.map(
        (x) =>
          [
            definedCacheReversed.get(x.word_id),
            new Date(x.created_at),
            x.amount,
          ] as const,
      ),
    );

    // Done
    return message.reply({
      files: [
        await generateMultilineDataGraph({
          data: wordObject,
          ...args,
        }),
      ],
    });
  },
};

export default command;
