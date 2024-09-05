import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getSpiralById } from "../../util/actions/spirals";
import { createEmbed } from "../../util/other";
import { sentSpirals } from "./spiral";

const command: HypnoCommand<{ id?: number }> = {
    name: "spiraldetails",
    aliases: ["sdetails", "sdet"],
    type: "spirals",
    description: "Reply to a spiral the bot sent and get details about it, or send an ID",

    args: {
        requiredArguments: 0,
        args: [
            {
                type: "number",
                name: "id"
            }
        ]
    },

    handler: async (message, args) => {
        // Find the spiral
        let spiral: Spiral;
        if (args.args.id) {
            spiral = await getSpiralById(args.args.id);
            if (!spiral)
                return message.reply(`A spiral with that ID does not exist`);
        } else if (message.reference) {
            if (!sentSpirals[message.reference.messageId])
                return message.reply(`That message does not have a valid spiral`);
            spiral = sentSpirals[message.reference.messageId];
        } else {
            return message.reply(`Please give an ID, or respond to a spiral message`);
        }

        // Get the author
        let author: User | null = null;
        try {
            author = await message.client.users.fetch(spiral.sent_by);
        } catch { }

        // Create and send the embed
        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Spiral ${spiral.id}`)
                    .setDescription(
                        `Filename: ${spiral.file_name}`
                        + `\nSent By: ${author?.username}`
                        + `\nAdded At: ${new Date(spiral.created_at).toLocaleString()}`
                    )
                    .setImage(spiral.link)
            ]
        });
    }
};

export default command;