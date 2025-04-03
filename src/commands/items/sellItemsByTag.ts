import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { calculateItemPrice } from "./_util";
import { createEmbed } from "../../util/other";
import { currency, itemText } from "../../util/language";

const command: HypnoCommand<{ tag: string; but?: number }> = {
  name: "sellitemsbytag",
  aliases: ["sellall", "selltag"],
  type: "economy",
  description: "Sell all items that match a tag",
  args: {
    requiredArguments: 1,
    args: [
      {
        name: "tag",
        type: "string",
        oneOf: ["fish", "mineral"],
      },
      {
        name: "but",
        type: "wholepositivenumber",
        min: 1,
        wickStyle: true,
        description: "Sell all items, but keep x amount",
      },
    ],
  },

  handler: async (message, { args }) => {
    const items = (
      await actions.items.aquired.resolveFrom(
        await actions.items.aquired.getAllFor(message.author.id),
      )
    )
      .map((x) => {
        return {
          ...x,
          amount: x.amount - (args.but ?? 0),
        };
      })
      .filter((x) => x.amount > 0 && x.tag === args.tag && !x.protected);

    const price = items.reduce(
      (c, v) => c + calculateItemPrice(v) * v.amount,
      0,
    );

    const msg = `${items
      .map((x) => `${itemText(x)}: ${x.amount}`)
      .join("\n")}\n\nFor ${currency(price)}`;

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle("Are you sure you want to sell these items?")
        .setDescription(msg),
      callback: async () => {
        await actions.items.aquired.removeManyFor(
          message.author.id,
          Object.fromEntries(items.map((x) => [x.id, x.amount])),
        );
        await actions.eco.addMoneyFor(message.author.id, price);
        return {
          embeds: [createEmbed().setTitle("Sold items!").setDescription(msg)],
        };
      },
      autoYes: price < 500,
    });
  },
};

export default command;
