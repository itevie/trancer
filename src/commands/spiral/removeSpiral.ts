import { HypnoCommand } from "../../types/command";
import { deleteSpiral, getSpiralById, hasSpiral } from "../../util/actions/spirals";
import { getServerSettings } from "../../util/actions/settings";
import { sentSpirals } from "./spiral";

const command: HypnoCommand<{ id?: number }> = {
    name: "removespiral",
    aliases: ["delspiral", "dspiral"],
    type: "spirals",
    adminOnly: true,
    botServerOnly: true,
    allowExceptions: true,

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
        // Get the spiral
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

        // Delete the spiral
        await deleteSpiral(spiral.id);
        return await message.reply(`Removed :cyclone:`);
    }
}

export default command;