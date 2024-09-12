import { TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getRoleMenu, getRoleMenuItems, updateRoleMenuAttachedTo } from "../../util/actions/roleMenus";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ menu: number }> = {
    name: "sendrolemenu",
    description: "Sends a specific role menu",
    type: "admin",
    guards: ["admin"],

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "menu",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Fetch the menu
        let menu = await getRoleMenu(args.menu, message.guild.id);
        if (!menu)
            return message.reply(`That role menu does not exist!`);

        // Get items
        await sendRoleMenu(message.channel as TextChannel, menu);
    }
};

export default command;

export async function sendRoleMenu(channel: TextChannel, menu: RoleMenu) {
    let items = await getRoleMenuItems(menu.id);

    // Create embed
    let embed = createEmbed()
        .setTitle(menu.name)
        .setDescription(
            (menu.description ? `${menu.description}\n\n` : "")
            + items.map(x => `${x.emoji} - ${x.name}`).join("\n")
        );

    // Create message
    let menuMessage = await channel.send({
        embeds: [embed]
    });

    // Add reactions
    for (const item of items) {
        menuMessage.react(item.emoji);
    }

    await updateRoleMenuAttachedTo(menu.id, menuMessage.id);
}