import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getAquiredItemsFor, getItem } from "../../util/actions/items";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "inventory",
  aliases: ["inv"],
  description: "Get your or someones else's inventory",
  type: "economy",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;

    let items = await getAquiredItemsFor(user.id);

    let embed = createEmbed().setTitle(`${user.username}'s inventory`);

    if (items.length === 0) embed.setDescription(`*No items :(*`);
    else {
      let text: string[] = [];
      for await (const i of items) {
        let item = await getItem(i.item_id);
        text.push(`**${item.name}**: ${i.amount}`);
      }
      embed.setDescription(text.join("\n"));
    }

    return message.reply({
      embeds: [embed],
    });
  },
};

export default command;
