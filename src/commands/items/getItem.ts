import { HypnoCommand } from "../../types/util";
import { calculateItemPrice } from "./_util";
import { createEmbed } from "../../util/other";
import { currency, itemText } from "../../util/language";

const command: HypnoCommand<{ item: Item }> = {
  name: "getitem",
  aliases: ["item", "itemdetails", "itemdet", "gitem"],
  description: "Get an item's details",
  type: "economy",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "item",
        type: "item",
      },
    ],
  },

  handler: (message, { args }) => {
    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`Item ${itemText(args.item)} (ID: ${args.item.id})`)
          .setDescription(`${args.item.description ?? "*No Description*"}`)
          .addFields([
            {
              name: "Details",
              value: [
                ["Price", currency(args.item.price)],
                ["Sell Price", currency(calculateItemPrice(args.item))],
                ["Buyable", args.item.buyable ? "yes" : "no"],
                ["Weight", `${(args.item.weight * 100).toFixed(0)}%`],
                ["Tag", args.item.tag ?? "*No Tag*"],
                ["Emoji", args.item.emoji ?? "*No Emoji*"],
                ["Max per person", args.item.max ?? "infinity"],
                ["Can appear in drops", args.item.droppable ? "yes" : "no"],
              ]
                .map((x) => `**${x[0]}**: ${x[1]}`)
                .join("\n"),
            },
          ]),
      ],
    });
  },
};

export default command;
