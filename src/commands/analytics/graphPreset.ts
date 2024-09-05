import { AttachmentBuilder } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { generateGraph, GraphCreationDetails } from "../../util/graphs";

const preset: { [key: string]: GraphCreationDetails } = {
    top15bar: {
        type: "bar",
        sourceTable: "economy",
        sourceTableKey: "balance",
        sortByTable: "economy",
        sortByTableKey: "balance",
        graphName: "Top 15 People's Balance Overtime"
    },
    topgamblinglosers: {
        type: "bar",
        sourceTable: "economy",
        sourceTableKey: "from_gambling_lost",
        sortByTable: "user_data",
        sortByTableKey: "messages_sent",
        graphName: "Top Gamblers That Lost Hard"
    },
    topgamblelosersovertime: {
        type: "line",
        sourceTable: "money_transactions",
        sourceTableKey: "balance",
        sortByTable: "economy",
        sortByTableKey: "from_gambling_lost",
        amount: 5,
        graphName: "Top 5 People Who Has Lost The Most Money Gambling's Balance Overtime"
    },
    bumps: {
        type: "bar",
        sourceTable: "user_data",
        sourceTableKey: "bumps",
        sortByTable: "user_data",
        sortByTableKey: "messages_sent",
        graphName: "Top Bumpers"
    }
};

const command: HypnoCommand<{ name: string }> = {
    name: "graphpreset",
    aliases: ["presetgraph", "gp", "pg"],
    type: "analytics",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "name",
                type: "string",
                oneOf: Object.keys(preset)
            }
        ]
    },

    handler: async (message, { args }) => {
        const image = await generateGraph({
            guildId: message.guild.id,
            ...preset[args.name]
        });

        if (typeof image === "string")
            return message.reply(image);

        const attachment = new AttachmentBuilder(image)
            .setFile(image);

        // Done
        return message.reply({
            files: [attachment]
        });
    }
};

export default command;