import { ChartConfiguration } from "chart.js";
import { HypnoCommand } from "../../types/util";
import { createRating } from "./rate";
import { AttachmentBuilder, User } from "discord.js";
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

const command: HypnoCommand<{ user: User; parts: string[] }> = {
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
      (x) => [x, createRating(args.user.username, x)] as const,
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

      options: {
        plugins: {
          legend: {
            labels: {
              color: "white", // Legend text color
            },
          },
        },
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
