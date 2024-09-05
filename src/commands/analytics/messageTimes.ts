import { ChartConfiguration } from "chart.js";
import { HypnoCommand } from "../../types/util";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder } from "discord.js";
import { getMessageAtTimes } from "../../util/analytics";

const width = 800;
const height = 400;
const backgroundColour = "#111111";
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const command: HypnoCommand<{ unit?: "hours" | "days" }> = {
    name: "messagetimes",
    type: "analytics",
    description: `Get a bar chart of the most sent messages in an hour`,

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "unit",
                type: "string",
                oneOf: ["hours", "days"]
            }
        ]
    },

    handler: async (message, { args }) => {
        let unit = args.unit ? args.unit : "hours";

        // Get details
        const messages = (await getMessageAtTimes());
        const sorted: { [key: string]: number } = {};

        for (const msg of messages) {
            let part: string;
            if (unit === "hours") part = msg.time.match(/[0-9]+\/[0-9]+\/[0-9]+ ([0-9]+)/)[1];
            if (unit === "days") {
                let date = new Date(msg.time);
                part = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
            }

            if (!sorted[part]) sorted[part] = 0;
            sorted[part] += msg.amount;
        }

        let sortedArr: [string, number][] = [];
        for (const i in sorted)
            sortedArr.push([i, sorted[i]]);
        sortedArr = sortedArr.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

        // Create graph
        const configuration: ChartConfiguration = {
            type: "bar",
            data: {
                labels: sortedArr.map(x => x[0]),
                datasets: [{
                    label: `Messages per ${unit}`,
                    data: sortedArr.map(x => x[1]),
                    backgroundColor: "#FFB6C1"
                }]
            }
        };

        // Create image & attachment
        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        const attachment = new AttachmentBuilder(image)
            .setFile(image);

        // Done
        return message.reply({
            files: [attachment]
        });
    }
};

export default command;