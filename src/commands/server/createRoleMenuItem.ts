import { Role, TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createRoleMenuItem, getRoleMenu, roleMenuItemExists } from "../../util/actions/roleMenus";
import { sendRoleMenu } from "./sendRoleMenu";

const command: HypnoCommand<{ menu: number, name: string, emoji: string, role: Role }> = {
    name: "createrolemenuitem",
    description: "Creates a new react role menu",
    aliases: ["+roleitem", "+rolemenuitem", "createroleitem"],
    type: "admin",
    guards: ["admin"],

    args: {
        requiredArguments: 4,
        args: [
            {
                name: "menu",
                type: "wholepositivenumber",
            },
            {
                name: "name",
                type: "string"
            },
            {
                name: "emoji",
                type: "string"
            },
            {
                name: "role",
                type: "role"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Validate the role menu
        let menu = await getRoleMenu(args.menu, message.guild.id);
        if (!menu)
            return message.reply(`A role menu with the ID ${args.menu} does not exist`);

        // Check if the role menu item exists
        if (await roleMenuItemExists(args.name, menu.id))
            return message.reply(`A role item with that name already exists on that menu!`);

        // Create it 
        let item = await createRoleMenuItem(args.name, menu.id, args.emoji, args.role.id);

        let channel = await message.guild.channels.fetch("1257417208024268850") as TextChannel;
        if (menu.attached_to)
            await sendRoleMenu(channel, menu, await channel.messages.fetch(menu.attached_to));

        return message.reply(`The role item has been created! It's ID is **${item.id}**`);
    }
};

export default command;