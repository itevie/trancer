import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { addMoneyFor, getEconomyFor } from "../../util/actions/economy";
import { database } from "../../util/database";
import { calculateRequirementFromDate, generateDawnagotchiEmbed } from "../../util/dawnagotchi";
import { randomFromRange } from "../../util/other";

const command: HypnoCommand<{ type?: string }> = {
    name: "dawnaction",
    type: "dawnagotchi",
    aliases: ["feed", "water", "play"],

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "type",
                type: "string",
                oneOf: ["feed", "water", "play"]
            }
        ]
    },

    handler: async (message, { command, args }) => {
        // Collect wanted action
        let action = (args.type ? args.type : command) as "feed" | "water" | "play";
        if (!["feed", "water", "play"].includes(action))
            return message.reply(`Invalid action!`);

        // Get the dawn
        let dawn = await getDawnagotchi(message.author.id);
        if (!dawn) return message.reply(`You do not have a Dawn!`);

        let economy = await getEconomyFor(message.author.id);

        // Get details
        let timeAdd = config.dawnagotchi.actions[action].timeAdd;
        let dbAction = { feed: "next_feed", water: "next_drink", play: "next_play" }[action];
        let englishAction = { feed: "eat", water: "drink", play: "play"[action] };
        let current = dawn[dbAction] as Date;
        let requirement = calculateRequirementFromDate(current);

        // Check if already too much
        if (requirement > 90)
            return message.reply(`Your Dawn does not need to **${englishAction}** right now!`);

        // Add the time add
        await database.run(`UPDATE dawnagotchi SET ${dbAction} = ? WHERE owner_id = ?`, current.getTime() + timeAdd, message.author.id);

        // Check if should give money
        if (config.economy.dawn.limit - (Date.now() - economy.last_dawn_care) < 0) {
            await database.run(`UPDATE economy SET last_dawn_care = ? WHERE user_id = ?`, Date.now(), message.author.id);
            await addMoneyFor(message.author.id, randomFromRange(config.economy.dawn.min, config.economy.dawn.max), "commands");
        }

        // Done
        return message.reply({
            embeds: [
                generateDawnagotchiEmbed(await getDawnagotchi(message.author.id))
            ]
        })
    }
};

export default command;