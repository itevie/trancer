import { HypnoCommand } from "../../types/command";
import { rankExists } from "../../util/actions/ranks";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "createrank",
    description: "Creates a rankable leaderboard",
    type: "leaderboards",

    handler: async (message, args, o) => {
        // Provide args
        if (!args[0]) return message.reply(`Please provide a rank name`);
        const name = args[0].toLowerCase();

        // Check if it already exists
        if (await rankExists(name))
            return message.reply(`A leaderboard with that name already exists`);

        // Create it
        await database.run(`INSERT INTO ranks (rank_name, created_by) VALUES ((?), (?))`, name, message.author.id);

        return message.reply(`Leaderboard created! use \`${o.serverSettings.prefix}vote ${name} <user mention>\` to vote!`)
    }
}

export default command;