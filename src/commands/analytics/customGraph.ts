import { HypnoCommand } from "../../types/command";
import { AttachmentBuilder } from "discord.js";
import { generateGraph, GraphCreationDetails } from "../../util/graphs";

const command: HypnoCommand = {
    name: "customgraph",

    handler: async (message, { oldArgs }) => {
        try {
            const data = JSON.parse(oldArgs.join(" "));

            const creation: GraphCreationDetails = {
                guildId: message.guildId,
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
            return message.reply(`I encountered an error:\n\n\`\`\`${e}\`\`\``);
        }
    }
};

export default command;