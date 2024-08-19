import { ChartConfiguration, ChartDataset } from "chart.js";
import { HypnoCommand } from "../../types/command";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder } from "discord.js";
import { getAllMoneyTransations } from "../../util/analytics";
import { getAllEconomy } from "../../util/actions/economy";
import { getAllGuildsUserData } from "../../util/actions/userData";
import { formatDate } from "../../util/other";

const width = 1000;
const height = 600;
const backgroundColour = "#111111";
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const command: HypnoCommand<{ useMessagesSent?: boolean }> = {
    name: "balanceovertimetop10",
    aliases: ["balovertop10", "bott"],
    type: "analytics",
    description: `Get a graph of the balance of a person overtime`,

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "useMessagesSent",
                type: "boolean",
                description: "Base the top 15 off of messages instead of economy"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Get the data whether its by messages or economy leaderboard
        const eco = (await getAllEconomy()).sort((a, b) => b.balance - a.balance)
        const userData = (await getAllGuildsUserData(message.guild.id)).sort((a, b) => b.messages_sent - a.messages_sent).slice(0, 15);
        let users: Economy[] = [];
        if (args.useMessagesSent) {
            for (const ud of userData)
                users.push(eco.find(x => x.user_id === ud.user_id));
        } else users = eco.slice(0, 15);

        // Get userIDs and usernames
        const userIDs = users.map(x => x.user_id);
        const usernames: { [key: string]: string } = {};
        for await (const id of userIDs)
            usernames[id] = (await message.client.users.fetch(id)).username;

        const transactions = (await getAllMoneyTransations()).filter(x => userIDs.includes(x.user_id));

        // Get the oldest and newest ones, removing the seconds and milliseconds
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
            content: `Showing top 15 users in **${args.useMessagesSent ? "messages" : "economy"}** leaderboard`,
            files: [attachment]
        });
    }
};

export default command;