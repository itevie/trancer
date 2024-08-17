import { ChartConfiguration } from "chart.js";
import { HypnoCommand } from "../../types/command";
import { ChartJSNodeCanvas, ChartJSNodeCanvasOptions } from "chartjs-node-canvas";
import { Attachment, AttachmentBuilder } from "discord.js";
import { getMoneyTransations } from "../../util/analytics";

const width = 400;
const height = 400;
const backgroundColour = "white";
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const command: HypnoCommand = {
    name: "balover",

    handler: async (message, args) => {
        const transations = await getMoneyTransations(message.author.id);

        const configuration: ChartConfiguration = {
            type: 'line',
            data: {
                labels: transations.map(x => new Date(x.added_at).toLocaleString()),
                datasets: [{
                    label: `Money Transations`,
                    data: transations.map(x => x.balance),
                }]
            }
        };

        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        const attachment = new AttachmentBuilder(image)
            .setFile(image);

        return message.reply({
            files: [attachment]
        });
    }
};

export default command;