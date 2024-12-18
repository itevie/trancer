import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getUserData } from "../../util/actions/userData";
import {
  calculateLevel,
  getXPForLevel,
  xpForNextLevel,
} from "../../messageHandlers/xp";
import { makePercentageASCII } from "../../util/other";

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
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;
    const { xp } = await getUserData(user.id, message.guild.id);

    const level = calculateLevel(xp);
    const currentLevelXP = getXPForLevel(level - 2);
    const nextLevelXP = getXPForLevel(level);
    const progress =
      ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return message.reply(
      `**${
        user.username
      }** has **${xp} XP** (level ${level})\n\n${level} ${makePercentageASCII(
        progress,
        20
      )} ${level + 1}`
    );
  },
};

export default command;
