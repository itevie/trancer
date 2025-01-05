import recipies from "../../craftingRecipies";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { itemMap } from "../../util/db-parts/items";
import { englishifyList } from "../../util/other";
import { itemText } from "../../util/textProducer";

const command: HypnoCommand<{ item: Item; amount?: number }> = {
  name: "craft",
  description: "Craft an item",
  type: "economy",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "item",
        type: "item",
      },
      { name: "amount", type: "wholepositivenumber" },
    ],
  },

  handler: async (message, { args }) => {
    // Get details
    const amount = args.amount || 1;
    const aquired = await actions.items.aquired.getAllFor(message.author.id);

    // Get recipe
    const recipe = recipies[args.item.name];
    if (!recipe) return message.reply(`That item has no crafting recipe!`);

    // Compute amounts
    const neededItems: [Item, number][] = [];
    for (const item of recipe)
      neededItems.push([itemMap[item[0]], item[1] * amount]);

    // Check if user has them
    for (const needed of neededItems)
      if (
        !aquired.some((x) => x.item_id === needed[0].id) ||
        aquired.find((x) => x.item_id === needed[0].id).amount < needed[1]
      )
        return message.reply(
          `You do not have ${itemText(needed[0], needed[1])}`
        );

    // Remove items
    await actions.items.aquired.removeManyFor(
      message.author.id,
      Object.fromEntries(neededItems.map((x) => [x[0].id, x[1]]))
    );

    // Award items
    await actions.items.aquired.addFor(message.author.id, args.item.id, amount);

    // Done
    return message.reply(
      `You crafted ${itemText(args.item, amount)} for ${englishifyList(
        recipe.map((x) => itemText(itemMap[x[0]], x[1]))
      )}`
    );
  },
};

export default command;
