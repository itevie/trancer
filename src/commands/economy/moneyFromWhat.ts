import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { getEconomyFor } from "../../util/actions/economy";
import { createEmbed } from "../../util/other";
import config from "../../config";

const command: HypnoCommand<{ user?: User }> = {
    name: "moneyfromwhat",
    description: "Check where you got your money from",
    type: "economy",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            }
        ]
    },

    handler: async (message, { args }) => {
        let user = args.user ? args.user : message.author;
        let eco = await getEconomyFor(user.id);

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`How ${user.username} got ${config.economy.currency}`)
                    .setDescription(
                        [
                            ["Commands", eco.from_commands],
                            ["Gambling", eco.from_gambling],
                            ["Messaging", eco.from_messaging],
                            ["VC", eco.from_vc],
                            ["Helping", eco.from_helping]
                        ].map(x => `**${x[0]}**: ${x[1]}${config.economy.currency}`).join("\n")
                    )
            ]
        })
    }
};

export default command;