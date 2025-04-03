import { ChartConfiguration } from "chart.js";

import { HypnoCommand } from "../../types/util";

import { ChartJSNodeCanvas } from "chartjs-node-canvas";

import { AttachmentBuilder, User } from "discord.js";

import { getMoneyTransations } from "../../util/analytics";
import { units } from "../../util/ms";

const width = 800;

const height = 400;

const backgroundColour = "#111111";

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

const command: HypnoCommand<{ user?: User }> = {
  name: "balanceovertime",

  aliases: ["balover"],

  type: "analytics",

  ratelimit: units.minute * 2,

  description: `Get a graph of the balance of a person overtime`,

  args: {
    requiredArguments: 0,

    args: [
      {
        name: "user",

        type: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Get details

    const user = args.user ? args.user : message.author;

    const transations = await getMoneyTransations(user.id);

    // Create graph

    const configuration: ChartConfiguration = {
      type: "line",

      data: {
        labels: transations.map((x) => new Date(x.added_at).toLocaleString()),

        datasets: [
          {
            label: `${user.username} Balance Overtime`,

            data: transations.map((x) => x.balance),

            borderColor: "#FFB6C1",
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
