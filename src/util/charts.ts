import { ChartConfiguration, ChartDataset } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { colors } from "../commands/analytics/balanceOvertime";
import { AttachmentBuilder } from "discord.js";
import { Argument } from "../types/util";

const width = 1600;
const height = 800;
const backgroundColour = "#111111";

export const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

/// [label, when, amount]
export type MultilineData = (readonly [string, Date, number])[];

export interface MultilineGraphOptions {
  data: MultilineData;
  width?: number;
  height?: number;
  background?: string;
  nolink?: boolean;
}

export const graphArgs: Argument[] = [
  {
    name: "width",
    type: "wholepositivenumber",
    aliases: ["w"],
    min: 500,
    max: 3000,
    wickStyle: true,
  },
  {
    name: "height",
    type: "wholepositivenumber",
    aliases: ["h"],
    min: 500,
    max: 3000,
    wickStyle: true,
  },
  {
    name: "background",
    aliases: ["b"],
    type: "string",
    wickStyle: true,
  },
  {
    name: "nolink",
    aliases: ["nl"],
    type: "boolean",
    wickStyle: true,
  },
];

export async function generateMultilineDataGraph(
  options: MultilineGraphOptions,
) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: options.width ?? width,
    height: options.height ?? height,
    backgroundColour: options.background ?? backgroundColour,
  });

  let buckets = options.data
    .map((x) => x[1])
    .sort((a, b) => a.getTime() - b.getTime());

  let keys = options.data.map((x) => x[0]);

  let datasets: ChartDataset[] = keys.map((word, i) => {
    return {
      data: buckets.map(
        (x) =>
          options.data.find((y) => y[0] === word && y[1] === x)?.[2] || null,
      ),
      label: word,
      borderColor: colors[i % colors.length],
      spanGaps: options.nolink !== null ? options.nolink : true,
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

  return attachment;
}
