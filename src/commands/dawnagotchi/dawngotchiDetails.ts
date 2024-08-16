import { HypnoCommand } from "../../types/command";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { generateDawnagotchiEmbed } from "../../util/dawnagotchi";

const command: HypnoCommand = {
    name: "dawngotchidetails",
    aliases: ["dawndetails", "dawndet"],
    description: "Get details on your Dawn!",
    type: "dawnagotchi",

    handler: async (message) => {
        // Check if they have one
        let dawn = await getDawnagotchi(message.author.id);
        if (!dawn) return message.reply(`You do not have a Dawn!`);

        return message.reply({
            embeds: [
                generateDawnagotchiEmbed(dawn)
            ]
        })
    }
};

export default command;