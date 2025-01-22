import { PermissionsString, Role } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "getperms",
  description: "Get a list of roles that have certain permissions",
  type: "admin",
  guards: ["admin"],

  handler: async (message, { oldArgs: args }) => {
    const roles = await message.guild.roles.fetch();
    let role: [Role, string][] = [];

    roles.forEach((r) => {
      if (args[0] === "scary") {
        let scary: PermissionsString[] = [
          "Administrator",
          "ManageChannels",
          "ManageRoles",
          "BanMembers",
          "ManageGuild",
          "ManageMessages",
        ];
        for (let i in scary)
          if (r.permissions.has(scary[i])) role.push([r, scary[i]]);
      } else if (r.permissions.has(args[0] as any)) role.push([r, args[0]]);
    });

    return message.reply(
      `The following roles have that permission: ${role
        .map((x) => `${x[0].name}: ${x[1]}`)
        .join("\n")}`
    );
  },
};

export default command;
