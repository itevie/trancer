import { database } from "../database";

export async function roleMenuExists(name: string, serverId: string): Promise<boolean> {
    return !!(
        await database.get(`SELECT * FROM role_menus WHERE name = ? AND server_id = ?`, name, serverId)
    );
}

export async function getRoleMenu(id: number, serverId: string): Promise<RoleMenu | null> {
    return await database.get(`SELECT * FROM role_menus WHERE id = ? AND server_id = ?`, id, serverId);
}

export async function getAllRoleMenus(serverId: string): Promise<RoleMenu[]> {
    return await database.all(`SELECT * FROM role_menus WHERE server_id = ?`, serverId);
}

export async function getRoleMenuByMessage(messageId: string): Promise<RoleMenu | null> {
    return await database.get(`SELECT * FROM role_menus WHERE attached_to = ?`, messageId);
}

export async function createRoleMenu(name: string, serverId: string): Promise<RoleMenu> {
    return await database.get<RoleMenu>(`INSERT INTO role_menus (name, server_id) VALUES (?, ?) RETURNING *;`, name, serverId);
}

export async function updateRoleMenuAttachedTo(id: number, messageId: string): Promise<void> {
    await database.run(`UPDATE role_menus SET attached_to = ? WHERE id = ?;`, messageId, id);
}

export async function roleMenuItemExists(name: string, menu: number): Promise<boolean> {
    return !!(
        await database.get(`SELECT * FROM role_menu_items WHERE name = ? AND menu_id = ?`, name, menu)
    );
}

export async function createRoleMenuItem(name: string, menu: number, emoji: string, roleId: string): Promise<RoleMenuItem> {
    return await database.get<RoleMenuItem>(
        `INSERT INTO role_menu_items (name, menu_id, emoji, role_id) VALUES (?, ?, ?, ?) RETURNING *;`,
        name,
        menu,
        emoji,
        roleId
    );
}

export async function getRoleMenuItems(menu: number): Promise<RoleMenuItem[]> {
    return await database.all(`SELECT * FROM role_menu_items WHERE menu_id = ?`, menu);
}

export async function getRoleMenuItemByEmoji(emoji: string, menu: number): Promise<RoleMenuItem> {
    return await database.get(`SELECT * FROM role_menu_items WHERE emoji = ? AND menu_id = ?`, emoji, menu);
}