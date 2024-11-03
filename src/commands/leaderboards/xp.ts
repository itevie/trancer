import { calculateLevel } from "../../messageHandlers/xp";
import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import createLeaderboardFromData from "../../util/createLeaderboard";

const command: HypnoCommand = {
  name: `xpleaderboard`,
  aliases: ["xpl"],
  description: `See who has the highest level`,
  type: "leaderboards",

  handler: async (message) => {
    let data = await getAllGuildsUserData(message.guild.id);
    let organised = data.map((x) => [
      x.user_id,
      x.xp,
      `Level ${calculateLevel(x.xp)}`,
    ]) as [string, number, any?][];

    return message.reply({
      embeds: [
        (await createLeaderboardFromData(organised, null, null)).setTitle(
          `Most XP in server`
        ),
      ],
    });
  },
};

export default command;
