import { HypnoCommand } from "../../types/util";
import { getRoleMenu } from "../../util/actions/roleMenus";
import { database } from "../../util/database";

const command: HypnoCommand<{ id: number }> = {
    name: "setrolemenuattachedto",
    aliases: ["srat"],
    type: "admin",
    description: "Set's a role menu's attached_to",
    guards: ["admin"],

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        if (!message.reference)
            return message.reply(`Please reply to a message`);
        let roleMenu = await getRoleMenu(args.id, message.guild.id);
        if (!roleMenu) return message.reply(`Invalid role menu ID`);
        await database.run(`UPDATE role_menus SET attached_to = ? WHERE id = ?;`, message.reference, args.id);
        return message.react(`👍`);
    }
};

export default command;