import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import badges from "../../util/badges";
import { actions } from "../../util/database";

const command: HypnoCommand<{ badge: string; user: User }> = {
  name: "addbadge",
  type: "badges",
  description: "Give a user a badge",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "badge",
        type: "string",
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

    // Check if user already has it
    let acquiredBadges = await actions.badges.aquired.getAll();
    if (
      acquiredBadges.find(
        (x) => x.user === args.user.id && x.badge_name === args.badge
      )
    )
      return message.reply(`That user already has that badge!`);

    // Add badge
    await actions.badges.addFor(args.user.id, args.badge);
    return message.reply(
      `Gave **${args.user.username}** the badge **${args.badge}**!`
    );
  },
};

export default command;
