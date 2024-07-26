import { HypnoCommand } from "../../types/command";
import { getEntriesForLeaderboard } from "../../util/actions/leaderboards";
import createLeaderboardFromData from "../../util/createLeaderboard";

const command: HypnoCommand = {
    name: `bumps`,
    description: `See who has bumped the most in this server`,

    handler: async (message) => {
        let leaderboardId = `bumps-${message.guild.id}`;
        let data = await getEntriesForLeaderboard(leaderboardId);

        return message.reply({
            embeds: [
                (await createLeaderboardFromData(data.map(x => x.user), "Who has bumped the most?"))
                    .setTitle(`Most bumps in server`)
                    .setFooter({ text: `Bump the server with /bump to get higher!` })
            ]
        })
    }
};

export default command;