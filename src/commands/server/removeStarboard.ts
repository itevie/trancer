import { HypnoCommand } from "../../types/util";
import { getStarboardFor } from "../../util/actions/starboard";
import { database } from "../../util/database";

const command: HypnoCommand<{ confirm?: boolean }> = {
    name: "removestarboard",
    type: "admin",
    description: "Removes starboard from your server",
    guards: ["admin"],

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "confirm",
                type: "confirm"
            }
        ]
    },

    handler: async (message) => {
        let starboard = await getStarboardFor(message.guild.id);
        if (!starboard) return message.reply(`Starboard is not setup in this server`);

        await database.run(`DELETE FROM star_board WHERE server_id = ?`, message.guild.id);
        return message.reply(`Starboard has been removed from your server!`);
    }
};

export default command;