import { User } from "discord.js";
import { client } from "../..";
import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "vote",
    description: "Vote for a user on a leaderboard",
    type: "leaderboards",

    handler: async (message, args, o) => {
        if (!args[0] || !args[1])
            return message.reply(`Please provide a leaderboard name, and a user, like: \`${o.serverSettings.prefix}vote <leaderboard> <user mention>\``);
        const leaderboard = args[0].toLowerCase();
        const userId = args[1]?.replace(/[<>@]/g, "");
        let user: User;

        // Try fetch the user to make sure it exists
        try {
            user = await client.users.fetch(userId);
        } catch {
            return message.reply(`That user does not exist!`);
        }

        // Check if self
        if (user.id === message.author.id)
            return message.reply(`You cannot vote for yourself, silly :cyclone:`);
        if (user.bot)
            return message.reply(`You cannot vote on a bot, silly :cyclone:`);

        // Try create the vote
        if (await database.get(`SELECT 1 FROM votes WHERE voter = (?) AND rank_name = (?);`, message.author.id, leaderboard)) {
            // UPDATE
            await database.run(`UPDATE votes SET votee = (?) WHERE voter = (?) AND rank_name = (?)`, user.id, message.author.id, leaderboard);
        } else {
            await database.run(`INSERT INTO votes (rank_name, voter, votee) VALUES ((?), (?), (?));`, leaderboard, message.author.id, user.id);
        }

        return message.reply(`Your vote on **${leaderboard}** has been cast against **${user.username}**!`);
    }
}

export default command;