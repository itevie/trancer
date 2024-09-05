import { Role } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createRoleMenu, createRoleMenuItem } from "../../util/actions/roleMenus";

const command: HypnoCommand = {
    name: "createrolemenusfromjson",
    type: "admin",
    adminOnly: true,

    handler: async (message, { originalContent }) => {
        let err = (msg: string) => {
            return message.reply(`Error: ${msg}`);
        };

        // Get JSON
        let json: object;
        try {
            json = JSON.parse(originalContent.replace(/```/g, "").replace(/[\r\n]/g, ""));
        } catch (e) {
            return err(`Failed to parse JSON: ${e}`);
        }

        // Validate fields
        if (!json["menus"] || !Array.isArray(json["menus"]))
            return err(`Expected menus field to be an array`);

        // Clear stuff
        await database.run(`DELETE FROM role_menu_items WHERE menu_id IN (SELECT id FROM role_menus WHERE server_id = ?)`, message.guild.id);
        await database.run(`DELETE FROM role_menus WHERE server_id = ?`, message.guild.id);

        // Loop through them
        for await (const menu of json["menus"]) {
            // Validate fields
            if (typeof menu !== "object")
                return message.reply(`Expected menu to be an object, got ${typeof menu} `);

            // Validate fields
            if (!menu["name"] || typeof menu["name"] !== "string")
                return message.reply(`Menu field "name" must be a string`);
            if (!menu["items"] || !Array.isArray(menu["items"]))
                return message.reply(`Menu field "items" must be an array`);

            // Get the items
            let items: RoleMenuItem[] = [];
            for (const item of menu["items"]) {
                // Validate fields
                if (typeof item !== "object")
                    return message.reply(`Expected item to be an object, got ${typeof item}`);
                if (!item["name"] || typeof item["name"] !== "string")
                    return message.reply(`Expected item field "name" to be a string`);
                if (items.find(x => x.name === item["name"]))
                    return message.reply(`An item with the name "${item["name"]}" already exists`);
                if (!item["emoji"] || typeof item["emoji"] !== "string")
                    return message.reply(`Expected item field "emoji" to be a string`);
                if (items.find(x => x.emoji === item["emoji"]))
                    return message.reply(`An item with the emoji "${item["emoji"]}" already exists`);
                if (!item["role"] || typeof item["role"] !== "string")
                    return message.reply(`Expected item field "role" to be a string`);

                // Try fetch role
                let role: Role;
                try {
                    role = await message.guild.roles.fetch(item["role"]);
                } catch (e) {
                    return message.reply(`Role ${item["role"]} is not a role: ${e.toString()}`);
                }

                // Add item
                items.push({
                    menu_id: 0,
                    role_id: role.id,
                    name: item["name"],
                    emoji: item["emoji"],
                    id: 0
                });
            }

            // Create the menu
            let createdMenu = await createRoleMenu(menu["name"], message.guild.id);
            for (const item of items) {
                await createRoleMenuItem(item.name, createdMenu.id, item.emoji, item.role_id);
            }
        }

        return message.reply(`Done!`);
    }
};

export default command;