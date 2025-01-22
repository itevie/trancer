import { calculateLevel } from "../../messageHandlers/xp";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "alltogetherleaderboard",
  aliases: ["alltogetherlb", "alltogether", "allt", "alltlb"],
  description: "Combines all the user data into one! (for the current server)",
  type: "leaderboards",

  handler: async (message) => {
    const userData = await actions.userData.getForServer(message.guild.id);
    const messages = userData.reduce((v, c) => v + c.messages_sent, 0);
    const vcTime = userData.reduce((v, c) => v + c.vc_time, 0);
    const xp = userData.reduce((v, c) => v + c.xp, 0);
    const bumps = userData.reduce((v, c) => v + c.bumps, 0);

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle("All our statistics together <3")
          .setDescription(
            `**Messages**: ${messages}:speech_balloon:\n` +
              `**VC Time**: ${vcTime} minutes\n` +
              `**XP**: ${xp} XP (Level ${calculateLevel(xp)})\n` +
              `**Bumps**: ${bumps} bumps`
          ),
      ],
    });
  },
};

export default command;
