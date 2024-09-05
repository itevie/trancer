import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import badges from "../../util/badges";
import { addBadgeFor, getAllAquiredBadges } from "../../util/actions/badges";

const command: HypnoCommand<{ badge: string, user: User }> = {
    name: "addbadge",
    type: "badges",
    description: "Give a user a badge",

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

        // Check if user already has it
        let acquiredBadges = await getAllAquiredBadges();
        if (acquiredBadges.find(x => x.user === args.user.id && x.badge_name === args.badge))
            return message.reply(`That user already has that badge!`);

        // Add badge
        await addBadgeFor(args.user.id, args.badge);
        return message.reply(`Gave **${args.user.username}** the badge **${args.badge}**!`);
    }
};

export default command;