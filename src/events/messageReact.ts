import { client } from "..";
import { getRoleMenuByMessage, getRoleMenuItemByEmoji } from "../util/actions/roleMenus";

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