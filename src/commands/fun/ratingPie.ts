import { ChartConfiguration } from "chart.js";
import { HypnoCommand } from "../../types/util";
import { createRating } from "./rate";
import { AttachmentBuilder } from "discord.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { colors } from "../analytics/balanceOvertime";

const width = 800;
const height = 400;
const backgroundColour = "#111111";

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

const command: HypnoCommand<{ parts: string[] }> = {
  name: "pierating",
  type: "fun",
  description: "Get pie chart of many different ratings",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
      },
      {
        name: "parts",
        type: "array",
        inner: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    const parts = args.parts.map(
      (x) => [x, createRating(message.author.username, x)] as const,
    );

    const configuration: ChartConfiguration = {
      type: "pie",
      data: {
        labels: parts.map((x) => x[0]),
        datasets: [
          {
            data: parts.map((x) => x[1]),
            backgroundColor: colors,
          },
        ],
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
