import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import config from "../../config";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ rank: Rank }> = {
  name: "deleterank",
  description: "Delete a rank",
  type: "ranks",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "rank",
        type: "rank",
      },
    ],
  },

  handler: async (message, { args }) => {
    if (
      args.rank.created_by !== message.author.id &&
      args.rank.created_by !== config.owner
    )
      return message.reply(`You need to be the rank creator to delete it!`);

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle("Are you sure?")
        .setDescription(
          `Are you sure you want to delete the **${args.rank.rank_name}** rank?`
        ),
      async callback() {
        await actions.ranks.delete(args.rank.rank_name);
        return {
          content: `Rank **${args.rank.rank_name}** was deleted!`,
          embeds: [],
        };
      },
    });
  },
};

export default command;
