import { HypnoCommand } from "../../types/command";
import { getAllEconomy } from "../../util/actions/economy";
import { createEmbed } from "../../util/other";
import config from "../../config";

const command: HypnoCommand = {
    name: "globalmoneyfromwhat",
    aliases: ["gmfw", "gmoneyfromwhat"],
    description: "Check where everyone got money from",
    type: "economy",

    handler: async (message, { args }) => {
        // Create an eco to add onto
        let currentEco: Economy = {
            from_commands: 0,
            from_gambling: 0,
            from_helping: 0,
            from_messaging: 0,
            from_vc: 0,
            balance: 0,
            user_id: "0",
            last_daily: 0,
            last_fish: 0,
        };

        let ecos = await getAllEconomy();

        // Add all the shit to it
        for (const eco of ecos) {
            currentEco.from_commands += eco.from_commands;
            currentEco.from_gambling += eco.from_gambling;
            currentEco.from_helping += eco.from_helping;
            currentEco.from_messaging += eco.from_messaging;
            currentEco.from_vc += eco.from_vc;
        }

        // Done
        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`How EVERYONE got ${config.economy.currency}`)
                    .setDescription(
                        [
                            ["Commands", currentEco.from_commands],
                            ["Gambling", currentEco.from_gambling],
                            ["Messaging", currentEco.from_messaging],
                            ["VC", currentEco.from_vc],
                            ["Helping", currentEco.from_helping]
                        ].map(x => `**${x[0]}**: ${x[1]}${config.economy.currency}`).join("\n")
                    )
            ]
        })
    }
};

export default command;