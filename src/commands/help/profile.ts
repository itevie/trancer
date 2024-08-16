import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { createEmbed } from "../../util/other";
import { getImpositionFor } from "../../util/actions/imposition";
import { getAllAquiredBadgesFor } from "../../util/actions/badges";
import badges from "../../util/badges";
import { database } from "../../util/database";
import { getAllEconomy, getEconomyFor } from "../../util/actions/economy";
import config from "../../config";
import { getUserData } from "../../util/actions/userData";

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
            }
        ]
    },

    handler: async (message, args) => {
        // Get user
        let user = args.args.user ? args.args.user : message.author;

        // Get details
        const economy = await getEconomyFor(user.id);
        const userData = await getUserData(user.id, message.guild.id);
        const imposition = await getImpositionFor(user.id);
        const spiralsGiven = (await database.all(`SELECT * FROM spirals WHERE sent_by = ?`, user.id)).length;
        const aquiredBadges = (await getAllAquiredBadgesFor(user.id)).map(x => badges[x.badge_name].emoji);
        const ecoPosition = (await getAllEconomy()).sort((a, b) => b.balance - a.balance).findIndex(x => x.user_id === user.id);

        // Create embed
        const embed = createEmbed()
            .setTitle(`Profile of ${user.displayName}`)
            .setThumbnail(user.displayAvatarURL())
            .setDescription(
                [
                    ["Username", user.username],
                    ["ID", user.id],
                    ["Imposition Registered", imposition.length],
                    ["Spirals Registered", spiralsGiven],
                    ["Messages", userData?.messages_sent],
                    ["VC Time", ("" + userData?.vc_time) + " minutes"],
                    ["Bumps", userData?.bumps],
                    ["Balance", `${economy?.balance}${config.economy.currency}`],
                    ["Economy Position", `#${ecoPosition + 1}`],
                ].map(x => `**${x[0]}**: ${x[1]}`).join("\n")
            );

        if (aquiredBadges.length > 0)
            embed.addFields([
                {
                    name: "Badges",
                    value: aquiredBadges.join("")
                }
            ]);

        return message.reply({
            embeds: [embed]
        });
    }
};

export default command