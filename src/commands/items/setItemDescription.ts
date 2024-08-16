import { HypnoCommand } from "../../types/command";
import { getItem } from "../../util/actions/items";
import { database } from "../../util/database";

const command: HypnoCommand<{ itemId: number, }> = {
    name: "=itemdescription",
    aliases: ["=itemdesc"],
    description: "Sets an items description",
    type: "economy",

    botOwnerOnly: true,

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