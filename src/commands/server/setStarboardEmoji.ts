import { HypnoCommand } from "../../types/util";
import { getStarboardFor } from "../../util/actions/starboard";
import { database } from "../../util/database";

const command: HypnoCommand<{ emoji: string }> = {
    name: "setstarboardemoji",
    type: "admin",
    description: "Sets the emoji for the starboard",
    guards: ["admin"],

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "emoji",
                type: "string",
            }
        ]
    },

    handler: async (message, { args }) => {
        let starboard = await getStarboardFor(message.guild.id);
        if (!starboard)
            return message.reply(`Starboard has not been setup in this server!`);
        await database.run(`UPDATE star_board SET emoji = ? WHERE server_id = ?`, args.emoji, message.guild.id);
        return message.reply(`Updated emoji from ${starboard.emoji} to ${args.emoji}!`);
    }
};

export default command;