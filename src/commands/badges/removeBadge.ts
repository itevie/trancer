import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import badges from "../../util/badges";
import { removeBadgeFor } from "../../util/actions/badges";

const command: HypnoCommand<{ badge: string, user: User }> = {
    name: "-badge",
    type: "badges",
    description: "Removes a users  badge",

    botOwnerOnly: true,

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "user",
                type: "user"
            },
            {
                name: "badge",
                type: "string"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if it exists
        if (!badges[args.badge])
            return message.reply(`That badge doesn't exist`);

        // Add badge
        await removeBadgeFor(args.user.id, args.badge);
        return message.reply(`Remove **${args.user.username}**'s **${args.badge}** badge!`);
    }
};

export default command;