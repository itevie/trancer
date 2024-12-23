import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getRandomImposition } from "../../util/other";
import { getUserData } from "../../util/actions/userData";

const command: HypnoCommand<{ user?: User }> = {
  name: "sendtrigger",
  aliases: ["i", "impo", "t", "trigger"],
  description: "Send someone's trigger",
  type: "hypnosis",

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "user",
        name: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    if (
      args.user &&
      !(await getUserData(args.user.id, message.guild.id)).allow_triggers
    )
      return message.reply(`:warning: That user has triggers disabled.`);

    return message.reply(
      await getRandomImposition(args.user ? args.user.id : message.author.id)
    );
  },
};

export default command;
