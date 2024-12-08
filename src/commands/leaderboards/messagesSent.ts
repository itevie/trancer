import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: `messages`,
  description: `See who has sent the most messages in this server`,
  type: "leaderboards",

  handler: async (message) => {
    let data = await getAllGuildsUserData(message.guild.id);
    let organised = data.map((x) => [x.user_id, x.messages_sent]) as [
      string,
      number
    ][];

    await createPaginatedLeaderboardFromData({
      embed: createEmbed().setTitle(`Most messages in server`),
      replyTo: message,
      data: organised,
      description: "Who has yapped the most?",
    });
  },
};

export default command;
