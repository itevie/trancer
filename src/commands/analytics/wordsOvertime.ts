import { argv0 } from "node:process";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { ChartConfiguration, ChartDataset } from "chart.js";
import { PERM } from "sqlite3";
import { definedCache } from "../../util/db-parts/wordUsage";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder } from "discord.js";
import { colors } from "./balanceOvertime";

const width = 800;
const height = 400;
const backgroundColour = "#111111";

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});
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
      x.map((x) => [x.word_id, new Date(x.created_at), x.amount] as const),
    );

    let buckets = wordObject
      .map((x) => x[1])
      .sort((a, b) => a.getTime() - b.getTime());

    let datasets: ChartDataset[] = args.words.map((word, i) => {
      return {
        data: buckets.map(
          (x) =>
            wordObject.find(
              (y) => y[0] === definedCache.get(word) && y[1] === x,
            )?.[2] || null,
        ),
        label: word,
        borderColor: colors[i % colors.length],
      };
    });

    const configuration: ChartConfiguration = {
      type: "line",
      data: {
        labels: buckets.map((x) => x.toISOString()),
        datasets,
      },
    };

    // Create image & attachment
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    const attachment = new AttachmentBuilder(image).setFile(image);

    // Done
    return message.reply({
      files: [attachment],
    });
  },
};

export default command;
