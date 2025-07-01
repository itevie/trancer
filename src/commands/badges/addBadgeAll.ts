import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { b } from "../../util/language";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ badge: string; global?: boolean }> = {
  name: "givebadgetoall",
  type: "badges",
  description: "Give a badge to all users",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "badge",
      },
      {
        type: "boolean",
        name: "global",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let users: string[];
    if (!args.global) {
      users = (await message.guild.members.fetch()).map((x) => x.id);
    } else {
      users = (await actions.eco.getAll()).map((x) => x.user_id);
    }

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Are you sure?`)
        .setDescription(
          `Are you sure you want to give ${b(args.badge)} to ${b(users.length)} people?`,
        ),
      callback: async () => {
        for await (const user of users) {
          await actions.badges.addFor(user, args.badge);
        }

        return {
          content: `Gave ${b(args.badge)} to ${b(users.length)} users!`,
          embeds: [],
        };
      },
    });
  },
};

export default command;
