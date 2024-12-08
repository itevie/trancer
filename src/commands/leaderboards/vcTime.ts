import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: `vctime`,
  description: `See who has yapped in VC the longest`,
  type: "leaderboards",

  handler: async (message) => {
    let data = await getAllGuildsUserData(message.guild.id);
    let organised = data.map((x) => [x.user_id, x.vc_time]) as [
      string,
      number
    ][];

    await createPaginatedLeaderboardFromData({
      embed: createEmbed().setTitle(`Most messages in server`),
      replyTo: message,
      data: organised,
      description: "Who has yapped the most in VC?",
      entryName: "minutes",
    });
  },
};

export default command;
