import { AquiredBadge } from "../../types/aquiredBadge";
import { HypnoCommand } from "../../types/util";
import badges, { Badge } from "../../util/badges";
import cachedUsernames from "../../util/cachedUsernames";
import { paginate } from "../../util/components/pagination";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ badge: string }> = {
  name: "badgehavers",
  aliases: ["haversofthebadge", "whohasthisbadge", "whohasbadge"],
  type: "badges",
  description: "Check who has a badge",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "badge",
        oneOf: Object.keys(badges),
      },
    ],
  },

  handler: async (message, args) => {
    // Find the wanted badge
    let badge: Badge | null = null;
    let badgeId: string;
    if (badges[args.args.badge]) {
      badgeId = args.args.badge;
      badge = badges[args.args.badge];
    } else {
      for (let i in badges)
        if (
          badges[i].name.toLowerCase().replace(/ /g, "") ===
          args.args.badge.toLowerCase()
        ) {
          badge = badges[args.args.badge];
          badgeId = i;
        }
    }

    // Check if it was found
    if (!badge)
      return message.reply(`Cannot find a badge with that ID or name!`);

    // Fetch the data
    const aquired = (await database.all(
      `SELECT * FROM aquired_badges WHERE badge_name = ?`,
      badgeId,
    )) as AquiredBadge[];
    if (aquired.length > 20)
      return message.reply(`Too many people have this badge to display it.`);

    paginate({
      message: message,
      embed: createEmbed().setTitle(`Who has ${badge.emoji} ${badge.name}`),
      type: "description",
      data: aquired.map((x) => cachedUsernames.getSync(x.user)),
    });
  },
};

export default command;
