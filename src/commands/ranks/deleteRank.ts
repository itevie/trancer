import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "deleterank",
    description: "Delete a rank",

    handler: async (message, args, o) => {
        // Check for rank
        if (!args[0])
            return message.reply(`Please provide a leaderboard to delete.`);
        const rankName = args[0].toLowerCase();

        // Fetch rank
        const rank = await database.get(`SELECT * FROM ranks WHERE rank_name = (?);`, rankName) as Rank | undefined;

        // Check if exists
        if (!rank)
            return message.reply(`That leaderboard does not exist!`)

        // Check if owns it
        if (rank.created_by !== message.author.id && rank.created_by === config.ren)
            return message.reply(`You need to be the leaderboard creator to delete it!`);

        // Check confirm
        if (args[1] !== "confirm")
            return message.reply(`Please provide confirm as the last arguemnt: \`${o.serverSettings.prefix}deleterank ${rankName} confirm\``);

        // Delete
        await database.run(`DELETE FROM votes WHERE rank_name = (?);`, rankName);
        await database.run(`DELETE FROM ranks WHERE rank_name = (?);`, rankName);

        // Done
        return message.reply(`Leaderboard deleted. :cyclone:`)
    }
}

export default command;