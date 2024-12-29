import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getRandomImposition } from "../../util/other";
import { actions } from "../../util/database";

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
    const user = args.user ? args.user.id : message.author.id;
    const userData = await actions.userData.getFor(user, message.guild.id);

    if (args.user && userData.allow_triggers)
      return message.reply(`:warning: That user has triggers disabled.`);

    const random = await actions.triggers.getRandomByTagFor(user, [
      userData.hypno_status,
      user !== message.author.id ? "by others" : "giraffe",
    ]);

    if (!random)
      return message.reply(
        `:warning: Could not get a random trigger for that user.\nTheir status is **${userData.hypno_status}**`
      );

    return message.reply(random.what);
  },
};

export default command;
