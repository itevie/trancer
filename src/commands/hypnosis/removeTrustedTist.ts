import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{ user: User }> = {
  name: "removetrustedtist",
  aliases: ["removetist"],
  type: "hypnosis",
  description:
    "Removes a trusted tist for yourself. This means they can no longer add triggers on your behalf.",

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
      !(await actions.triggers.trustedTists.getListFor(message.author.id)).some(
        (x) => x.trusted_user_id === args.user.id
      )
    )
      return message.reply(`You have not trusted that peron!`);

    await actions.triggers.trustedTists.removeFor(message.author.id, args.user.id);
    return message.reply(
      `Removed **${args.user.username}** to your trusted tist list!`
    );
  },
};

export default command;
