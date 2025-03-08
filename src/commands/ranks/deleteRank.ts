import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import config from "../../config";

const command: HypnoCommand<{ name: string; confirm?: string }> = {
  name: "deleterank",
  description: "Delete a rank",
  type: "ranks",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "confirm",
        type: "string",
        mustBe: "confirm",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    // Check for rank
    const rankName = args.name.toLowerCase();

    // Fetch rank
    const rank = (await database.get(
      `SELECT * FROM ranks WHERE rank_name = (?);`,
      rankName
    )) as Rank | undefined;

    // Check if exists
    if (!rank) return message.reply(`That leaderboard does not exist!`);

    // Check if owns it
    if (
      rank.created_by !== message.author.id &&
      rank.created_by === config.owner
    )
      return message.reply(
        `You need to be the leaderboard creator to delete it!`
      );

    // Check confirm
    if (!args.confirm)
      return message.reply(
        `Please provide confirm as the last arguemnt: \`${serverSettings.prefix}deleterank ${rankName} confirm\``
      );

    // Delete
    await database.run(`DELETE FROM votes WHERE rank_name = (?);`, rankName);
    await database.run(`DELETE FROM ranks WHERE rank_name = (?);`, rankName);

    // Done
    return message.reply(`Leaderboard deleted. :cyclone:`);
  },
};

export default command;
