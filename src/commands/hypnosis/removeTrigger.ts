import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand<{ trigger: string; confirm?: string }> = {
  name: "removetrigger",
  type: "hypnosis",
  aliases: ["removei", "removeimposition"],
  description: "Remove one of your triggers that the bot can use on you",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "trigger",
        type: "string",
        takeContent: true,
      },
      {
        name: "confirm",
        type: "confirm",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Check to remove all
    if (args.trigger.startsWith("all")) {
      if (!args.confirm)
        return message.reply(
          `:warning: Dangerous action! Please provide the confirm option that you want to **delete all your triggers** from the bot.`
        );

      await database.run(
        `DELETE FROM user_imposition WHERE user_id = ?;`,
        message.author.id
      );
      return message.reply(`All your triggers have been removed!`);
    }

    // Check if already has it
    if (
      !(await database.get(
        "SELECT 1 FROM user_imposition WHERE user_id = ? AND what = ?",
        message.author.id,
        args.trigger
      ))
    )
      return message.reply(`:warning: You do not have that trigger!`);

    // Remove it
    await database.run(
      `DELETE FROM user_imposition WHERE user_id = ? AND what = ?;`,
      message.author.id,
      args.trigger
    );

    return message.reply(`Sucessfully deleted! :cyclone:`);
  },
};

export default command;
