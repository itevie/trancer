import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import badges from "../../util/badges";
import { actions, database } from "../../util/database";
import { calculateLevel } from "../../messageHandlers/xp";
import { createRating } from "../fun/rate";
import { currency } from "../../util/language";

const command: HypnoCommand<{ user?: User }> = {
  name: "profile",
  description: "Get yours or another person's profile",
  type: "help",

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "user",
        name: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, args) => {
    // Get user
    let user = args.args.user ? args.args.user : message.author;
    let member = await message.guild.members.fetch(user.id);

    // Get details
    const economy = await actions.eco.getFor(user.id);
    const userData = await actions.userData.getFor(user.id, message.guild.id);
    const imposition = await actions.triggers.getAllFor(user.id);
    const spiralsGiven = (
      await database.all(`SELECT * FROM spirals WHERE sent_by = ?`, user.id)
    ).length;
    const aquiredBadges = (await actions.badges.aquired.getAllFor(user.id)).map(
      (x) => badges[x.badge_name].emoji
    );
    const ecoPosition = (await actions.eco.getAll())
      .sort((a, b) => b.balance - a.balance)
      .findIndex((x) => x.user_id === user.id);

    let totalTTT = userData.ttt_lose + userData.ttt_win;
    let totalC4 = userData.c4_win + userData.c4_lose;

    // Create embed
    const embed = createEmbed()
      .setTitle(`Profile of ${user.displayName}`)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(
        [
          ["Username", user.username],
          ["ID", user.id],
          ["Joined Server", member.joinedAt.toDateString()],
          ["Status", userData.hypno_status],
          [
            "Level",
            `${calculateLevel(userData?.xp || 0)} (${userData?.xp} XP)`,
          ],
          ["Messages", userData.messages_sent],
          ["VC Time", "" + userData.vc_time + " minutes"],
          ["Bumps", userData.bumps],
          ["Balance", `${currency(economy.balance).replace(/\*/g, "")}`],
          ["Economy Position", `#${ecoPosition + 1}`],
          ["Ruined the count", `${userData.count_ruined} times`],
          ["Imposition Registered", imposition.length],
          ["Spirals Registered", spiralsGiven],
        ]
          .map((x) => `**${x[0]}**: ${x[1]}`)
          .join("\n")
      );

    let pinnedRatings = await database.all<PinnedRating[]>(
      "SELECT * FROM pinned_ratings WHERE user_id = ?;",
      user.id
    );
    if (pinnedRatings.length > 0) {
      embed.addFields([
        {
          name: `Pinned Ratings (${args.serverSettings.prefix}rate)`,
          value: pinnedRatings
            .map(
              (x) =>
                `**${x.rating}**: ${createRating(
                  user.username,
                  x.rating
                ).toFixed(0)}%`
            )
            .join("\n"),
          inline: true,
        },
      ]);
    }

    if (totalTTT > 0) {
      embed.addFields([
        {
          name: "TicTacToe",
          value: [
            ["Wins", userData.ttt_win],
            ["Loses", userData.ttt_lose],
            ["Ties", userData.ttt_tie],
            [
              "Win Rate",
              ((userData.ttt_win / totalTTT) * 100).toFixed(0) + "%",
            ],
          ]
            .map((x) => `**${x[0]}**: ${x[1]}`)
            .join("\n"),
          inline: true,
        },
      ]);
    }

    if (totalC4 > 0) {
      embed.addFields([
        {
          name: "Connect 4",
          value: [
            ["Wins", userData.c4_win],
            ["Loses", userData.c4_lose],
            ["Ties", userData.c4_tie],
            ["Win Rate", ((userData.c4_win / totalC4) * 100).toFixed(0) + "%"],
          ]
            .map((x) => `**${x[0]}**: ${x[1]}`)
            .join("\n"),
          inline: true,
        },
      ]);
    }

    if (aquiredBadges.length > 0)
      embed.addFields([
        {
          name: "Badges",
          value: aquiredBadges.join(""),
          inline: true,
        },
      ]);

    return message.reply({
      embeds: [embed],
    });
  },
};

export default command;
