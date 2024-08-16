import { HypnoCommand } from "../../types/command";
import { getAllGuildsUserData } from "../../util/actions/userData";
import createLeaderboardFromData from "../../util/createLeaderboard";

const command: HypnoCommand = {
    name: `vctime`,
    description: `See who has yapped in VC the longest`,
    type: "leaderboards",

    handler: async (message) => {
        let data = await getAllGuildsUserData(message.guild.id);
        let organised = data.map(x => [x.user_id, x.vc_time]) as [string, number][];

        return message.reply({
            embeds: [
                (await createLeaderboardFromData(organised, "Who has yapped the most in VC?", "minutes"))
                    .setTitle(`Most VC time!`)
            ]
        })
    }
};

export default command;