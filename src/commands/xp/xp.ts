import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import {
  calculateLevel,
  getXPForLevel,
  maxXP,
  minXP,
  timeBetween,
} from "../../messageHandlers/xp";
import { makePercentageASCII } from "../../util/other";
import { actions } from "../../util/database";
import ecoConfig from "../../ecoConfig";

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
    const { xp } = await actions.userData.getFor(user.id, message.guild.id);

    const level = calculateLevel(xp);
    const currentLevelXP = getXPForLevel(level - 2);
    const nextLevelXP = getXPForLevel(level);
    const neededXP = nextLevelXP - currentLevelXP;
    const progress = ((xp - currentLevelXP) / neededXP) * 100;

    const most = neededXP / (timeBetween * minXP);
    const least = neededXP / (maxXP * (timeBetween / 60000));
    const average =
      neededXP / (Math.floor(maxXP / 2) * ((timeBetween * 2) / 60000));

    return message.reply(
      `**${
        user.username
      }** has **${xp} XP** (level ${level})\n\n${level} ${makePercentageASCII(
        progress,
        20
      )} ${
        level + 1
      }\n\nIt will take:\n> Least: **${least} minutes**\n> Average: **${average} minutes**\n> Most: **${most} minutes**`
    );
  },
};

export default command;
