import recipies from "../../craftingRecipies";
import { HypnoCommand } from "../../types/util";
import { itemMap } from "../../util/db-parts/items";
import { createEmbed, englishifyList, paginate } from "../../util/other";
import { itemText } from "../../util/textProducer";

const command: HypnoCommand = {
  name: "recipes",
  aliases: ["recipies"],
  description: "Get a list of craftable items",
  type: "economy",

  handler: (message) => {
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
      embed: createEmbed().setTitle("List of craftable items"),
      type: "description",
      data: data,
    });
  },
};

export default command;
