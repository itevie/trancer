import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "setleaderboarddescription",
    aliases: ["slbdesc", "setlbdesc"],
    type: "leaderboards",
    description: "Set a leaderboard's description",

    handler: async (message, { oldArgs: args, serverSettings }) => {
        if (!args[0] || !args[1])
            return message.reply(`Please provide a leaderboard name and a description, example: \`${serverSettings.prefix}slbdesc fish Who is the most fishiest?\``);
        const name = args[0].toLowerCase();
        args.shift();
        const desc = args.join(" ");

        // Get
        const rank = await database.get(`SELECT * FROM ranks WHERE rank_name = (?);`, name);

        // Checks
        if (!rank)
            return message.reply(`That leaderboard does not exist`);
        if (rank.created_by !== message.author.id && !config.exceptions.includes(message.author.id))
            return message.reply(`You did not create this leaderboard!`);

        // Update
        await database.run(`UPDATE ranks SET description = (?) WHERE rank_name = (?);`, desc, name);

        return message.reply(`Updated leaderboard description!`);
    }
}

export default command;