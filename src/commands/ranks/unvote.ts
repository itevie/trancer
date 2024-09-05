import { User } from "discord.js";
import { client } from "../..";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { rankExists } from "../../util/actions/ranks";

const command: HypnoCommand<{ leaderboard: string }> = {
    name: "unvote",
    description: "Unvote on a leaderboard",
    type: "ranks",

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "leaderboard",
                type: "string"
            },
        ]
    },

    handler: async (message, { args, serverSettings }) => {
        const leaderboard = args.leaderboard.toLowerCase();

        // Check if the rank exists
        if (!await rankExists(leaderboard))
            return message.reply(`That leaderboard does not exist! But can be created using \`${serverSettings.prefix}createrank ${leaderboard}\``);

        await database.run(`DELETE FROM votes WHERE rank_name = ? AND voter = ?`, leaderboard, message.author.id);

        return message.reply(`Your vote on **${leaderboard}** has been removed`);
    }
}

export default command;
