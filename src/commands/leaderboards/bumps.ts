import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: `bumps`,
  description: `See who has bumped the most in this server`,
  type: "leaderboards",

  handler: async (message) => {
    let data = await getAllGuildsUserData(message.guild.id);
    let organised = data.map((x) => [x.user_id, x.bumps]) as [string, number][];

    await createPaginatedLeaderboardFromData({
      embed: createEmbed()
        .setTitle(`Most bumps in server`)
        .setFooter({ text: `Bump the server with /bump to get higher!` }),
      replyTo: message,
      data: organised,
      description: "Who has bumped the most?",
    });
  },
};

export default command;
