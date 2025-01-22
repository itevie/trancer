import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import config from "../../config";

const command: HypnoCommand = {
  name: "setrankdescription",
  aliases: ["srankdesc", "setrankdesc"],
  type: "ranks",
  description: "Set a ranks's description",

  handler: async (message, { oldArgs: args, serverSettings }) => {
    if (!args[0] || !args[1])
      return message.reply(
        `Please provide a rank name and a description, example: \`${serverSettings.prefix}slbdesc fish Who is the most fishiest?\``
      );
    const name = args[0].toLowerCase();
    args.shift();
    const desc = args.join(" ");

    // Get
    const rank = await database.get(
      `SELECT * FROM ranks WHERE rank_name = (?);`,
      name
    );

    // Checks
    if (!rank) return message.reply(`That rank does not exist`);
    if (
      rank.created_by !== message.author.id &&
      !config.exceptions.includes(message.author.id)
    )
      return message.reply(`You did not create this rank!`);

    // Update
    await database.run(
      `UPDATE ranks SET description = (?) WHERE rank_name = (?);`,
      desc,
      name
    );

    return message.reply(`Updated rank description!`);
  },
};

export default command;
