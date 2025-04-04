import { HypnoCommand, HypnoInteractionCommand } from "../../types/util";
import { getUsernameSync } from "../../util/cachedUsernames";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "birthdays",
  aliases: ["birthdaylist"],
  description: "Get a list of birthdays!",
  type: "fun",

  handler: async (message) => {
    const today = new Date();
    const todayMonth = today.getMonth(); // 0-indexed
    const todayDate = today.getDate();

    const getNextBirthday = (birthdayStr: string): Date => {
      const [, mm, dd] = birthdayStr.split("/").map(Number);
      const month = mm - 1; // JS months are 0-based
      const day = dd;

      let year = today.getFullYear();
      const birthdayThisYear = new Date(year, month, day);

      // If it already happened this year, move to next year
      if (
        birthdayThisYear.getMonth() < todayMonth ||
        (birthdayThisYear.getMonth() === todayMonth &&
          birthdayThisYear.getDate() < todayDate)
      ) {
        year++;
      }

      return new Date(year, month, day);
    };

    const userData = (await actions.userData.getForServer(message.guild.id))
      .filter((x) => !!x.birthday)
      .map((x) => {
        return {
          ...x,
          birthday_date: getNextBirthday(x.birthday),
        } as const;
      })
      .sort((a, b) => a.birthday_date.getTime() - b.birthday_date.getTime());

    return paginate({
      message,
      embed: createEmbed().setTitle("Upcoming Birthdays"),
      type: "description",
      data: userData.map((x) => {
        const msDiff = x.birthday_date.getTime() - today.getTime();
        const daysUntil = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

        return `**${getUsernameSync(x.user_id)}**: ${x.birthday_date.toDateString()} (${daysUntil} day${daysUntil !== 1 ? "s" : ""} left)`;
      }),
    });
  },
};

export default command;
