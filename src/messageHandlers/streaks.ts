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

    let setTime = async () => {
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "last_talking_streak",
        now.toISOString(),
      );
    };

    if (userData.talking_streak > userData.highest_talking_streak)
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "highest_talking_streak",
        userData.talking_streak,
      );

    if (diffDays > 1) {
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "talking_streak",
        0,
      );
      setTime();

      return;
    } else if (diffDays === 0) {
      if (userData.last_talking_streak === null) setTime();
      return;
    } else {
      await actions.userData.updateFor(
        message.author.id,
        message.guild.id,
        "talking_streak",
        userData.talking_streak + 1,
      );
      setTime();
    }
  },
};

export default handler;
