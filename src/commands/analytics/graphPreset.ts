import { AttachmentBuilder } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { generateGraph, GraphCreationDetails } from "../../util/graphs";

const preset: { [key: string]: GraphCreationDetails } = {
    top15bar: {
        type: "bar",
        sourceTable: "economy",
        sourceTableKey: "balance",
        sortByTable: "economy",
        sortByTableKey: "balance",
    }
};

const command: HypnoCommand<{ name: string }> = {
    name: "graphpreset",
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