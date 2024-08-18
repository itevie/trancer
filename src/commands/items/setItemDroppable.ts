import { HypnoCommand } from "../../types/command";
import { getItem } from "../../util/actions/items";
import { database } from "../../util/database";

const command: HypnoCommand<{ itemId: number, value: boolean }> = {
    name: "setitemdroppable",
    description: "Sets an items as droppable",
    type: "economy",

    botOwnerOnly: true,

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "itemId",
                type: "wholepositivenumber"
            },
            {
                name: "value",
                type: "boolean"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if item exists
        let item = await getItem(args.itemId);
        if (!item)
            return message.reply(`An item with that ID does not exist`);

        // Update
        await database.run(`UPDATE items SET droppable = ? WHERE id = ?`, args.value, args.itemId);

        return message.reply(`Updated!`);
    },
};

export default command;