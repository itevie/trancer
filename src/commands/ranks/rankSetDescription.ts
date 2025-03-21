import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import config from "../../config";

const command: HypnoCommand<{ rank: Rank; description: string }> = {
  name: "setrankdescription",
  aliases: ["srankdesc", "setrankdesc"],
  type: "ranks",
  description: "Set a ranks's description",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "rank",
        type: "rank",
      },
      {
        name: "description",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    if (
      args.rank.created_by !== message.author.id &&
      !config.exceptions.includes(message.author.id)
    )
      return message.reply(`You did not create this rank!`);

    // Update
    await database.run(
      `UPDATE ranks SET description = (?) WHERE rank_name = (?);`,
      args.description,
      args.rank.rank_name
    );

    return message.reply(`Updated rank description!`);
  },
};

export default command;
