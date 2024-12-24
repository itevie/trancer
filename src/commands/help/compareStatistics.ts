import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user1: User; user2: User }> = {
  name: "comparestatistics",
  type: "help",
  aliases: ["comparestats", "statcompare"],
  description: "Compare 2 user's statistics",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user1",
        type: "user",
      },
      {
        name: "user2",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const user1: UserData = await actions.userData.getFor(
      args.user1.id,
      message.guild.id
    );
    const user2 = await actions.userData.getFor(
      args.user2.id,
      message.guild.id
    );

    let stats: [string, string][] = [];

    for (const [k, v] of Object.entries(user1)) {
      if (
        typeof v !== "number" ||
        ["allow_requests", "allow_triggers", "site_quote_opt_in"].includes(k)
      )
        continue;

      if (v === user2[k]) continue;

      if (v > user2[k])
        stats.push([k, `${args.user1.username} with **${v - user2[k]}** more`]);
      else
        stats.push([k, `${args.user2.username} with **${user2[k] - v}** more`]);
    }

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`${args.user1.username} vs ${args.user2.username}`)
          .setDescription(stats.map((x) => `**${x[0]}**: ${x[1]}`).join("\n")),
      ],
    });
  },
};

export default command;
