import { ChartConfiguration, ChartDataset } from "chart.js";

import { formatDate } from "./other";

import { ChartJSNodeCanvas } from "chartjs-node-canvas";

import { getAllMoneyTransations } from "./analytics";

import { client } from "..";
import { actions } from "./database";

export interface GraphCreationDetails {
  type: "bar" | "line";

  sourceTable: "user_data" | "economy" | "money_transactions";

  sourceTableKey: string;

  sortByTable?: "user_data" | "economy";

  sortByTableKey?: string;

  users?: string[];

  guildId?: string;

  amount?: number;

  cap?: number;

  graphName?: string;
}

const width = 1000;

const height = 600;

const backgroundColour = "#111111";

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

export async function generateSimpleLineChart(
  data: object[],
  timeKey: string,
  valueKey: string,
  label: string,
): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: "line",

    data: {
      labels: data.map((x) => x[timeKey]),

      datasets: [
        {
          label: label,

          data: data.map((x) => x[valueKey]),

          borderColor: `#FFB6C1`,
        },
      ],
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

export async function generateGraph(
  creation: GraphCreationDetails,
): Promise<Buffer | string> {
  const tableGetters = {
    user_data: async () =>
      await actions.userData.getForServer(creation.guildId),

    economy: async () => await actions.eco.getAll(),

    money_transactions: async () => await getAllMoneyTransations(creation.cap),
  };

  const graphError = (msg: string) => {
    return `Error while creating graph: ${msg}`;
  };

  // Check basics

  if ("amount" in creation) {
    if (creation.amount === 0 || creation.amount > 20)
      return graphError(`Amount must be !-20`);
  } else creation.amount = 15;

  // Get the source

  const sourcePreSort = await tableGetters[creation.sourceTable]();

  // Check keys

  if (sourcePreSort.length > 0) {
    // Check if key exists

    if (!(creation.sourceTableKey in sourcePreSort[0]))
      return graphError(
        `key ${creation.sourceTableKey} not in table ${creation.sourceTable}`,
      );

    // Check if the key value is number

    if (typeof sourcePreSort[0][creation.sourceTableKey] !== "number")
      return graphError(
        `key ${creation.sourceTableKey}'s type is not of type number in table ${creation.sourceTable}`,
      );
  }

  let source = sourcePreSort.sort(
    (a, b) => b[creation.sourceTableKey] - a[creation.sourceTableKey],
  );

  // Get the sort by

  let sortBy: string[] = [];

  if (creation.users) {
    sortBy = creation.users;
  } else if (creation.sortByTable && creation.sortByTableKey) {
    const sortByPreSort = await tableGetters[creation.sortByTable]();

    // Validate sort by

    if (sortByPreSort.length > 0) {
      // Check if key exists

      if (!(creation.sortByTableKey in sortByPreSort[0]))
        return graphError(
          `key ${creation.sortByTableKey} not in table ${creation.sourceTable}`,
        );

      // Check if the key value is number

      if (typeof sortByPreSort[0][creation.sortByTableKey] !== "number")
        return graphError(
          `key ${creation.sortByTableKey}'s type is not of type number in table ${creation.sortByTable}`,
        );
    }

    // Sort it

    sortBy = sortByPreSort

      .sort((a, b) => b[creation.sortByTableKey] - a[creation.sortByTableKey])

      .slice(0, creation.amount)

      .map((x) => x.user_id);
  }

  // Get the actual data

  let data: any[] = [];

  for (const d of sortBy) {
    let actualData = source.find((x) => x.user_id === d);

    if (!actualData) continue;

    data.push(actualData);
  }

  // Check if it is a line

  if (creation.type === "line") {
    let oldData = [...data].map((x) => x.user_id);

    data = source.filter((x) => oldData.includes(x.user_id));
  }

  data = data.sort(
    (a, b) => b[creation.sourceTableKey] - a[creation.sourceTableKey],
  );

  // Check if line is wanted (added_at is needed)

  if (creation.type === "line")
    if (data.length > 0 && !("added_at" in data[0]))
      return graphError(
        `Cannot create graph of type line, because the source table does not have an added_at key`,
      );

  let usernames: { [key: string]: string } = {};

  for await (const d of data) {
    if (!usernames[d.user_id])
      usernames[d.user_id] = (await client.users.fetch(d.user_id)).username;
  }

  // Render bar

  let configuration: ChartConfiguration;

  if (creation.type === "bar") {
    configuration = {
      type: "bar",

      data: {
        labels: data.map((x) => usernames[x.user_id]),

        datasets: [
          {
            label: creation.graphName ? creation.graphName : `Custom Graph`,

            data: data.map((x) => x[creation.sourceTableKey]),

            backgroundColor: `#FFB6C1`,
          },
        ],
      },
    };
  } else if (creation.type === "line") {
    data = data.sort((a, b) => a.added_at - b.added_at);

    // Get oldest & newest times

    const oldPre = new Date(data[0].added_at);

    const newPre = new Date(data[data.length - 1].added_at);

    oldPre.setSeconds(0, 0);

    newPre.setSeconds(0, 0);

    const oldest = oldPre.getTime();

    const newest = newPre.getTime();

    // Get the user times

    const userTimes: { [key: string]: MoneyTransaction[] } = {};

    for (const transaction of data) {
      if (!userTimes[transaction.user_id]) userTimes[transaction.user_id] = [];

      let date = new Date(transaction.added_at);

      date.setSeconds(0, 0);

      transaction.added_at = date.getTime();

      userTimes[transaction.user_id].push(transaction);
    }

    // Compress or something

    const finishedData: { [key: string]: number[] } = {};

    const labels: string[] = [];

    for (let time = oldest; time < newest; time += 60000) {
      labels.push(formatDate(new Date(time)));

      for (const user in userTimes) {
        let gotData: number | null = null;

        let prevData: number | null = null;

        for (const dataPiece of userTimes[user]) {
          if (dataPiece.added_at === time) {
            gotData = dataPiece[creation.sourceTableKey];

            break;
          } else if (dataPiece.added_at < time)
            prevData = dataPiece[creation.sourceTableKey];
        }

        let d = gotData ?? prevData ?? 0;

        if (!finishedData[user]) finishedData[user] = [];

        finishedData[user].push(d);
      }
    }

    // Create chart data

    const chartData: ChartDataset[] = [];

    const colors =
      "FF0000,00FF00,0000FF,FFFF00,00FFFF,FF00FF,BDB5D5,FFB6C1,AA336A,CF9FFF,00A36C,CC5500,C9CC3F,FF00FF,F28C28"
        .split(",")
        .map((x) => `#${x}`);

    let index = 0;

    for (const d in finishedData) {
      chartData.push({
        label: usernames[d],

        data: finishedData[d],

        borderColor: colors[index],
      });

      index++;
    }

    // Create graph

    configuration = {
      type: "line",

      data: {
        labels: labels,

        datasets: chartData,
      },
    };
  }

  // Create image & attachment

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);

  return image;
}
