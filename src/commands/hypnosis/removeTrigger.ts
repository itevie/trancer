import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{
  trigger: string;
  confirm?: string;
  user?: User;
}> = {
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
        name: "user",
        aliases: ["u", "for"],
        type: "user",
        wickStyle: true,
        description: "Which user to set it for",
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = message.author;

    if (args.user) {
      if (
        !(await actions.triggers.trustedTists.getListFor(args.user.id)).some(
          (x) => x.trusted_user_id === user.id
        )
      )
        return message.reply(`You are not on this person's trusted tist list.`);
      user = args.user;
    }

    // Check to remove all
    if (args.trigger.startsWith("all")) {
      if (!args.confirm)
        return message.reply(
          `:warning: Dangerous action! Please provide the confirm option that you want to **delete all your triggers** from the bot.`
        );

      await database.run(
        `DELETE FROM user_imposition WHERE user_id = ?;`,
        user.id
      );
      return message.reply(`All your triggers have been removed!`);
    }

    // Check if already has it
    if (
      !(await database.get(
        "SELECT 1 FROM user_imposition WHERE user_id = ? AND what = ?",
        user.id,
        args.trigger
      ))
    )
      return message.reply(`:warning: You do not have that trigger!`);

    // Remove it
    await database.run(
      `DELETE FROM user_imposition WHERE user_id = ? AND what = ?;`,
      user.id,
      args.trigger
    );

    return message.reply(
      `Sucessfully deleted! :cyclone:\nNote: you can manage your triggers more easier on the site: <https://trancer.dawn.rest/user_settings>`
    );
  },
};

export default command;
