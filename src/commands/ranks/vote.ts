import { User } from "discord.js";
import { client } from "../..";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { rankExists } from "../../util/actions/ranks";

const command: HypnoCommand<{ user: User; rank: string }> = {
  name: "vote",
  description: "Vote for a user on a rank",
  type: "ranks",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "rank",
        type: "string",
      },
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    const rank = args.rank.toLowerCase();
    const user = args.user;

    // Check if the rank exists
    if (!(await rankExists(rank)))
      return message.reply(
        `That rank does not exist! But can be created using \`${serverSettings.prefix}createrank ${rank}\``
      );

    // Check if self
    if (user.id === message.author.id)
      return message.reply(`You cannot vote for yourself, silly :cyclone:`);
    if (user.bot)
      return message.reply(`You cannot vote on a bot, silly :cyclone:`);

    // Try create the vote
    if (
      await database.get(
        `SELECT 1 FROM votes WHERE voter = (?) AND rank_name = (?);`,
        message.author.id,
        rank
      )
    ) {
      const old = (await database.get(
        `SELECT * FROM votes WHERE voter = (?) AND rank_name = (?);`,
        message.author.id,
        rank
      )) as Vote;
      // UPDATE
      await database.run(
        `UPDATE votes SET votee = (?) WHERE voter = (?) AND rank_name = (?)`,
        user.id,
        message.author.id,
        rank
      );
      return message.reply(
        `Your vote on **${rank}** has been changed from **${
          (await client.users.fetch(old.votee)).username
        }** to **${user.username}**`
      );
    } else {
      await database.run(
        `INSERT INTO votes (rank_name, voter, votee) VALUES ((?), (?), (?));`,
        rank,
        message.author.id,
        user.id
      );
    }

    return message.reply(
      `Your vote on **${rank}** has been cast against **${user.username}**!`
    );
  },
};

export default command;
