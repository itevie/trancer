import { HypnoCommand } from "../../types/util";
import { getAllCommandUsage } from "../../util/analytics";
import { createPaginatedLeaderboardFromData } from "../../util/createLeaderboard";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "commandusage",
  description: "Get the most used commands",
  type: "analytics",

  handler: async (message) => {
    const data = (await getAllCommandUsage()).map(
      (x) => [x.command_name, x.used] as [string, number]
    );

    await createPaginatedLeaderboardFromData({
      replyTo: message,
      embed: createEmbed().setTitle("Most used commands"),
      data,
      rawName: true,
    });
  },
};

export default command;
