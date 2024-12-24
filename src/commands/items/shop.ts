import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed, paginate } from "../../util/other";

const command: HypnoCommand = {
  name: "shop",
  aliases: ["store"],
  description: "Get a list of items you can buy",
  type: "economy",

  handler: async (message, { serverSettings }) => {
    let items = (await database.all(`SELECT * FROM items;`)) as Item[];

    return paginate({
      replyTo: message,
      embed: createEmbed()
        .setTitle("The Shop")
        .setFooter({ text: `Buy with ${serverSettings.prefix}buy <item>` })
        .setTimestamp(null),
      type: "description",
      data: items.map(
        (item) =>
          `**${item.name}** - ${item.price}${config.economy.currency} (${
            item.weight * 100
          }%)\n- *${item.description ?? "No description"}${
            item.tag ? `[${item.tag}]` : ""
          }*`
      ),
    });
  },
};

export default command;
