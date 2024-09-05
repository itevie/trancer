import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";
import { generateGraph, GraphCreationDetails } from "../../util/graphs";

const command: HypnoCommand = {
    name: "customgraph",
    type: "analytics",
    description:
        `Create your own graph! (very technical)\n\nBasic tutorial:\n\n`
        + `Use JSON, the valid values are:`
        + `\n\`type\`: "line" or "bar"`
        + `\n\`sourceTable\`: "economy" or "user_data" or "money_transactions"`
        + `\n\`sourceTableKey\`: see below`
        + `\n\`sortByTable\`: "economy" or "user_data"`
        + `\n\`sortByTableKey\`: see below`
        + `\n\`users\`: an array of user IDs (optional - replaces amount)`
        + `\n\`amount\`: a number from 1-20 of how many lines or bars to display`
        + `\n\nThe keys (sourceTableKey, sortByTableKey)'s type must be number`
        + `\nTo get the list of columns you can use in these, run \`sqlcolumns <table name>\``
        + `\n\nAn example could be: \n\n\`{"type":"bar","sourceTable": "user_data","sourceTableKey":"messages_sent","sortByTable":"user_data","sortByTableKey":"messages_sent"}\``
        + `\n\nWhich would show a bar chart of the top 15 speakers`,

    handler: async (message, { oldArgs }) => {
        try {
            const data = JSON.parse(oldArgs.join(" "));

            const creation: GraphCreationDetails = {
                guildId: message.guildId,
                type: "bar",
                ...data,
            };

            const image = await generateGraph(creation);

            if (typeof image === "string")
                return message.reply(image);

            const attachment = new AttachmentBuilder(image)
                .setFile(image);

            // Done
            return message.reply({
                files: [attachment]
            });
        } catch (e) {
            console.log(e);
            return message.reply(`I encountered an error:\n\n\`\`\`${e}\`\`\``);
        }
    }
};

export default command;