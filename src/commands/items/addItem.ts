import { HypnoCommand } from "../../types/util";
import { getItemByName } from "../../util/actions/items";
import { database } from "../../util/database";

const command: HypnoCommand<{ name: string, price: number }> = {
    name: "+item",
    type: "economy",
    description: "Add an item to the shop",

    guards: ["bot-owner"],

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "name",
                type: "string"
            },
            {
                name: "price",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if it already exists
        if (await getItemByName(args.name))
            return message.reply(`An item with that name already exists!`);

        // Create item
        let item = await database.get(`INSERT INTO items (name, price) VALUES (?, ?) RETURNING *`, args.name, args.price) as Item;
        return message.reply(`Item created! ID: **${item.id}**`);
    }
};

export default command;