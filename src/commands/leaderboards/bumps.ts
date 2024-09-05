import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import createLeaderboardFromData from "../../util/createLeaderboard";

const command: HypnoCommand = {
    name: `bumps`,
    description: `See who has bumped the most in this server`,
    type: "leaderboards",

    handler: async (message) => {
        let data = await getAllGuildsUserData(message.guild.id);
        let organised = data.map(x => [x.user_id, x.bumps]) as [string, number][];

        return message.reply({
            embeds: [
                (await createLeaderboardFromData(organised, "Who has bumped the most?"))
                    .setTitle(`Most bumps in server`)
                    .setFooter({ text: `Bump the server with /bump to get higher!` })
            ]
        })
    }
};

export default command;