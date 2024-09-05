import { HypnoCommand } from "../../types/util";
import { createRoleMenu, roleMenuExists } from "../../util/actions/roleMenus";

const command: HypnoCommand<{ name: string }> = {
    name: "createrolemenu",
    aliases: ["+rolemenu"],
    description: "Registers a new role menu",
    type: "admin",
    adminOnly: true,

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "name",
                type: "string"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if it exists
        if (await roleMenuExists(args.name, message.guild.id))
            return message.reply(`A role menu with that name already exists!`);

        // Create it
        let menu = await createRoleMenu(args.name, message.guild.id);

        // Done
        return message.reply(`Role menu has been created! It's ID is **${menu.id}**`);
    }
};

export default command;