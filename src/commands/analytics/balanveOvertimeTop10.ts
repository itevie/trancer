import { ChartConfiguration, ChartDataset } from "chart.js";
import { HypnoCommand } from "../../types/command";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder, User } from "discord.js";
import { getAllMoneyTransations } from "../../util/analytics";
import { getAllEconomy } from "../../util/actions/economy";

const width = 1000;
const height = 600;
const backgroundColour = "#111111";
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const command: HypnoCommand<{ user?: User }> = {
    name: "balanceovertimetop10",
    aliases: ["balovertop10", "bott"],
    type: "analytics",
    description: `Get a graph of the balance of a person overtime`,

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            }
        ]
    },

    handler: async (message, { args }) => {
        const users = (await getAllEconomy()).sort((a, b) => b.balance - a.balance).slice(0, 15);
        const userIDs = users.map(x => x.user_id);
        const usernames: { [key: string]: string } = {};
        for await (const id of userIDs)
            usernames[id] = (await message.client.users.fetch(id)).username;

        const transactions = (await getAllMoneyTransations()).filter(x => userIDs.includes(x.user_id));

        const oldPre = new Date(transactions[0].added_at);
        const newPre = new Date(transactions[transactions.length - 1].added_at);
        oldPre.setSeconds(0, 0);
        newPre.setSeconds(0, 0);

        const oldest = oldPre.getTime();
        const newest = newPre.getTime();

        const userTimes: { [key: string]: MoneyTransaction[] } = {};
        for (const transaction of transactions) {
            if (!userTimes[transaction.user_id]) userTimes[transaction.user_id] = [];
            let date = new Date(transaction.added_at)
            date.setSeconds(0, 0);
            transaction.added_at = date.getTime();
            userTimes[transaction.user_id].push(transaction);
        }

        const data: { [key: string]: number[] } = {};
        const labels: string[] = [];

        for (let time = oldest; time < newest; time += 60000) {
            labels.push(formatDate(new Date(time)));
            for (const user in userTimes) {
                let gotData: number | null = null;
                let prevData: number | null = null;

                for (const transaction of userTimes[user]) {
                    if (transaction.added_at === time) {
                        gotData = transaction.balance;
                        break;
                    } else if (transaction.added_at < time)
                        prevData = transaction.balance;
                }

                let d = gotData ?? prevData ?? 0;
                if (!data[user]) data[user] = [];
                data[user].push(d);
            }
        }

        const chartData: ChartDataset[] = [];
        const colors = "FF0000,00FF00,0000FF,FFFF00,00FFFF,FF00FF,BDB5D5,FFB6C1,AA336A,CF9FFF,00A36C,CC5500,C9CC3F,FF00FF,F28C28".split(",").map(x => `#${x}`);
        let index = 0;

        for (const d in data) {
            chartData.push({
                label: usernames[d],
                data: data[d],
                borderColor: colors[index],
            });
            index++;
        }
        // Create graph
        const configuration: ChartConfiguration = {
            type: 'line',
            data: {
                labels: labels,
                datasets: chartData
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

function formatDate(date: Date) {
    // Extract components from the date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Combine them into the desired format
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}