import { HypnoCommand } from "../../types/command";
import { getItem } from "../../util/actions/items";
import { database } from "../../util/database";

const command: HypnoCommand<{ itemId: number, newName: string }> = {
    name: "renameitem",
    type: "economy",
    description: "Rename an item",

    botOwnerOnly: true,

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "itemId",
                type: "number"
            },
            {
                name: "newName",
                type: "string"
            }
        ]
    },

    handler: async (message, { args }) => {
        if (!(await getItem(args.itemId)))
            return message.reply(`That item does not exist!`);
        await database.run(`UPDATE items SET name = ? WHERE id = ?`, args.newName, args.itemId);
        return message.reply(`Updated the item's name!`);
    }
};

export default command;