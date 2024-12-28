import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { addMoneyFor } from "../../util/actions/economy";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { calculateItemPrice } from "../../util/items";
import { createEmbed } from "../../util/other";
import { currency, itemText } from "../../util/textProducer";

const command: HypnoCommand<{ tag: string }> = {
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
        oneOf: ["fish"],
      },
    ],
  },

  handler: async (message, { args }) => {
    const items = (
      await actions.items.aquired.resolveFrom(
        await actions.items.aquired.getAllFor(message.author.id)
      )
    ).filter((x) => x.tag === args.tag && !x.protected);

    const price = items.reduce(
      (c, v) => c + calculateItemPrice(v) * v.amount,
      0
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
          Object.fromEntries(items.map((x) => [x.id, x.amount]))
        );
        await addMoneyFor(message.author.id, price);
        return {
          embeds: [createEmbed().setTitle("Sold items!").setDescription(msg)],
        };
      },
      autoYes: price < 500,
    });
  },
};

export default command;
