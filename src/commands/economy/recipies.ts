import recipies from "../../craftingRecipies";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { itemMap } from "../../util/db-parts/items";
import { createEmbed, englishifyList } from "../../util/other";
import { itemText } from "../../util/language";

const command: HypnoCommand = {
  name: "recipes",
  aliases: ["recipies"],
  description: "Get a list of craftable items",
  type: "economy",

  handler: (message, { serverSettings }) => {
    const data: string[] = [];

    for (const part of Object.entries(recipies)) {
      data.push(
        `${itemText(itemMap[part[0]])}\n- ${englishifyList(
          part[1].map((x) => `${itemText(itemMap[x[0]], x[1])}`)
        )}`
      );
    }

    return paginate({
      replyTo: message,
      embed: createEmbed()
        .setTitle("List of craftable items")
        .setFooter({ text: `Get with ${serverSettings.prefix}craft [item]` }),
      type: "description",
      data: data,
    });
  },
};

export default command;
