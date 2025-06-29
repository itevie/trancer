import { ChartConfiguration, ChartDataset } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { colors } from "../commands/analytics/balanceOvertime";
import { AttachmentBuilder } from "discord.js";
import { Argument } from "../types/util";
import { units } from "./ms";

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
  after?: Date;
  before?: Date;
  unit?: "hour" | "day" | "month" | "year";
  every?: number;
  last?: number;
}

export const graphArgs: Argument[] = [
  {
    name: "width",
    type: "wholepositivenumber",
    aliases: ["w"],
    min: 500,
    max: 3000,
    wickStyle: true,
    description: "The width of the output image",
  },
  {
    name: "height",
    type: "wholepositivenumber",
    aliases: ["h"],
    min: 500,
    max: 3000,
    wickStyle: true,
    description: "The height of the output image",
  },
  {
    name: "background",
    aliases: ["b"],
    type: "string",
    wickStyle: true,
    description: "Change the background color of the graph",
  },
  {
    name: "nolink",
    aliases: ["nl"],
    type: "boolean",
    wickStyle: true,
    description: "Whether or not to link nodes with no data",
  },
  {
    name: "after",
    aliases: ["a"],
    type: "date",
    wickStyle: true,
    description: "Only show data after this date",
  },
  {
    name: "before",
    aliases: ["b"],
    type: "date",
    wickStyle: true,
    description: "Only show data before this date",
  },
  {
    name: "last",
    aliases: ["l"],
    type: "wholepositivenumber",
    wickStyle: true,
    description: "Use ?unit, it keeps the last x units from the current date",
  },
  {
    name: "unit",
    aliases: ["u"],
    type: "string",
    oneOf: ["hour", "day", "month", "year"],
    description: "The time gaps between data, usually this is hour",
    wickStyle: true,
  },
  {
    name: "every",
    aliases: ["e"],
    type: "wholepositivenumber",
    description: "Every x unit",
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

  if (options.last) {
    let cutOff =
      options.last * units[options.unit ?? "day"] * (options.every ?? 1);
    buckets = buckets.filter((x) => Date.now() - x.getTime() < cutOff);
  }

  if (options.after) {
    buckets = buckets.filter((x) => x.getTime() > options.after.getTime());
  }

  if (options.before) {
    buckets = buckets.filter((x) => x.getTime() < options.before.getTime());
  }

  let period = units[options.unit || "hour"] * (options.every || 1);
  if (options.unit || options.every) {
    let result: Date[] = [];

    for (const date of buckets) {
      if (
        result.length === 0 ||
        date.getTime() - result[result.length - 1].getTime() >= period
      ) {
        result.push(date);
      }
    }

    buckets = result;
  }

  let keys = options.data
    .map((x) => x[0])
    .filter((v, i, a) => a.indexOf(v) === i);

  let datasets: ChartDataset[] = keys.map((word, i) => {
    return {
      data: buckets.map((bucketDate) =>
        options.data.reduce(
          (p, c) =>
            p +
            (c[1].getTime() < bucketDate.getTime() + period &&
            c[1].getTime() >= bucketDate.getTime()
              ? c[2]
              : 0),
          0,
        ),
      ),
      label: word,
      borderColor: colors[i % colors.length],
      spanGaps: options.nolink !== null ? !options.nolink : true,
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
