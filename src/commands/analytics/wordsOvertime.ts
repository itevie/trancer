import { argv0 } from "node:process";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { ChartConfiguration, ChartDataset } from "chart.js";
import { PERM } from "sqlite3";
import {
  definedCache,
  definedCacheReversed,
} from "../../util/db-parts/wordUsage";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder } from "discord.js";
import { colors } from "./balanceOvertime";
import {
  chartJSNodeCanvas,
  generateMultilineDataGraph,
  graphArgs,
} from "../../util/charts";

const command: HypnoCommand<{ words: string[] }> = {
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
      ...graphArgs,
    ],
  },

  handler: async (message, { args }) => {
    // Initially get data
    let loadedWords = await Promise.all(
      args.words.map((x) =>
        actions.wordUsage.getWordInServer(x, message.guild.id),
      ),
    );

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

    console.log(args, command.args);

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
