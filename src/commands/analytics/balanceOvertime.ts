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

const unitTypes = ["day", "hour", "minute"] as const;

const command: HypnoCommand<{
  user?: User;
  unit?: (typeof unitTypes)[number];
  every?: number;
}> = {
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
      {
        name: "unit",
        type: "string",
        oneOf: [...unitTypes],
        wickStyle: true,
      },
      {
        name: "every",
        type: "wholepositivenumber",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const unit = units[args.unit ?? "day"] * (args.every ?? 1);

    // Get details
    const user = args.user ? args.user : message.author;
    const transations = Object.entries(
      (await getMoneyTransations(user.id)).reduce<{
        [key: string]: {
          totalBalance: number;
          count: number;
          time: Date;
        };
      }>((p, c) => {
        const unitStart = Math.floor(new Date(c.added_at).getTime() / unit);

        if (!p[unitStart]) {
          p[unitStart] = {
            totalBalance: 0,
            count: 0,
            time: new Date(c.added_at),
          };
        }

        p[unitStart].totalBalance += c.balance;
        p[unitStart].count += 1;

        return p;
      }, {}),
    ).map((x) => [x[0], x[1].totalBalance / x[1].count, x[1].time] as const);

    // Create graph
    const configuration: ChartConfiguration = {
      type: "line",
      data: {
        labels: transations.map((x) => x[2].toLocaleString()),
        datasets: [
          {
            label: `${user.username} Balance Overtime (every ${args.every ?? 1} ${args.unit ?? "day"})`,
            data: transations.map((x) => x[1]),
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
