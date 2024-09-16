import { TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { getAllRoleMenus, getRoleMenuByMessage, getRoleMenuItemByEmoji } from "../util/actions/roleMenus";

export async function fixRoleMenus() {
    const server = await client.guilds.fetch(config.botServer.id);
    const channel = await client.channels.fetch("1281288438074835036") as TextChannel;

    let roleMenus = await getAllRoleMenus(server.id);
    console.log(roleMenus)
    for await (const roleMenu of roleMenus) {
        console.log(roleMenu)
        let message = await channel.messages.fetch(roleMenu.attached_to);
        for await (const [_, reaction] of message.reactions.cache) {
            let item = await getRoleMenuItemByEmoji(reaction.emoji.name, roleMenu.id);
            if (!item) continue;

            for await (const [_, user] of reaction.users.cache) {
                try {
                    const member = await server.members.fetch(user.id);
                    if (!member.roles.cache.has(item.role_id)) {
                        await member.roles.add(item.role_id);
                        console.log(`Gave role ${item.role_id} to ${user.username}`);
                    }
                } catch { }
            }
        }
    }
}

client.on("messageReactionAdd", async (reaction, user) => {
    // Guards
    if (user.bot) return;

    // Try fetch the menu
    let menu = await getRoleMenuByMessage(reaction.message.id);
    if (!menu) return;

    // Try fetch the item
    let item = await getRoleMenuItemByEmoji(reaction.emoji.name, menu.id);

    // Add the role
    let server = await client.guilds.fetch(menu.server_id);
    let member = await server.members.fetch({ user: user.id, force: true });
    await member.roles.add(item.role_id);
});

client.on("messageReactionRemove", async (reaction, user) => {
    // Guards
    if (user.bot) return;

    // Try fetch the menu
    let menu = await getRoleMenuByMessage(reaction.message.id);
    if (!menu) return;

    // Try fetch the item
    let item = await getRoleMenuItemByEmoji(reaction.emoji.name, menu.id);

    // Add the role
    let server = await client.guilds.fetch(menu.server_id);
    let member = await server.members.fetch({ user: user.id, force: true });
    await member.roles.remove(item.role_id);
});
