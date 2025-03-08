import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { actions } from "../../util/database";
import { itemText } from "../../util/language";

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

    let items = await actions.items.aquired.getAllFor(user.id);

    let embed = createEmbed().setTitle(`${user.username}'s inventory`);

    if (items.length === 0) embed.setDescription(`*No items :(*`);
    else {
      let text: string[] = [];
      for await (const i of items) {
        let item = await actions.items.get(i.item_id);
        text.push(
          `**${itemText(item)}**: ${i.amount}${
            i.protected ? ` *[protected]*` : ""
          }`
        );
      }
      embed.setDescription(text.join("\n"));
    }

    return message.reply({
      embeds: [embed],
    });
  },
};

export default command;
