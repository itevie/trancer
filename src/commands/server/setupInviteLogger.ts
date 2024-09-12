import { Channel, PermissionsBitField } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand<{ channel: Channel }> = {
    name: "setupinvitelogger",
    type: "admin",
    adminOnly: true,

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "channel",
                type: "channel",
            }
        ]
    },

    handler: async (message, { args }) => {
        if (!message.guild.members.me.permissionsIn(args.channel.id).has(PermissionsBitField.Flags.SendMessages)) {
            return message.reply(`I don't have permissions to send messages in that channel!`);
        }

        await database.run(`UPDATE server_settings SET invite_logger_channel_id = ? WHERE server_id = ?`, args.channel.id, message.guild.id);
        return message.reply(`Set the invite logged channel to <#${args.channel.id}>!`)
    }
};

export default command;