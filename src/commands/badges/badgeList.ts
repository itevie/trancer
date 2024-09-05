import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getAllAquiredBadges } from "../../util/actions/badges";
import badges, { formatBadges } from "../../util/badges";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
    name: "badgelist",
    aliases: ["badgel", "bl"],
    description: "Get a list of badges",
    type: "badges",

    handler: async (message, args) => {
        let aquiredBadges = await getAllAquiredBadges();
        let text = "";

        for (let i in badges) {
            let amount = aquiredBadges.filter(x => x.badge_name === i).length;
            let theUser: User | null;
            if (amount === 1)
                theUser = await message.client.users.fetch(aquiredBadges.find(x => x.badge_name === i).user);
            text += `${badges[i].emoji} \`${badges[i].name}\` *${badges[i].description}*\n - ${amount} ${amount === 1 ? "person has" : "people have"} this${theUser ? ` (${theUser.username})` : ""}\n\n`;
        }

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`List of badges`)
                    .setDescription(text)
            ]
        });
    }
};

export default command;