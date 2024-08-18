import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { database } from "../../util/database";
import { awardMoneyForCaringForDawn, calculateRequirementFromDate, generateDawnagotchiEmbed } from "../../util/dawnagotchi";

const command: HypnoCommand = {
    name: "water",
    type: "dawnagotchi",
    description: "Water your Dawn",

    handler: async (message) => {
        // Check if they have a Dawn
        let dawn = await getDawnagotchi(message.author.id);
        if (!dawn) return message.reply(`You don't have a Dawn!`);

        // Check if allowed to feed
        let requirement = calculateRequirementFromDate(dawn.next_drink);

        if (requirement >= 100)
            return message.reply(`Your Dawn does not need watering!`);

        // Add the stuff
        await database.run(
            `UPDATE dawnagotchi SET next_drink = next_drink + ? WHERE owner_id = ?`,
            config.dawnagotchi.actions.water.timeAdd,
            message.author.id
        );;

        let money = await awardMoneyForCaringForDawn(dawn);

        // Done
        return message.reply({
            content: money ? `You got **${money}${config.economy.currency}** ` : "",
            embeds: [
                generateDawnagotchiEmbed(await getDawnagotchi(message.author.id))
            ]
        })

    }
};

export default command;