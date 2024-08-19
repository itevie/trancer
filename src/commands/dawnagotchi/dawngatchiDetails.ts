import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { generateDawnagotchiEmbed } from "../../util/dawnagotchi";

const command: HypnoCommand<{ user?: User, extraDetails?: boolean }> = {
    name: "dawngotchidetails",
    aliases: ["dawndetails", "dwandet", "dawndet"],
    description: "Get details on your Dawn!",
    type: "dawnagotchi",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            },
            {
                name: "extraDetails",
                type: "boolean"
            }
        ]
    },

    handler: async (message, { args }) => {
        let user = args.user ? args.user : message.author;

        // Check if they have one
        let dawn = await getDawnagotchi(user.id);
        if (!dawn) return message.reply(`${user.id === message.author.id ? "You" : "They"} do not have a Dawn!`);

        return message.reply({
            embeds: [
                generateDawnagotchiEmbed(dawn, args.extraDetails)
            ]
        })
    }
};

export default command;