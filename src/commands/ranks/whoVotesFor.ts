import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { rankExists } from "../../util/actions/ranks";
import { database } from "../../util/database";
import { getUsername } from "../../util/cachedUsernames";

const command: HypnoCommand<{ rank: string; user?: User }> = {
  name: "whovotedfor",
  aliases: ["whovoted", "wvf"],
  description: "See who voted for someone on a rank",
  type: "ranks",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "rank",
      },
      {
        type: "user",
        name: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;

    if (!(await rankExists(args.rank)))
      return message.reply("That rank does not exist!");

    let votes = await database.all<Vote[]>(
      "SELECT * FROM votes WHERE votee = ? AND rank_name = ?;",
      user.id,
      args.rank
    );
    let users: string[] = [];
    for await (const vote of votes) {
      users.push(await getUsername(vote.voter));
    }

    return message.reply(
      `The following voted for **${user.username}** on rank **${
        args.rank
      }**\n\n${users.join("\n")}`
    );
  },
};

export default command;
