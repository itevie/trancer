import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import createLeaderboardFromData from "../../util/createLeaderboard";

const command: HypnoCommand = {
    name: `messages`,
    description: `See who has sent the most messages in this server`,
    type: "leaderboards",

    handler: async (message) => {
        let data = await getAllGuildsUserData(message.guild.id);
        let organised = data.map(x => [x.user_id, x.messages_sent]) as [string, number][];

        return message.reply({
            embeds: [
                (await createLeaderboardFromData(organised, "Who has yapped the most?"))
                    .setTitle(`Most messages in server`)
            ]
        })
    }
};

export default command;