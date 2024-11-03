import {
  after,
  calculateLevel,
  levels,
  rewards,
} from "../../messageHandlers/xp";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "xplevels",
  description: "Get a list of XP required for certain levels",
  type: "economy",

  handler: async (message) => {
    let text = "";

    for (const level in levels) {
      text += `**Level ${parseInt(level) + 2}**: ${levels[level]} XP\n`;
      if (rewards[calculateLevel(levels[level])])
        text += `- ${rewards[calculateLevel(levels[level])].label}\n`;
    }

    text += `*And so on... **${after} XP** required for each level*`;

    return message.reply(text);
  },
};

export default command;
