import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { getImpositionFor } from "../../util/actions/imposition";
import { getAllAquiredBadgesFor } from "../../util/actions/badges";
import badges from "../../util/badges";
import { database } from "../../util/database";
import { getAllEconomy, getEconomyFor } from "../../util/actions/economy";
import config from "../../config";
import { getUserData } from "../../util/actions/userData";
import { calculateLevel } from "../../messageHandlers/xp";
import { createRating } from "../fun/rate";

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
    const economy = await getEconomyFor(user.id);
    const userData = await getUserData(user.id, message.guild.id);
    const imposition = await getImpositionFor(user.id);
    const spiralsGiven = (
      await database.all(`SELECT * FROM spirals WHERE sent_by = ?`, user.id)
    ).length;
    const aquiredBadges = (await getAllAquiredBadgesFor(user.id)).map(
      (x) => badges[x.badge_name].emoji
    );
    const ecoPosition = (await getAllEconomy())
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
          [
            "Level",
            `${calculateLevel(userData?.xp || 0)} (${userData?.xp} XP)`,
          ],
          ["Messages", userData.messages_sent],
          ["VC Time", "" + userData.vc_time + " minutes"],
          ["Bumps", userData.bumps],
          ["Balance", `${economy?.balance}${config.economy.currency}`],
          ["Economy Position", `#${ecoPosition + 1}`],
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
        },
      ]);
    }

    if (aquiredBadges.length > 0)
      embed.addFields([
        {
          name: "Badges",
          value: aquiredBadges.join(""),
        },
      ]);

    return message.reply({
      embeds: [embed],
    });
  },
};

export default command;
