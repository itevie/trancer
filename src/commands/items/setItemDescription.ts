import { HypnoCommand } from "../../types/util";
import { getItem } from "../../util/actions/items";
import { database } from "../../util/database";

const command: HypnoCommand<{ itemId: number, }> = {
    name: "setitemdescription",
    aliases: ["setitemdesc"],
    description: "Sets an items description",
    type: "economy",

    guards: ["bot-owner"],

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "itemId",
                type: "wholepositivenumber"
            },
        ]
    },

    handler: async (message, { oldArgs, args }) => {
        // Check if item exists
        let item = await getItem(args.itemId);
        if (!item)
            return message.reply(`An item with that ID does not exist`);

        // Update
        oldArgs.shift();
        await database.run(`UPDATE items SET description = ? WHERE id = ?`, oldArgs.join(" "), args.itemId);

        return message.reply(`Updated!`);
    },
};

export default command;