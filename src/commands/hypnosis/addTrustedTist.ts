import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{ user: User }> = {
  name: "addtrustedtist",
  aliases: ["addtist"],
  type: "hypnosis",
  description:
    "Adds a trusted tist for yourself. This means they can add triggers on your behalf.",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    if (
      (await actions.triggers.trustedTists.getListFor(message.author.id)).some(
        (x) => x.trusted_user_id === args.user.id
      )
    )
      return message.reply(`You have already trusted that peron!`);

    await actions.triggers.trustedTists.addFor(message.author.id, args.user.id);
    return message.reply(
      `Added **${args.user.username}** to your trusted tist list!`
    );
  },
};

export default command;
