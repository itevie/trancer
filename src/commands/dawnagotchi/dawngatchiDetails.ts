import { HypnoCommand } from "../../types/command";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { generateDawnagotchiEmbed } from "../../util/dawnagotchi";

const command: HypnoCommand<{ extraDetails?: boolean }> = {
    name: "dawngotchidetails",
    aliases: ["dawndetails", "dawndet"],
    description: "Get details on your Dawn!",
    type: "dawnagotchi",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "extraDetails",
                type: "boolean"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if they have one
        let dawn = await getDawnagotchi(message.author.id);
        if (!dawn) return message.reply(`You do not have a Dawn!`);

        return message.reply({
            embeds: [
                generateDawnagotchiEmbed(dawn, args.extraDetails)
            ]
        })
    }
};

export default command;