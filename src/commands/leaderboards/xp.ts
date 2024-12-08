import { calculateLevel } from "../../messageHandlers/xp";
import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { createEmbed } from "../../util/other";

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

    await createPaginatedLeaderboardFromData({
      embed: createEmbed().setTitle(`Most XP in server`),
      replyTo: message,
      data: organised,
    });
  },
};

export default command;
