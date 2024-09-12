import { Channel, PermissionsBitField } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { setupStarboard } from "../../util/actions/starboard";

const command: HypnoCommand<{ channel: Channel }> = {
    name: "setupstarboard",
    type: "admin",
    description: "Setup starboard in a channel",
    guards: ["admin"],

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "channel",
                type: "channel",
                description: "The channel messages should be posted in"
            }
        ]
    },

    handler: async (message, { args }) => {
        if (!message.guild.members.me.permissionsIn(args.channel.id).has(PermissionsBitField.Flags.SendMessages)) {
            return message.reply(`I don't have permissions to send messages in that channel!`);
        }

        let starboard = await setupStarboard(message.guild.id, args.channel.id);
        return message.reply(
            `Messages that are star'd will be posted in <#${args.channel.id}>!\n`
            + `\nStarboard Emoji: ${starboard.emoji}\nStars to send: ${starboard.minimum}`
        );
    }
};

export default command;