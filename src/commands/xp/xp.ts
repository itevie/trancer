import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getUserData } from "../../util/actions/userData";
import { calculateLevel } from "../../messageHandlers/xp";

const command: HypnoCommand<{ user?: User }> = {
  name: "xp",
  aliases: ["level"],
  description: "Get your XP",
  type: "economy",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;
    const data = await getUserData(user.id, message.guild.id);
    return message.reply(
      `**${user.username}** has **${data.xp} XP** (level ${calculateLevel(
        data.xp
      )})`
    );
  },
};

export default command;
