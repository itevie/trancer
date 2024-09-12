import { HypnoCommand } from "../../types/util";
import { getStarboardFor } from "../../util/actions/starboard";
import { database } from "../../util/database";

const command: HypnoCommand<{ amount: number }> = {
    name: "setstarboardcount",
    aliases: ["setstarboardreactcount"],
    type: "admin",
    description: "Sets the amount of reactions required for a message to be posted in the star board channel",
    guards: ["admin"],

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "amount",
                type: "wholepositivenumber",
            }
        ]
    },

    handler: async (message, { args }) => {
        let starboard = await getStarboardFor(message.guild.id);
        if (!starboard)
            return message.reply(`Starboard has not been setup in this server!`);
        await database.run(`UPDATE star_board SET minimum = ? WHERE server_id = ?`, args.amount, message.guild.id);
        return message.reply(`Updated count from ${starboard.minimum} to ${args.amount}!`);
    }
};

export default command;