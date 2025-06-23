import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import badges from "../../util/badges";
import { createEmbed } from "../../util/other";
import { actions } from "../../util/database";
import { paginate } from "../../util/components/pagination";

const command: HypnoCommand = {
  name: "badgelist",
  aliases: ["badgel", "bl"],
  description: "Get a list of badges",
  type: "badges",

  handler: async (message) => {
    let aquiredBadges = await actions.badges.aquired.getAll();
    let text: string[] = [];

    for (let i in badges) {
      let amount = aquiredBadges.filter((x) => x.badge_name === i).length;
      let theUser: User | null;
      if (amount === 1)
        theUser = await message.client.users.fetch(
          aquiredBadges.find((x) => x.badge_name === i).user,
        );
      text.push(
        `${badges[i].emoji} \`${badges[i].name}\` *${
          badges[i].description
        }*\n - ${amount} ${amount === 1 ? "person has" : "people have"} this${
          theUser ? ` (${theUser.username})` : ""
        }\n`,
      );
    }

    return paginate({
      message,
      embed: createEmbed().setTitle("List of badges"),
      type: "description",
      data: text,
    });
  },
};

export default command;
