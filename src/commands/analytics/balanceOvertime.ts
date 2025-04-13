import {
  ChartConfiguration,
  ChartData,
  ChartDataset,
  ChartDatasetProperties,
} from "chart.js";
import { HypnoCommand } from "../../types/util";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder, Base, User } from "discord.js";
import { getMoneyTransations } from "../../util/analytics";
import { units } from "../../util/ms";
import { actions } from "../../util/database";
import { getUsernameSync } from "../../util/cachedUsernames";

const width = 800;
const height = 400;
const backgroundColour = "#111111";

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

export const colors =
  "#FF0000,#00FF00,#0000FF,#FFFF00,#00FFFF,#FF00FF,#FFFFFF,#550000,#005500,#000055,#555500,#005555,#550055,#555555".split(
    ",",
  );

const unitTypes = ["day", "hour", "minute"] as const;

const command: HypnoCommand<{
  user?: User;
  unit?: (typeof unitTypes)[number];
  every?: number;
  past?: number;
  top?: number;
  alltime?: boolean;
}> = {
  name: "balanceovertime",
  aliases: ["balover"],
  type: "analytics",
  ratelimit: units.second * 5,
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
        description: "The unit to entries things by",
        wickStyle: true,
      },
      {
        name: "every",
        type: "wholepositivenumber",
        description: "How many of unit to sort by",
        wickStyle: true,
      },
      {
        name: "past",
        type: "wholepositivenumber",
        description: "Past x days, use ?alltime to bypass this",
        wickStyle: true,
      },
      {
        name: "alltime",
        type: "boolean",
        description: "Show all time transactions",
        wickStyle: true,
      },
      {
        name: "top",
        type: "wholepositivenumber",
        description: "Include the top x amount of people, along with yourself",
        wickStyle: true,
        min: 0,
        max: 20,
      },
    ],
  },

  handler: async (message, { args }) => {
    const unit = units[args.unit ?? "day"] * (args.every ?? 1);
    const past = units.day * (args.past ?? 28);

    interface Section {
      id: string;
      transaction: MoneyTransaction[];
    }

    const baseUser = args.user ? args.user : message.author;
    const users: Section[] = [
      {
        id: baseUser.id,
        transaction: await getMoneyTransations(baseUser.id),
      },
    ];

    if (args.top && args.top > 0) {
      const economy = (await actions.eco.getAll())
        .sort((a, b) => b.balance - a.balance)
        .slice(0, args.top);

      for await (const eco of economy) {
        users.push({
          id: eco.user_id,
          transaction: await getMoneyTransations(eco.user_id),
        });
      }
    }

    const now = Date.now();
    const buckets: Record<string, Date> = {};
    const earliest = Math.min(
      ...users.map((u) =>
        Math.min(...u.transaction.map((x) => new Date(x.added_at).getTime())),
      ),
    );

    for (let i = args.alltime ? earliest : now - past; i <= now; i += unit) {
      const bucketKey = Math.floor(i / unit).toString();
      buckets[bucketKey] = new Date(i);
    }

    const processed: ChartDataset[] = users.map((user, i) => {
      const grouped = user.transaction
        .filter((x) => args.alltime || Date.now() - x.added_at < past)
        .reduce<{
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
        }, {});

      const data = Object.keys(buckets).map((bucket) => {
        const group = grouped[bucket];
        return group ? group.totalBalance / group.count : null;
      });

      return {
        label: getUsernameSync(user.id),
        data,
        borderColor: colors[i % colors.length],
        spanGaps: true,
      };
    });

    const labels = Object.values(buckets);

    // Create graph
    const configuration: ChartConfiguration = {
      type: "line",
      data: {
        labels: labels.map((x) => x.toLocaleString()),
        datasets: processed,
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
