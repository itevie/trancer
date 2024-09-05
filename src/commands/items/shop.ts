import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
    name: "shop",
    aliases: ["store"],
    description: "Get a list of items you can buy",
    type: "economy",

    handler: async (message, { serverSettings }) => {
        let items = await database.all(`SELECT * FROM items;`) as Item[];
        let text: string[] = [];

        for (const item of items) {
            text.push(`**${item.name}** - ${item.price}${config.economy.currency}\n- *${item.description ?? "No description"}*`);
        }

        if (text.length === 0) text.push(`*No Items*`)

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`The Shop`)
                    .setDescription(text.join("\n\n"))
                    .setFooter({ text: `Buy with ${serverSettings.prefix}buy <item>` })
            ]
        });
    }
};

export default command;