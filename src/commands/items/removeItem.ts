import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getAquiredItem } from "../../util/actions/items";
import { database } from "../../util/database";

const command: HypnoCommand<{ user: User, id: number, amount: number }> = {
    name: "removeitems",
    description: "Removes an item",
    type: "economy",

    guards: ["bot-owner"],

    args: {
        requiredArguments: 3,
        args: [
            {
                name: "user",
                type: "user"
            },
            {
                name: "id",
                type: "wholepositivenumber"
            },
            {
                name: "amount",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Validate
        let item = await getAquiredItem(args.id, args.user.id);
        if (!item)
            return message.reply(`The user does not have any of those items!`);

        // Remove
        await database.run(`UPDATE aquired_items SET amount = amount - ? WHERE user_id = ? AND item_id = ?`, args.amount, args.user.id, args.id);

        return message.reply("Done!");
    }
};

export default command;