import { Message, MessageReaction, PartialMessage, PartialMessageReaction, TextChannel, User } from "discord.js";
import { client } from "..";
import { getRoleMenuByMessage, getRoleMenuItemByEmoji } from "../util/actions/roleMenus";
import { createStarboardMessage, getStarboardFor, getStarboardMessage } from "../util/actions/starboard";

client.on("messageReactionAdd", async (reaction, user) => {
    // Guards
    if (user.bot) return;

    await updateStarboard(reaction, reaction.message);

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

    await updateStarboard(reaction, reaction.message);

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

async function updateStarboard(reaction: MessageReaction | PartialMessageReaction, message: Message | PartialMessage) {
    // Check for starboard
    let starboard = await getStarboardFor(message.guild.id);
    let count = message.reactions.cache.find(x => x?.emoji?.name === starboard.emoji)?.count ?? -1;
    if (count === -1) return;

    if (starboard && reaction.emoji.name === starboard.emoji) {
        let _message = await getStarboardMessage(message.id);
        if (!_message) {
            // Check if to create
            if (count >= starboard.minimum) {
                await createStarboardMessage(message, reaction.count);
            }
        } else {
            // Fetch the messages (actual message & message posted in starboard)
            let starboardChannel = await reaction.client.channels.fetch(starboard.channel_id) as TextChannel;
            let actualMessage = _message.message_id === message.id
                ? message
                : await starboardChannel.messages.fetch(_message.message_id);
            let starBoardMessage = _message.star_board_message_id === message.id
                ? message
                : await (await message.guild.channels.fetch(starboard.channel_id) as TextChannel).messages.fetch(_message.star_board_message_id);

            // Get list of reactions
            let amReactions = actualMessage.reactions.cache.find(x => x.emoji.name === starboard.emoji);
            let stReactions = starBoardMessage.reactions.cache.find(x => x.emoji.name === starboard.emoji);

            // Accumulate them
            let users: User[] = [];
            for (const [_, user] of amReactions.users.cache)
                if (!users.find(x => x.id === user.id)) users.push(user);
            for (const [_, user] of stReactions.users.cache)
                if (!users.find(x => x.id === user.id)) users.push(user);
            users = users.filter(x => !x.bot);

            // Update
            await starBoardMessage.edit({
                content: `${starboard.emoji} ${users.length} | <#${actualMessage.channel.id}>`
            });
        }
    }
}