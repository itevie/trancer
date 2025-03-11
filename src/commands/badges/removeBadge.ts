import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import badges from "../../util/badges";
import { actions } from "../../util/database";

const command: HypnoCommand<{ badge: string; user: User }> = {
  name: "removebadge",
  type: "badges",
  description: "Removes a users  badge",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "badge",
        type: "string",
        oneOf: Object.keys(badges),
      },
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    // Check if it exists
    if (!badges[args.badge]) return message.reply(`That badge doesn't exist`);

    // Add badge
    await actions.badges.removeFor(args.user.id, args.badge);
    return message.reply(
      `Remove **${args.user.username}**'s **${args.badge}** badge!`
    );
  },
};

export default command;
