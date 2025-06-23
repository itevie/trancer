import { HypnoMessageHandler } from "../types/util";
import { actions } from "../util/database";
import { units } from "../util/ms";

const handler: HypnoMessageHandler = {
  name: "streaks",
  description: "Handles talking streaks",

  handler: async (message) => {
    let userData = await actions.userData.getFor(
      message.author.id,
      message.guild.id,
    );
    let lastStreak = new Date(userData.last_talking_streak ?? Date.now());
    let now = new Date();

    const lastDay = new Date(
      lastStreak.getFullYear(),
      lastStreak.getMonth(),
      lastStreak.getDate(),
    );
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = today.getTime() - lastDay.getTime();
    const diffDays = diffMs / units.day;

    if (diffDays > 1) {
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "talking_streak",
        0,
      );
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "last_talking_streak",
        now.toISOString(),
      );

      return;
    } else if (diffDays === 0) {
      return;
    } else {
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "talking_streak",
        userData.talking_streak + 1,
      );
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "last_talking_streak",
        now.toISOString(),
      );
    }
  },
};

export default handler;
